const prisma = require('./db');

// Pesos por perfil: { idoso, adulto, jovem }. 0 = nao concorre pra aquele perfil.
// idoso  -> puxa versiculos e mensagens de carinho
// jovem  -> puxa frases punchy e cards "vibe"
// adulto -> mix equilibrado
const ACERVO = [
  // ---- versiculos (dominio publico) ----
  { tipo: 'versiculo', texto: 'O Senhor é o meu pastor; nada me faltará.', referencia: 'Salmos 23:1', pesos: { idoso: 6, adulto: 3, jovem: 1 } },
  { tipo: 'versiculo', texto: 'Tudo posso naquele que me fortalece.', referencia: 'Filipenses 4:13', pesos: { idoso: 5, adulto: 4, jovem: 3 } },
  { tipo: 'versiculo', texto: 'O choro pode durar uma noite, mas a alegria vem pela manhã.', referencia: 'Salmos 30:5', pesos: { idoso: 6, adulto: 3, jovem: 1 } },
  { tipo: 'versiculo', texto: 'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.', referencia: '1 Pedro 5:7', pesos: { idoso: 6, adulto: 4, jovem: 2 } },
  { tipo: 'versiculo', texto: 'Não temas, porque eu sou contigo.', referencia: 'Isaías 41:10', pesos: { idoso: 6, adulto: 4, jovem: 2 } },
  { tipo: 'versiculo', texto: 'A tua palavra é lâmpada para os meus pés e luz para o meu caminho.', referencia: 'Salmos 119:105', pesos: { idoso: 5, adulto: 3, jovem: 1 } },
  { tipo: 'versiculo', texto: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.', referencia: 'Salmos 37:5', pesos: { idoso: 5, adulto: 4, jovem: 2 } },
  { tipo: 'versiculo', texto: 'O Senhor te abençoe e te guarde.', referencia: 'Números 6:24', pesos: { idoso: 6, adulto: 3, jovem: 1 } },
  { tipo: 'versiculo', texto: 'Bom é render graças ao Senhor.', referencia: 'Salmos 92:1', pesos: { idoso: 5, adulto: 3, jovem: 1 } },
  { tipo: 'versiculo', texto: 'O amor é paciente, o amor é bondoso.', referencia: '1 Coríntios 13:4', pesos: { idoso: 5, adulto: 4, jovem: 3 } },

  // ---- carinho / bom dia ----
  { tipo: 'frase', texto: 'Bom dia. Que hoje seja leve e cheio de pequenas alegrias.', pesos: { idoso: 5, adulto: 3, jovem: 1 } },
  { tipo: 'frase', texto: 'Lembre-se de beber água e sorrir pra alguém hoje.', pesos: { idoso: 5, adulto: 3, jovem: 1 } },
  { tipo: 'frase', texto: 'Você é mais forte do que imagina e mais amado do que pensa.', pesos: { idoso: 4, adulto: 4, jovem: 3 } },

  // ---- frases motivacionais (originais) ----
  { tipo: 'frase', texto: 'Você não precisa ter tudo pronto pra começar. Só precisa começar.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { tipo: 'frase', texto: 'Sua única competição é a pessoa que você foi ontem.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { tipo: 'frase', texto: 'Coragem não é ausência de medo. É seguir mesmo sentindo ele.', pesos: { idoso: 2, adulto: 5, jovem: 5 } },
  { tipo: 'frase', texto: 'Disciplina é amor próprio em forma de hábito.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { tipo: 'frase', texto: 'Respira. Você já superou 100% dos seus piores dias.', pesos: { idoso: 2, adulto: 5, jovem: 6 } },
  { tipo: 'frase', texto: 'O pequeno passo de hoje é o atalho que o seu futuro vai agradecer.', pesos: { idoso: 2, adulto: 5, jovem: 5 } },
  { tipo: 'frase', texto: 'Comece bagunçado. Ajeita no caminho.', pesos: { idoso: 0, adulto: 4, jovem: 6 } },

  // ---- vibe (card vibrante com emoji) ----
  { tipo: 'vibe', emoji: '🚀', texto: 'Modo foco ativado. Hoje é dia de avançar.', pesos: { idoso: 0, adulto: 2, jovem: 6 } },
  { tipo: 'vibe', emoji: '🔥', texto: 'Some o orgulho do depois. Faz o que tem que ser feito agora.', pesos: { idoso: 0, adulto: 2, jovem: 6 } },
  { tipo: 'vibe', emoji: '🌱', texto: 'Plante hoje a sombra onde você vai descansar amanhã.', pesos: { idoso: 1, adulto: 3, jovem: 5 } },
  { tipo: 'vibe', emoji: '💪', texto: 'Dias difíceis constroem pessoas inquebráveis.', pesos: { idoso: 1, adulto: 3, jovem: 6 } },
];

async function main() {
  console.log('Limpando acervo antigo...');
  await prisma.entrega.deleteMany();
  await prisma.conteudo.deleteMany();

  console.log(`Inserindo ${ACERVO.length} caixinhas...`);
  for (const item of ACERVO) {
    await prisma.conteudo.create({ data: item });
  }
  console.log('Seed concluido ✅');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
