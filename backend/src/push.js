const prisma = require('./db');

// Web Push com VAPID. Carrega a lib so quando precisa e degrada com graca:
// sem VAPID_PUBLIC/VAPID_PRIVATE (ou sem a lib), o push fica desativado.
let webpush; // undefined = nao tentou ainda; false = indisponivel
function init() {
  if (webpush !== undefined) return webpush;
  let lib;
  try { lib = require('web-push'); } catch (e) { webpush = false; return false; }
  const pub = process.env.VAPID_PUBLIC;
  const priv = process.env.VAPID_PRIVATE;
  if (!pub || !priv) { webpush = false; return false; }
  lib.setVapidDetails('mailto:' + (process.env.CONTACT_EMAIL || 'contato@supribox.app'), pub, priv);
  webpush = lib;
  return webpush;
}

function disponivel() {
  return Boolean(init());
}

// Envia uma notificacao para todas as inscricoes. Remove as que morreram.
async function enviarPushTodos(payload) {
  const wp = init();
  if (!wp) return { enviados: 0, removidos: 0, indisponivel: true };

  const subs = await prisma.pushSub.findMany();
  const data = JSON.stringify(payload);
  let enviados = 0;
  let removidos = 0;

  for (const s of subs) {
    try {
      await wp.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, data);
      enviados += 1;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) {
        await prisma.pushSub.delete({ where: { id: s.id } }).catch(() => {});
        removidos += 1;
      }
    }
  }
  return { enviados, removidos };
}

module.exports = { init, disponivel, enviarPushTodos };
