const express = require('express');
const prisma = require('../db');
const { disponivel, enviarPushTodos } = require('../push');

const router = express.Router();

// GET /push/key -> chave publica VAPID pro frontend assinar
router.get('/key', (_req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC || '', ativo: disponivel() });
});

// POST /push/subscribe -> salva/atualiza a inscricao de um dispositivo
// body: PushSubscription.toJSON() -> { endpoint, keys: { p256dh, auth } }
router.post('/subscribe', async (req, res) => {
  try {
    const s = req.body || {};
    if (!s.endpoint || !s.keys || !s.keys.p256dh || !s.keys.auth) {
      return res.status(400).json({ erro: 'Inscricao invalida.' });
    }
    await prisma.pushSub.upsert({
      where: { endpoint: s.endpoint },
      update: { p256dh: s.keys.p256dh, auth: s.keys.auth },
      create: { endpoint: s.endpoint, p256dh: s.keys.p256dh, auth: s.keys.auth },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('push subscribe', e);
    res.status(500).json({ erro: 'Falha ao inscrever.' });
  }
});

// POST /push/test -> teste manual (admin)
router.post('/test', async (req, res) => {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.headers['x-admin-token'] !== token) {
    return res.status(403).json({ erro: 'Acesso negado.' });
  }
  const r = await enviarPushTodos({ title: 'SupriBox', body: 'Teste de notificacao ✦', url: '/' });
  res.json({ ok: true, ...r });
});

module.exports = router;
