const express = require('express');
const prisma = require('../db');
const { criarPix, temToken } = require('../mercadopago');
const { ativarPagamento } = require('../services/assinaturaService');

const router = express.Router();

const PERFIS = ['idoso', 'adulto', 'jovem'];

// GET /assinatura/planos  -> lista os planos ativos (ex: isca 1c + mensal)
router.get('/planos', async (_req, res) => {
  const planos = await prisma.plano.findMany({
    where: { ativo: true },
    orderBy: { preco: 'asc' },
  });
  res.json(planos);
});

// POST /assinatura/criar
// body: { whatsapp, nome?, email?, perfil?, planoSlug }
// Faz upsert do usuario, cria a assinatura pendente, gera a cobranca Pix e
// devolve o copia-e-cola / QR pro frontend mostrar.
router.post('/criar', async (req, res) => {
  try {
    const { whatsapp, nome, email, planoSlug } = req.body;
    let perfil = (req.body.perfil || 'adulto').toLowerCase();
    if (!PERFIS.includes(perfil)) perfil = 'adulto';

    if (!whatsapp) return res.status(400).json({ erro: 'whatsapp e obrigatorio.' });
    if (!planoSlug) return res.status(400).json({ erro: 'planoSlug e obrigatorio.' });

    const plano = await prisma.plano.findUnique({ where: { slug: planoSlug } });
    if (!plano || !plano.ativo) return res.status(404).json({ erro: 'Plano nao encontrado.' });

    const usuario = await prisma.usuario.upsert({
      where: { whatsapp },
      update: { nome, email, perfil },
      create: { whatsapp, nome, email, perfil },
    });

    const assinatura = await prisma.assinatura.create({
      data: { usuarioId: usuario.id, planoId: plano.id, status: 'pendente' },
    });

    const pix = await criarPix({
      valor: plano.preco,
      descricao: `SupriBox ${plano.nome}`,
      email: email || undefined,
      metadata: { assinaturaId: assinatura.id, usuarioId: usuario.id, tipo: plano.slug === 'isca' ? 'isca' : 'assinatura' },
    });

    const pagamento = await prisma.pagamento.create({
      data: {
        usuarioId: usuario.id,
        assinaturaId: assinatura.id,
        mpPaymentId: pix.id ? String(pix.id) : null,
        tipo: plano.slug === 'isca' ? 'isca' : 'assinatura',
        valor: plano.preco,
        status: 'pendente',
        qrCode: pix.qrCode || null,
        qrCodeBase64: pix.qrCodeBase64 || null,
      },
    });

    res.status(201).json({
      assinaturaId: assinatura.id,
      pagamentoId: pagamento.id,
      plano: { slug: plano.slug, nome: plano.nome, preco: plano.preco },
      valor: plano.preco,
      qrCode: pix.qrCode,
      qrCodeBase64: pix.qrCodeBase64,
      stub: Boolean(pix.stub),
    });
  } catch (err) {
    console.error('assinatura criar erro:', err);
    res.status(500).json({ erro: 'Falha ao criar assinatura.' });
  }
});

// GET /assinatura/:id/status  -> frontend faz polling ate virar "ativa"
router.get('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const assinatura = await prisma.assinatura.findUnique({
      where: { id },
      include: { plano: true },
    });
    if (!assinatura) return res.status(404).json({ erro: 'Assinatura nao encontrada.' });
    res.json({
      id: assinatura.id,
      status: assinatura.status,
      expiraEm: assinatura.expiraEm,
      plano: assinatura.plano?.nome,
    });
  } catch (err) {
    res.status(500).json({ erro: 'Falha ao consultar status.' });
  }
});

// POST /assinatura/:id/confirmar-stub  -> SO em modo dev (sem MP_ACCESS_TOKEN).
// Simula a aprovacao do Pix pra voce testar o fluxo ponta a ponta.
router.post('/:id/confirmar-stub', async (req, res) => {
  if (temToken()) {
    return res.status(403).json({ erro: 'Indisponivel: MP_ACCESS_TOKEN configurado (use o webhook real).' });
  }
  try {
    const id = Number(req.params.id);
    const pagamento = await prisma.pagamento.findFirst({
      where: { assinaturaId: id, status: 'pendente' },
      orderBy: { createdAt: 'desc' },
    });
    if (!pagamento) return res.status(404).json({ erro: 'Nenhum pagamento pendente.' });
    await ativarPagamento(pagamento);
    res.json({ ok: true, status: 'ativa' });
  } catch (err) {
    console.error('confirmar-stub erro:', err);
    res.status(500).json({ erro: 'Falha ao confirmar (stub).' });
  }
});

module.exports = router;
