const path = require('path');
const express = require('express');
const cors = require('cors');

const caixinha = require('./routes/caixinha');
const conteudos = require('./routes/conteudos');
const usuarios = require('./routes/usuarios');
const webhook = require('./routes/webhook');
const pagamento = require('./routes/pagamento');
const assinatura = require('./routes/assinatura');
const push = require('./routes/push');
const { dispararDiaria, agendarDiaria } = require('./services/entregaDiaria');

const app = express();

app.set('trust proxy', 1); // Railway fica atras de proxy -> habilita req.ip / x-forwarded-for
app.use(cors());
app.use(express.json({ limit: '16kb' })); // corpo pequeno -> evita payloads abusivos

// cabecalhos de seguranca basicos (sem dependencia)
app.use((_req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('X-DNS-Prefetch-Control', 'off');
  next();
});

// rate limit simples em memoria (protege rotas de escrita de abuso/spam)
const hits = new Map();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || 'x';
    const now = Date.now();
    const rec = hits.get(ip) || { c: 0, t: now };
    if (now - rec.t > windowMs) { rec.c = 0; rec.t = now; }
    rec.c += 1; hits.set(ip, rec);
    if (rec.c > max) return res.status(429).json({ erro: 'Muitas tentativas. Tente de novo em instantes.' });
    next();
  };
}
// limpeza periodica do mapa pra nao crescer sem limite
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (now - v.t > 600000) hits.delete(k);
}, 600000).unref();

// health check (Railway aponta o healthcheck pra ca)
app.get('/health', (_req, res) => res.json({ app: 'SupriBox', status: 'ok' }));
// marcador de versao -> permite confirmar qual build esta no ar
app.get('/version', (_req, res) => res.json({ versao: 'v6-categorias-splash-2026-06-21', tipos: 7 }));

// disparo manual da entrega diaria (teste). Protegido por ADMIN_TOKEN.
// uso: POST /admin/entrega-diaria  header: x-admin-token: <ADMIN_TOKEN>
//      ?forcar=1 reenvia mesmo pra quem ja recebeu hoje.
app.post('/admin/entrega-diaria', async (req, res) => {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.headers['x-admin-token'] !== token) {
    return res.status(403).json({ erro: 'Acesso negado.' });
  }
  try {
    const r = await dispararDiaria({ forcar: req.query.forcar === '1' });
    res.json({ ok: true, ...r });
  } catch (e) {
    console.error('admin entrega-diaria', e);
    res.status(500).json({ erro: 'Falha ao disparar.' });
  }
});

// API (rotas de escrita com limite mais apertado)
app.use('/caixinha', rateLimit(120, 60000), caixinha);
app.use('/conteudos', conteudos);
app.use('/usuarios', rateLimit(20, 60000), usuarios);
app.use('/webhook', webhook);
app.use('/pagamento', rateLimit(60, 60000), pagamento);
app.use('/assinatura', rateLimit(20, 60000), assinatura);
app.use('/push', rateLimit(60, 60000), push);

// Digital Asset Links — prova a posse do dominio pro app TWA (Google Play),
// pra ele abrir em tela cheia sem a barra de URL. Preencha as variaveis no
// Railway depois de gerar a chave de assinatura:
//   DAL_FINGERPRINT = SHA-256 da chave (ex: AA:BB:...:FF)
//   TWA_PACKAGE     = id do app (padrao app.supribox.twa)
app.get('/.well-known/assetlinks.json', (_req, res) => {
  // caminho mais simples: cole o JSON inteiro que o Google Play te dá em
  // Configuracao -> Integridade do app -> Digital Asset Links na var ASSETLINKS_JSON
  if (process.env.ASSETLINKS_JSON) {
    try { return res.json(JSON.parse(process.env.ASSETLINKS_JSON)); } catch (e) { /* cai pro fingerprint */ }
  }
  const fp = process.env.DAL_FINGERPRINT;
  const pkg = process.env.TWA_PACKAGE || 'app.supribox.twa';
  if (!fp) return res.json([]); // ainda sem chave -> lista vazia (JSON valido)
  res.json([{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: pkg,
      sha256_cert_fingerprints: fp.split(',').map((s) => s.trim()),
    },
  }]);
});

// service worker servido com escopo raiz e sem cache agressivo
app.get('/sw.js', (_req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, '../../frontend/sw.js'));
});

// serve o frontend estatico (mesma URL do backend -> um servico so)
app.use(express.static(path.join(__dirname, '../../frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SupriBox rodando na porta ${PORT}`);
  agendarDiaria(); // liga a entrega diaria automatica
});
