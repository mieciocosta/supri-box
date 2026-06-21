const express = require('express');
const prisma = require('../db');

const router = express.Router();

// GET /conteudos  -> lista o acervo
router.get('/', async (_req, res) => {
  const itens = await prisma.conteudo.findMany({ orderBy: { id: 'asc' } });
  res.json(itens);
});

// POST /conteudos -> adiciona caixinha
// body: { tipo, texto, referencia?, emoji?, mediaUrl?, pesos:{idoso,adulto,jovem} }
router.post('/', async (req, res) => {
  try {
    const { tipo, texto, referencia, emoji, mediaUrl, pesos } = req.body;
    if (!tipo || !texto || !pesos) {
      return res.status(400).json({ erro: 'tipo, texto e pesos sao obrigatorios.' });
    }
    const novo = await prisma.conteudo.create({
      data: { tipo, texto, referencia, emoji, mediaUrl, pesos },
    });
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Falha ao criar conteudo.' });
  }
});

// PATCH /conteudos/:id -> edita
router.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const atualizado = await prisma.conteudo.update({ where: { id }, data: req.body });
    res.json(atualizado);
  } catch (err) {
    res.status(404).json({ erro: 'Conteudo nao encontrado.' });
  }
});

// DELETE /conteudos/:id  (soft delete: desativa)
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.conteudo.update({ where: { id }, data: { ativo: false } });
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ erro: 'Conteudo nao encontrado.' });
  }
});

module.exports = router;
