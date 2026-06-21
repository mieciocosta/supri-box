const express = require('express');
const prisma = require('../db');
const { sortear } = require('../sorteio');
const { enviarWhatsapp, formatarCaixinha } = require('../whatsapp');

const router = express.Router();

// POST /webhook/zapi  -> recebe mensagens do WhatsApp
// O payload da Z-API traz phone + texto. Aqui: identifica perfil (padrao adulto),
// sorteia uma caixinha, registra entrega e responde.
router.post('/zapi', async (req, res) => {
  try {
    const body = req.body || {};
    const phone = body.phone || body.from;
    const texto = (body.text?.message || body.message || '').trim();

    // ignora mensagens enviadas por nos mesmos
    if (body.fromMe) return res.sendStatus(200);
    if (!phone) return res.sendStatus(200);

    // upsert do usuario
    let usuario = await prisma.usuario.findUnique({ where: { whatsapp: phone } });
    if (!usuario) {
      usuario = await prisma.usuario.create({ data: { whatsapp: phone, perfil: 'adulto' } });
    }

    // comandos simples
    const cmd = texto.toLowerCase();
    if (cmd === 'parar') {
      await enviarWhatsapp(phone, 'Tudo bem! Você não receberá mais caixinhas. Quando quiser voltar, é só mandar *oi* 💛');
      return res.sendStatus(200);
    }
    if (cmd.includes('jovem')) { usuario = await prisma.usuario.update({ where: { id: usuario.id }, data: { perfil: 'jovem' } }); }
    if (cmd.includes('paz') || cmd.includes('versic')) { usuario = await prisma.usuario.update({ where: { id: usuario.id }, data: { perfil: 'idoso' } }); }

    const itens = await prisma.conteudo.findMany({ where: { ativo: true } });
    const recentes = await prisma.entrega.findMany({
      where: { usuarioId: usuario.id }, orderBy: { createdAt: 'desc' }, take: 12, select: { conteudoId: true },
    });
    const escolhido = sortear(itens, usuario.perfil, recentes.map((e) => e.conteudoId));

    if (escolhido) {
      await prisma.entrega.create({ data: { conteudoId: escolhido.id, usuarioId: usuario.id, canal: 'whatsapp' } });
      await enviarWhatsapp(phone, formatarCaixinha(escolhido));
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('webhook erro:', err);
    res.sendStatus(200); // sempre 200 pra Z-API nao reenfileirar
  }
});

module.exports = router;
