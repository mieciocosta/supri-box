// ====== Z-API: envio de mensagem no WhatsApp ======
// Preencha no .env: ZAPI_INSTANCE, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN.
// Sem credenciais, roda em modo stub (loga no console).

async function enviarWhatsapp(phone, message) {
  const { ZAPI_INSTANCE, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN } = process.env;
  if (!ZAPI_INSTANCE || !ZAPI_TOKEN) {
    console.log(`[Z-API stub] -> ${phone}: ${message}`);
    return;
  }
  const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Client-Token': ZAPI_CLIENT_TOKEN || '' },
    body: JSON.stringify({ phone, message }),
  });
}

// Formata uma caixinha pra mensagem do WhatsApp.
function formatarCaixinha(c) {
  let txt = c.emoji ? `${c.emoji}\n\n` : '';
  txt += `*${c.texto}*`;
  if (c.referencia) txt += `\n\n_— ${c.referencia}_`;
  txt += `\n\n📦 _Sua próxima caixinha amanhã. Responda *PARAR* pra sair._`;
  return txt;
}

module.exports = { enviarWhatsapp, formatarCaixinha };
