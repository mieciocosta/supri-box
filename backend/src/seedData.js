// Dados do seed compartilhados entre seed.js (dev, recria do zero) e
// seedSafe.js (producao, idempotente no boot).
//
// Pesos por perfil: { idoso, adulto, jovem }. 0 = nao concorre pra aquele perfil.
// idoso  -> puxa versiculos e mensagens de carinho
// jovem  -> puxa frases punchy e cards "vibe"
// adulto -> mix equilibrado
//
// "explicacao": uma frase curta e calorosa que ajuda a pessoa a sentir o
// recado. Aparece no app e na imagem compartilhavel (status do WhatsApp).
const ACERVO = [
  // ---- versiculos (dominio publico) — ancora de fe, minoria do acervo ----
  { tipo: 'versiculo', texto: 'O Senhor é o meu pastor; nada me faltará.', referencia: 'Salmos 23:1', explicacao: 'Um lembrete de que você é cuidado: o essencial não vai te faltar hoje.', pesos: { idoso: 6, adulto: 3, jovem: 1 } },
  { tipo: 'versiculo', texto: 'Tudo posso naquele que me fortalece.', referencia: 'Filipenses 4:13', explicacao: 'Sua força não depende só de você — há uma fonte maior te sustentando.', pesos: { idoso: 5, adulto: 4, jovem: 4 } },
  { tipo: 'versiculo', texto: 'Não temas, porque eu sou contigo.', referencia: 'Isaías 41:10', explicacao: 'Você não enfrenta o dia sozinho; a coragem nasce de se sentir acompanhado.', pesos: { idoso: 6, adulto: 4, jovem: 3 } },
  { tipo: 'versiculo', texto: 'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.', referencia: '1 Pedro 5:7', explicacao: 'Pode entregar o peso que carrega; você não precisa segurar tudo sozinho.', pesos: { idoso: 6, adulto: 4, jovem: 2 } },
  { tipo: 'versiculo', texto: 'Vinde a mim todos os que estais cansados, e eu vos aliviarei.', referencia: 'Mateus 11:28', explicacao: 'Descanso é permitido. Parar pra respirar também é um ato de fé.', pesos: { idoso: 6, adulto: 4, jovem: 2 } },
  { tipo: 'versiculo', texto: 'O choro pode durar uma noite, mas a alegria vem pela manhã.', referencia: 'Salmos 30:5', explicacao: 'A dor de hoje tem prazo; dias melhores fazem parte do caminho.', pesos: { idoso: 6, adulto: 3, jovem: 1 } },
  { tipo: 'versiculo', texto: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.', referencia: 'Salmos 37:5', explicacao: 'Confiar é soltar o controle e seguir em frente um passo de cada vez.', pesos: { idoso: 5, adulto: 4, jovem: 2 } },
  { tipo: 'versiculo', texto: 'O Senhor te guardará de todo o mal.', referencia: 'Salmos 121:7', explicacao: 'Vá com a tranquilidade de quem se sente protegido aonde for.', pesos: { idoso: 6, adulto: 3, jovem: 1 } },

  // ---- fe & apoio — frases de incentivo com pegada crista (originais) ----
  { tipo: 'frase', texto: 'A fé não tira a tempestade, mas segura a sua mão dentro dela.', explicacao: 'Acreditar não acaba com os problemas, mas te dá firmeza pra atravessá-los.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },
  { tipo: 'frase', texto: 'Deus não te trouxe até aqui para te abandonar agora.', explicacao: 'Olhe pra trás: você já superou muito. Esse capítulo também vai passar.', pesos: { idoso: 6, adulto: 4, jovem: 3 } },
  { tipo: 'frase', texto: 'Confie no tempo de Deus: nada que é seu vai passar longe de você.', explicacao: 'O que é pra ser seu chega na hora certa; não force, confie.', pesos: { idoso: 5, adulto: 4, jovem: 2 } },
  { tipo: 'frase', texto: 'Respira. O mesmo cuidado que te guardou ontem já está no seu amanhã.', explicacao: 'A proteção que te trouxe até aqui continua com você adiante.', pesos: { idoso: 6, adulto: 4, jovem: 2 } },
  { tipo: 'frase', texto: 'Gratidão transforma o que você tem no que basta.', explicacao: 'Reparar no que já é bom muda o jeito como o dia inteiro te afeta.', pesos: { idoso: 4, adulto: 4, jovem: 3 } },
  { tipo: 'frase', texto: 'Mesmo no escuro, a semente confia que vai virar flor.', explicacao: 'Crescer leva tempo e às vezes acontece longe dos olhos. Tenha paciência.', pesos: { idoso: 4, adulto: 4, jovem: 3 } },
  { tipo: 'frase', texto: 'Você é amado mesmo nos dias em que não produz nada.', explicacao: 'Seu valor não está no quanto você faz, mas em quem você é.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },

  // ---- carinho / bom dia ----
  { tipo: 'frase', texto: 'Bom dia. Que hoje seja leve e cheio de pequenas alegrias.', explicacao: 'Um respiro de carinho pra começar o dia com o coração mais leve.', pesos: { idoso: 5, adulto: 3, jovem: 1 } },
  { tipo: 'frase', texto: 'Lembre-se de beber água, respirar fundo e sorrir pra alguém hoje.', explicacao: 'Pequenos cuidados com você mudam o tom do dia inteiro.', pesos: { idoso: 5, adulto: 3, jovem: 2 } },
  { tipo: 'frase', texto: 'Você é mais forte do que imagina e mais amado do que pensa.', explicacao: 'Nos dias difíceis, você tem mais reservas e mais gente do que acredita.', pesos: { idoso: 4, adulto: 4, jovem: 4 } },

  // ---- foco & disciplina ----
  { tipo: 'frase', texto: 'Comece pequeno, comece imperfeito, mas comece.', explicacao: 'Não espere o momento perfeito; o primeiro passo imperfeito já te move.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { tipo: 'frase', texto: 'Você não precisa de pressa, precisa de direção.', explicacao: 'Saber pra onde vai vale mais do que correr sem rumo.', pesos: { idoso: 2, adulto: 5, jovem: 5 } },
  { tipo: 'frase', texto: 'Disciplina é lembrar do que você quis quando ainda estava inspirado.', explicacao: 'Nos dias sem vontade, é a disciplina que honra o sonho que você teve.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { tipo: 'frase', texto: 'Um dia de cada vez já é o suficiente para mudar uma vida.', explicacao: 'Mudança não exige grandes saltos, só constância no pequeno.', pesos: { idoso: 3, adulto: 5, jovem: 4 } },
  { tipo: 'frase', texto: 'Sua rotina silenciosa de hoje é o milagre que você vai agradecer amanhã.', explicacao: 'O esforço discreto de agora constrói a vitória que ainda vai chegar.', pesos: { idoso: 3, adulto: 5, jovem: 4 } },

  // ---- forca & animo ----
  { tipo: 'frase', texto: 'Você já sobreviveu a 100% dos seus piores dias. Esse não vai ser diferente.', explicacao: 'Seu histórico prova que você é capaz de atravessar isso também.', pesos: { idoso: 2, adulto: 5, jovem: 6 } },
  { tipo: 'frase', texto: 'Coragem não é não ter medo. É caminhar de mãos dadas com ele.', explicacao: 'Sentir medo é normal; agir mesmo assim é o que te faz corajoso.', pesos: { idoso: 2, adulto: 5, jovem: 5 } },
  { tipo: 'frase', texto: 'Cai sete vezes, levanta oito. É assim que se constrói gente firme.', explicacao: 'O que te define não é cair, é a teimosia de levantar de novo.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { tipo: 'frase', texto: 'Não desista na curva achando que era o fim da estrada.', explicacao: 'Às vezes o que parece um beco é só uma curva antes da reta boa.', pesos: { idoso: 2, adulto: 4, jovem: 6 } },
  { tipo: 'frase', texto: 'Força não é nunca cair. É nunca se acostumar com o chão.', explicacao: 'Tropeçar acontece; o segredo é não fazer do chão o seu lugar.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },

  // ---- forca do dia (simbolo discreto) ----
  { tipo: 'vibe', emoji: '✦', texto: 'Hoje é um bom dia pra começar de novo.', explicacao: 'Todo amanhecer é uma chance limpa de recomeçar — aproveite essa.', pesos: { idoso: 1, adulto: 3, jovem: 6 } },
  { tipo: 'vibe', emoji: '◆', texto: 'Faça hoje o que o seu futuro vai agradecer.', explicacao: 'Pequenas escolhas de hoje são presentes pro você de amanhã.', pesos: { idoso: 1, adulto: 3, jovem: 6 } },
];

// Planos de assinatura. O "isca" de 1 centavo fisga; o lucro vem do mensal.
const PLANOS = [
  { slug: 'isca', nome: 'Primeira caixinha', preco: 0.01, periodoDias: 1, destaque: 'Experimente por 1 centavo' },
  { slug: 'mensal', nome: 'Caixinha todo dia (mensal)', preco: 9.90, periodoDias: 30, destaque: 'Uma surpresa por dia no seu WhatsApp' },
  { slug: 'trimestral', nome: 'Caixinha todo dia (3 meses)', preco: 24.90, periodoDias: 90, destaque: 'Economize levando 3 meses' },
];

module.exports = { ACERVO, PLANOS };
