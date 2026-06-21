const prisma = require('../db');
const { enviarWhatsapp } = require('../whatsapp');

// Ativa a assinatura ligada a um pagamento aprovado: marca o pagamento como
// aprovado, coloca a assinatura como "ativa" pelo periodo do plano, atualiza o
// usuario e manda a mensagem de boas-vindas no WhatsApp.
// Idempotente: se o pagamento ja estiver aprovado, nao faz nada.
async function ativarPagamento(pagamento) {
  if (!pagamento || pagamento.status === 'aprovado') return pagamento;

  const atualizado = await prisma.pagamento.update({
    where: { id: pagamento.id },
    data: { status: 'aprovado' },
  });

  if (!atualizado.assinaturaId) return atualizado;

  const assinatura = await prisma.assinatura.findUnique({
    where: { id: atualizado.assinaturaId },
    include: { plano: true, usuario: true },
  });
  if (!assinatura) return atualizado;

  const inicio = new Date();
  const expiraEm = new Date(inicio);
  expiraEm.setDate(expiraEm.getDate() + (assinatura.plano?.periodoDias || 30));

  await prisma.assinatura.update({
    where: { id: assinatura.id },
    data: { status: 'ativa', inicio, expiraEm },
  });

  await prisma.usuario.update({
    where: { id: assinatura.usuarioId },
    data: { assinaturaAtiva: true, assinaturaAte: expiraEm },
  });

  if (assinatura.usuario?.whatsapp) {
    const nome = assinatura.usuario.nome ? `, ${assinatura.usuario.nome}` : '';
    await enviarWhatsapp(
      assinatura.usuario.whatsapp,
      `🎉 *Bem-vindo(a) ao SupriBox${nome}!*\n\nSua assinatura *${assinatura.plano?.nome || ''}* está ativa. ` +
        `A partir de amanhã você recebe sua caixinha surpresa todo dia por aqui. ✨\n\n` +
        `_Quer adiantar? Manda *quero* que eu te mando uma agora._`
    );
  }

  return atualizado;
}

// Localiza o pagamento pelo id do Mercado Pago e ativa.
async function ativarPorMpPaymentId(mpPaymentId) {
  const pagamento = await prisma.pagamento.findUnique({ where: { mpPaymentId: String(mpPaymentId) } });
  if (!pagamento) return null;
  return ativarPagamento(pagamento);
}

module.exports = { ativarPagamento, ativarPorMpPaymentId };
