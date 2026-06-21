const path = require('path');
const express = require('express');
const cors = require('cors');

const caixinha = require('./routes/caixinha');
const conteudos = require('./routes/conteudos');
const usuarios = require('./routes/usuarios');
const webhook = require('./routes/webhook');
const pagamento = require('./routes/pagamento');
const assinatura = require('./routes/assinatura');

const app = express();

app.use(cors());
app.use(express.json());

// health check (Railway aponta o healthcheck pra ca)
app.get('/health', (_req, res) => res.json({ app: 'SupriBox', status: 'ok' }));

// API
app.use('/caixinha', caixinha);
app.use('/conteudos', conteudos);
app.use('/usuarios', usuarios);
app.use('/webhook', webhook);
app.use('/pagamento', pagamento);
app.use('/assinatura', assinatura);

// Digital Asset Links — prova a posse do dominio pro app TWA (Google Play),
// pra ele abrir em tela cheia sem a barra de URL. Preencha as variaveis no
// Railway depois de gerar a chave de assinatura:
//   DAL_FINGERPRINT = SHA-256 da chave (ex: AA:BB:...:FF)
//   TWA_PACKAGE     = id do app (padrao app.supribox.twa)
app.get('/.well-known/assetlinks.json', (_req, res) => {
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
app.listen(PORT, () => console.log(`SupriBox rodando na porta ${PORT}`));
