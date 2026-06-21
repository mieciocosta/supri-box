// Dados do seed compartilhados entre seed.js (dev, recria do zero) e
// seedSafe.js (producao, idempotente no boot).
//
// Pesos por perfil: { idoso, adulto, jovem }. 0 = nao concorre pra aquele perfil.
// idoso  -> puxa versiculos e mensagens de carinho
// jovem  -> puxa frases punchy e cards "vibe"
// adulto -> mix equilibrado
const ACERVO = [
  // ---- versiculos (dominio publico) — ancora de fe, minoria do acervo ----
  { tipo: 'versiculo', texto: 'O Senhor é o meu pastor; nada me faltará.', referencia: 'Salmos 23:1', pesos: { idoso: 6, adulto: 3, jovem: 1 } },
  { tipo: 'versiculo', texto: 'Tudo posso naquele que me fortalece.', referencia: 'Filipenses 4:13', pesos: { idoso: 5, adulto: 4, jovem: 4 } },
  { tipo: 'versiculo', texto: 'Não temas, porque eu sou contigo.', referencia: 'Isaías 41:10', pesos: { idoso: 6, adulto: 4, jovem: 3 } },
  { tipo: 'versiculo', texto: 'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.', referencia: '1 Pedro 5:7', pesos: { idoso: 6, adulto: 4, jovem: 2 } },
  { tipo: 'versiculo', texto: 'Vinde a mim todos os que estais cansados, e eu vos aliviarei.', referencia: 'Mateus 11:28', pesos: { idoso: 6, adulto: 4, jovem: 2 } },
  { tipo: 'versiculo', texto: 'O choro pode durar uma noite, mas a alegria vem pela manhã.', referencia: 'Salmos 30:5', pesos: { idoso: 6, adulto: 3, jovem: 1 } },
  { tipo: 'versiculo', texto: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.', referencia: 'Salmos 37:5', pesos: { idoso: 5, adulto: 4, jovem: 2 } },
  { tipo: 'versiculo', texto: 'O Senhor te guardará de todo o mal.', referencia: 'Salmos 121:7', pesos: { idoso: 6, adulto: 3, jovem: 1 } },

  // ---- fe & apoio — frases de incentivo com pegada crista (originais) ----
  { tipo: 'frase', texto: 'A fé não tira a tempestade, mas segura a sua mão dentro dela.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },
  { tipo: 'frase', texto: 'Deus não te trouxe até aqui para te abandonar agora.', pesos: { idoso: 6, adulto: 4, jovem: 3 } },
  { tipo: 'frase', texto: 'Confie no tempo de Deus: nada que é seu vai passar longe de você.', pesos: { idoso: 5, adulto: 4, jovem: 2 } },
  { tipo: 'frase', texto: 'Respira. O mesmo cuidado que te guardou ontem já está no seu amanhã.', pesos: { idoso: 6, adulto: 4, jovem: 2 } },
  { tipo: 'frase', texto: 'Gratidão transforma o que você tem no que basta.', pesos: { idoso: 4, adulto: 4, jovem: 3 } },
  { tipo: 'frase', texto: 'Mesmo no escuro, a semente confia que vai virar flor.', pesos: { idoso: 4, adulto: 4, jovem: 3 } },
  { tipo: 'frase', texto: 'Você é amado mesmo nos dias em que não produz nada.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },

  // ---- carinho / bom dia ----
  { tipo: 'frase', texto: 'Bom dia. Que hoje seja leve e cheio de pequenas alegrias.', pesos: { idoso: 5, adulto: 3, jovem: 1 } },
  { tipo: 'frase', texto: 'Lembre-se de beber água, respirar fundo e sorrir pra alguém hoje.', pesos: { idoso: 5, adulto: 3, jovem: 2 } },
  { tipo: 'frase', texto: 'Você é mais forte do que imagina e mais amado do que pensa.', pesos: { idoso: 4, adulto: 4, jovem: 4 } },

  // ---- foco & disciplina ----
  { tipo: 'frase', texto: 'Comece pequeno, comece imperfeito, mas comece.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { tipo: 'frase', texto: 'Você não precisa de pressa, precisa de direção.', pesos: { idoso: 2, adulto: 5, jovem: 5 } },
  { tipo: 'frase', texto: 'Disciplina é lembrar do que você quis quando ainda estava inspirado.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { tipo: 'frase', texto: 'Um dia de cada vez já é o suficiente para mudar uma vida.', pesos: { idoso: 3, adulto: 5, jovem: 4 } },
  { tipo: 'frase', texto: 'Sua rotina silenciosa de hoje é o milagre que você vai agradecer amanhã.', pesos: { idoso: 3, adulto: 5, jovem: 4 } },

  // ---- forca & animo ----
  { tipo: 'frase', texto: 'Você já sobreviveu a 100% dos seus piores dias. Esse não vai ser diferente.', pesos: { idoso: 2, adulto: 5, jovem: 6 } },
  { tipo: 'frase', texto: 'Coragem não é não ter medo. É caminhar de mãos dadas com ele.', pesos: { idoso: 2, adulto: 5, jovem: 5 } },
  { tipo: 'frase', texto: 'Cai sete vezes, levanta oito. É assim que se constrói gente firme.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { tipo: 'frase', texto: 'Não desista na curva achando que era o fim da estrada.', pesos: { idoso: 2, adulto: 4, jovem: 6 } },
  { tipo: 'frase', texto: 'Força não é nunca cair. É nunca se acostumar com o chão.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },

  // ---- forca do dia (simbolo discreto) ----
  { tipo: 'vibe', emoji: '✦', texto: 'Hoje é um bom dia pra começar de novo.', pesos: { idoso: 1, adulto: 3, jovem: 6 } },
  { tipo: 'vibe', emoji: '◆', texto: 'Faça hoje o que o seu futuro vai agradecer.', pesos: { idoso: 1, adulto: 3, jovem: 6 } },
];

// Planos de assinatura. O "isca" de 1 centavo fisga; o lucro vem do mensal.
const PLANOS = [
  { slug: 'isca', nome: 'Primeira caixinha', preco: 0.01, periodoDias: 1, destaque: 'Experimente por 1 centavo' },
  { slug: 'mensal', nome: 'Caixinha todo dia (mensal)', preco: 9.90, periodoDias: 30, destaque: 'Uma surpresa por dia no seu WhatsApp' },
  { slug: 'trimestral', nome: 'Caixinha todo dia (3 meses)', preco: 24.90, periodoDias: 90, destaque: 'Economize levando 3 meses' },
];

module.exports = { ACERVO, PLANOS };
