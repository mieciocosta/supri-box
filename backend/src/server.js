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

// serve o frontend estatico (mesma URL do backend -> um servico so)
app.use(express.static(path.join(__dirname, '../../frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SupriBox rodando na porta ${PORT}`));
