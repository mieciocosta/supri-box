const prisma = require('../db');
const { sortear } = require('../sorteio');
const { enviarWhatsapp, formatarCaixinha } = require('../whatsapp');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Inicio do dia atual no fuso de Brasilia (UTC-3), como Date em UTC.
// 00:00 BRT == 03:00 UTC. Usado pra deduplicar a entrega por dia.
function inicioDiaBR(date = new Date()) {
  const br = new Date(date.getTime() - 3 * 60 * 60 * 1000); // desloca pra BRT
  const dia = br.toISOString().slice(0, 10); // YYYY-MM-DD
  return new Date(dia + 'T03:00:00.000Z');
}

// Hora atual (0-23) no fuso de Brasilia.
function horaBR(date = new Date()) {
  return new Date(date.getTime() - 3 * 60 * 60 * 1000).getUTCHours();
}

function saudacao(u) {
  if (!u.nome) return '';
  const primeiro = u.nome.trim().split(/\s+/)[0];
  return `Oi, ${primeiro} ✦\n\n`;
}

// Dispara a mensagem do dia para todos os assinantes ativos no WhatsApp.
// Idempotente por dia: quem ja recebeu hoje (canal whatsapp) e pulado
// (a menos que forcar=true). Tambem expira assinaturas vencidas.
async function dispararDiaria({ forcar = false } = {}) {
  const agora = new Date();
  const inicio = inicioDiaBR(agora);

  // housekeeping: assinaturas vencidas saem do ar
  await prisma.usuario.updateMany({
    where: { assinaturaAtiva: true, assinaturaAte: { lt: agora } },
    data: { assinaturaAtiva: false },
  });

  const ativos = await prisma.usuario.findMany({
    where: { assinaturaAtiva: true, whatsapp: { not: null } },
  });
  const itens = await prisma.conteudo.findMany({ where: { ativo: true } });

  let enviados = 0;
  let pulados = 0;
  let erros = 0;

  for (const u of ativos) {
    try {
      if (!forcar) {
        const jaHoje = await prisma.entrega.count({
          where: { usuarioId: u.id, canal: 'whatsapp', createdAt: { gte: inicio } },
        });
        if (jaHoje > 0) { pulados += 1; continue; }
      }

      // evita repetir as 12 ultimas mensagens daquele usuario
      const recentes = await prisma.entrega.findMany({
        where: { usuarioId: u.id },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: { conteudoId: true },
      });
      const escolhido = sortear(itens, u.perfil, recentes.map((e) => e.conteudoId));
      if (!escolhido) { pulados += 1; continue; }

      await enviarWhatsapp(u.whatsapp, saudacao(u) + formatarCaixinha(escolhido));
      await prisma.entrega.create({
        data: { conteudoId: escolhido.id, usuarioId: u.id, canal: 'whatsapp' },
      });
      enviados += 1;
      await wait(250); // gentil com o limite da Z-API
    } catch (e) {
      console.error('[entrega diaria] erro no usuario', u.id, e.message);
      erros += 1;
    }
  }

  console.log(`[entrega diaria] ativos=${ativos.length} enviados=${enviados} pulados=${pulados} erros=${erros}`);
  return { total: ativos.length, enviados, pulados, erros };
}

// Agenda a proxima execucao no horario DELIVERY_HOUR (BRT, padrao 8h) e
// se reagenda sozinha todo dia. Ao subir, faz um "catch-up" se ja passou da
// hora hoje (idempotente -> nao reenvia pra quem ja recebeu).
function agendarDiaria() {
  if (process.env.ENTREGA_DIARIA === 'off') {
    console.log('[entrega diaria] desativada (ENTREGA_DIARIA=off)');
    return;
  }
  const hora = Math.min(23, Math.max(0, Number(process.env.DELIVERY_HOUR || 8)));

  const agora = new Date();
  const alvo = new Date(agora);
  alvo.setUTCHours(hora + 3, 0, 0, 0); // hora BRT -> UTC
  if (alvo <= agora) alvo.setUTCDate(alvo.getUTCDate() + 1);
  const ms = alvo - agora;

  const t = setTimeout(async () => {
    try { await dispararDiaria(); } catch (e) { console.error('[entrega diaria] agenda', e); }
    agendarDiaria();
  }, ms);
  if (t.unref) t.unref();
  console.log(`[entrega diaria] proxima as ${hora}h BRT (em ${Math.round(ms / 60000)} min)`);

  // catch-up: se ja passou da hora hoje, tenta entregar agora (idempotente)
  if (horaBR(agora) >= hora) {
    dispararDiaria().catch((e) => console.error('[entrega diaria] catch-up', e));
  }
}

module.exports = { dispararDiaria, agendarDiaria };
