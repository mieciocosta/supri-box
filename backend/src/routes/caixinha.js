const express = require('express');
const prisma = require('../db');
const { sortear } = require('../sorteio');

const router = express.Router();

const PERFIS = ['idoso', 'adulto', 'jovem'];

// GET /caixinha?perfil=jovem&whatsapp=559... 
// Abre uma caixinha: sorteia 1 conteudo pro perfil, evita repetir o que o
// usuario viu nas ultimas entregas e registra a entrega.
router.get('/', async (req, res) => {
  try {
    let perfil = (req.query.perfil || 'adulto').toLowerCase();
    if (!PERFIS.includes(perfil)) perfil = 'adulto';

    const whatsapp = req.query.whatsapp || null;
    const canal = req.query.canal || 'web';

    // resolve usuario (opcional)
    let usuario = null;
    if (whatsapp) {
      usuario = await prisma.usuario.findUnique({ where: { whatsapp } });
    }

    // evita repetir as ultimas 12 entregas do usuario
    let excluir = [];
    if (usuario) {
      const recentes = await prisma.entrega.findMany({
        where: { usuarioId: usuario.id },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: { conteudoId: true },
      });
      excluir = recentes.map((e) => e.conteudoId);
    }

    const itens = await prisma.conteudo.findMany({ where: { ativo: true } });
    const escolhido = sortear(itens, perfil, excluir);

    if (!escolhido) {
      return res.status(404).json({ erro: 'Nenhuma caixinha disponivel para esse perfil.' });
    }

    await prisma.entrega.create({
      data: { conteudoId: escolhido.id, usuarioId: usuario ? usuario.id : null, canal },
    });

    res.json({
      tipo: escolhido.tipo,
      texto: escolhido.texto,
      explicacao: escolhido.explicacao || '',
      ref: escolhido.referencia || '',
      emoji: escolhido.emoji || '',
      mediaUrl: escolhido.mediaUrl || '',
    });
  } catch (err) {
    console.error('caixinha erro:', err);
    res.status(500).json({ erro: 'Falha ao abrir a caixinha.' });
  }
});

module.exports = router;
