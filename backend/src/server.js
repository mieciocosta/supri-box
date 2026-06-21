const express = require('express');
const cors = require('cors');

const caixinha = require('./routes/caixinha');
const conteudos = require('./routes/conteudos');
const usuarios = require('./routes/usuarios');
const webhook = require('./routes/webhook');
const pagamento = require('./routes/pagamento');

const app = express();

app.use(cors());
app.use(express.json());

// health
app.get('/', (_req, res) => res.json({ app: 'SupriBox', status: 'ok' }));

app.use('/caixinha', caixinha);
app.use('/conteudos', conteudos);
app.use('/usuarios', usuarios);
app.use('/webhook', webhook);
app.use('/pagamento', pagamento);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SupriBox rodando na porta ${PORT}`));
