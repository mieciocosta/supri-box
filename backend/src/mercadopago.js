// ====== Helper Mercado Pago (Pix) ======
// Centraliza a criacao de cobrancas Pix e a consulta de status.
// Sem MP_ACCESS_TOKEN, roda em modo STUB: devolve um QR fake pra dev/testes,
// e o pagamento pode ser "aprovado" manualmente via /assinatura/:id/confirmar-stub.

const MP_BASE = 'https://api.mercadopago.com/v1/payments';

function temToken() {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

// Cria uma cobranca Pix. Retorna { id, status, qrCode, qrCodeBase64, stub }.
async function criarPix({ valor, descricao, email, metadata = {} }) {
  const token = process.env.MP_ACCESS_TOKEN;

  if (!token) {
    return {
      stub: true,
      id: 'stub-' + Date.now(),
      status: 'pending',
      qrCode: '00020126SUPRIBOX-PIX-COPIA-E-COLA-FAKE-' + Math.random().toString(36).slice(2, 10),
      qrCodeBase64: null,
    };
  }

  const resp = await fetch(MP_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Idempotency-Key': `supri-${metadata.assinaturaId || metadata.usuarioId || 'anon'}-${Date.now()}`,
    },
    body: JSON.stringify({
      transaction_amount: Number(valor),
      description: descricao,
      payment_method_id: 'pix',
      payer: { email: email || 'cliente@supribox.app' },
      metadata,
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Mercado Pago ${resp.status}: ${JSON.stringify(data)}`);
  }

  const tx = data.point_of_interaction?.transaction_data || {};
  return {
    stub: false,
    id: String(data.id),
    status: data.status,
    qrCode: tx.qr_code || null,
    qrCodeBase64: tx.qr_code_base64 || null,
  };
}

// Consulta um pagamento no Mercado Pago. Retorna o objeto cru da API.
async function consultarPix(mpPaymentId) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return null;
  const resp = await fetch(`${MP_BASE}/${mpPaymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return null;
  return resp.json();
}

module.exports = { criarPix, consultarPix, temToken };
