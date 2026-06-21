const express = require('express');
const prisma = require('../db');

const router = express.Router();

// POST /usuarios  -> cria ou atualiza (upsert por whatsapp)
// body: { nome?, whatsapp, perfil? }
router.post('/', async (req, res) => {
  try {
    const { nome, whatsapp, perfil } = req.body;
    if (!whatsapp) return res.status(400).json({ erro: 'whatsapp e obrigatorio.' });

    const usuario = await prisma.usuario.upsert({
      where: { whatsapp },
      update: { nome, perfil },
      create: { nome, whatsapp, perfil: perfil || 'adulto' },
    });
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Falha ao salvar usuario.' });
  }
});

// POST /usuarios/:id/assinatura -> ativa assinatura (chamado apos pagamento aprovado)
router.post('/:id/assinatura', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const dias = Number(req.body.dias) || 30;
    const ate = new Date();
    ate.setDate(ate.getDate() + dias);

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { assinaturaAtiva: true, assinaturaAte: ate },
    });
    res.json(usuario);
  } catch (err) {
    res.status(404).json({ erro: 'Usuario nao encontrado.' });
  }
});

module.exports = router;
