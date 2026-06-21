const prisma = require('./db');
const { ACERVO, PLANOS } = require('./seedData');

// Seed de DEV: recria o acervo do zero (apaga entregas e conteudos antes).
// Em producao o boot usa seedSafe.js, que NAO apaga nada.
async function main() {
  console.log('Limpando acervo antigo...');
  await prisma.entrega.deleteMany();
  await prisma.conteudo.deleteMany();

  console.log(`Inserindo ${ACERVO.length} caixinhas...`);
  for (const item of ACERVO) {
    await prisma.conteudo.create({ data: item });
  }

  console.log(`Sincronizando ${PLANOS.length} planos...`);
  for (const plano of PLANOS) {
    await prisma.plano.upsert({
      where: { slug: plano.slug },
      update: plano,
      create: plano,
    });
  }
  console.log('Seed concluido ✅');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
