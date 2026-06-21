const prisma = require('./db');
const { ACERVO, PLANOS } = require('./seedData');

// Seed idempotente pro boot em producao (Railway): NAO apaga nada.
// - Acervo: insere so se a tabela estiver vazia (preserva edicoes feitas depois).
// - Planos: upsert por slug (mantem precos atualizados sem duplicar).
async function main() {
  const total = await prisma.conteudo.count();
  if (total === 0) {
    console.log(`Acervo vazio: inserindo ${ACERVO.length} caixinhas...`);
    for (const item of ACERVO) {
      await prisma.conteudo.create({ data: item });
    }
  } else {
    console.log(`Acervo ja tem ${total} caixinhas: pulando.`);
  }

  console.log(`Sincronizando ${PLANOS.length} planos...`);
  for (const plano of PLANOS) {
    await prisma.plano.upsert({ where: { slug: plano.slug }, update: plano, create: plano });
  }
  console.log('Seed seguro concluido ✅');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
