const express = require('express');
const prisma = require('../db');

const router = express.Router();

// ====== Mercado Pago Pix ======
// .env: MP_ACCESS_TOKEN
// Doc: POST https://api.mercadopago.com/v1/payments  (payment_method_id: "pix")
//
// Modelo de receita: 1 centavo = isca ("primeira caixinha"); o lucro vem da
// ASSINATURA recorrente. Aqui criamos uma cobranca Pix avulsa (ex.: caixa premium).

// POST /pagamento/pix  body: { valor, descricao, usuarioId?, email? }
router.post('/pix', async (req, res) => {
  try {
    const { valor = 0.01, descricao = 'Caixinha SupriBox', email = 'cliente@email.com', usuarioId } = req.body;
    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
      // stub: devolve uma cobranca fake pra dev
      return res.json({
        stub: true,
        id: 'fake-' + Date.now(),
        valor,
        qr_code: '00020126...PIX-COPIA-E-COLA-FAKE',
        aviso: 'Defina MP_ACCESS_TOKEN no .env para gerar Pix real.',
      });
    }

    const resp = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Idempotency-Key': `supri-${usuarioId || 'anon'}-${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        description: descricao,
        payment_method_id: 'pix',
        payer: { email },
        metadata: { usuarioId: usuarioId || null },
      }),
    });
    const data = await resp.json();

    res.json({
      id: data.id,
      status: data.status,
      qr_code: data.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
    });
  } catch (err) {
    console.error('pix erro:', err);
    res.status(500).json({ erro: 'Falha ao gerar Pix.' });
  }
});

// POST /pagamento/webhook  -> Mercado Pago notifica pagamento aprovado.
// Quando aprovado, ative a assinatura do usuario.
router.post('/webhook', async (req, res) => {
  try {
    const paymentId = req.body?.data?.id || req.query.id;
    const token = process.env.MP_ACCESS_TOKEN;
    if (!paymentId || !token) return res.sendStatus(200);

    const resp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const pay = await resp.json();

    if (pay.status === 'approved' && pay.metadata?.usuarioId) {
      const ate = new Date();
      ate.setDate(ate.getDate() + 30);
      await prisma.usuario.update({
        where: { id: Number(pay.metadata.usuarioId) },
        data: { assinaturaAtiva: true, assinaturaAte: ate },
      });
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('mp webhook erro:', err);
    res.sendStatus(200);
  }
});

module.exports = router;
