const express = require('express');
const prisma = require('../db');
const { criarPix, consultarPix } = require('../mercadopago');
const { ativarPorMpPaymentId } = require('../services/assinaturaService');

const router = express.Router();

// ====== Mercado Pago Pix ======
// .env: MP_ACCESS_TOKEN
// Doc: POST https://api.mercadopago.com/v1/payments  (payment_method_id: "pix")
//
// Modelo de receita: 1 centavo = isca ("primeira caixinha"); o lucro vem da
// ASSINATURA recorrente (ver rotas /assinatura). Aqui ficam cobrancas avulsas
// (ex.: caixa premium) e o WEBHOOK central do Mercado Pago.

// POST /pagamento/pix  body: { valor, descricao, usuarioId?, email? }
// Cobranca Pix avulsa (nao recorrente). Registra o pagamento pra rastreio.
router.post('/pix', async (req, res) => {
  try {
    const { valor = 0.01, descricao = 'Caixinha SupriBox', email, usuarioId } = req.body;

    const pix = await criarPix({
      valor,
      descricao,
      email,
      metadata: { usuarioId: usuarioId || null, tipo: 'avulso' },
    });

    await prisma.pagamento.create({
      data: {
        usuarioId: usuarioId ? Number(usuarioId) : null,
        mpPaymentId: pix.id ? String(pix.id) : null,
        tipo: 'avulso',
        valor: Number(valor),
        status: 'pendente',
        qrCode: pix.qrCode || null,
        qrCodeBase64: pix.qrCodeBase64 || null,
      },
    });

    res.json({
      id: pix.id,
      status: pix.status,
      stub: Boolean(pix.stub),
      qr_code: pix.qrCode,
      qr_code_base64: pix.qrCodeBase64,
    });
  } catch (err) {
    console.error('pix erro:', err);
    res.status(500).json({ erro: 'Falha ao gerar Pix.' });
  }
});

// POST /pagamento/webhook  -> Mercado Pago notifica mudanca de pagamento.
// Consulta o pagamento; se aprovado, ativa a assinatura ligada a ele.
router.post('/webhook', async (req, res) => {
  try {
    const paymentId = req.body?.data?.id || req.query.id || req.query['data.id'];
    if (!paymentId) return res.sendStatus(200);

    const pay = await consultarPix(paymentId);
    if (pay && pay.status === 'approved') {
      await ativarPorMpPaymentId(paymentId);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('mp webhook erro:', err);
    res.sendStatus(200); // sempre 200 pro MP nao reenfileirar infinitamente
  }
});

module.exports = router;
