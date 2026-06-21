// Dados do seed compartilhados entre seed.js (dev, recria do zero) e
// seedSafe.js (producao, idempotente no boot).
//
// Cada item tem:
//   categoria  -> tema usado pelo seletor do app (fe|foco|forca|sabedoria|gratidao|calma|amor)
//   pesos      -> { idoso, adulto, jovem } usado na entrega diaria por perfil (0 = nao concorre)
//   explicacao -> frase curta e calorosa (aparece no app, na imagem e no WhatsApp)
const ACERVO = [
  // ===================== FÉ (versículos + apoio cristão) =====================
  { categoria: 'fe', tipo: 'versiculo', texto: 'O Senhor é o meu pastor; nada me faltará.', referencia: 'Salmos 23:1', explicacao: 'Um lembrete de que você é cuidado: o essencial não vai te faltar hoje.', pesos: { idoso: 6, adulto: 3, jovem: 1 } },
  { categoria: 'fe', tipo: 'versiculo', texto: 'Tudo posso naquele que me fortalece.', referencia: 'Filipenses 4:13', explicacao: 'Sua força não depende só de você — há uma fonte maior te sustentando.', pesos: { idoso: 5, adulto: 4, jovem: 4 } },
  { categoria: 'fe', tipo: 'versiculo', texto: 'Não temas, porque eu sou contigo.', referencia: 'Isaías 41:10', explicacao: 'Você não enfrenta o dia sozinho; a coragem nasce de se sentir acompanhado.', pesos: { idoso: 6, adulto: 4, jovem: 3 } },
  { categoria: 'fe', tipo: 'versiculo', texto: 'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.', referencia: '1 Pedro 5:7', explicacao: 'Pode entregar o peso que carrega; você não precisa segurar tudo sozinho.', pesos: { idoso: 6, adulto: 4, jovem: 2 } },
  { categoria: 'fe', tipo: 'versiculo', texto: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.', referencia: 'Salmos 37:5', explicacao: 'Confiar é soltar o controle e seguir em frente um passo de cada vez.', pesos: { idoso: 5, adulto: 4, jovem: 2 } },
  { categoria: 'fe', tipo: 'versiculo', texto: 'O Senhor te guardará de todo o mal.', referencia: 'Salmos 121:7', explicacao: 'Vá com a tranquilidade de quem se sente protegido aonde for.', pesos: { idoso: 6, adulto: 3, jovem: 1 } },
  { categoria: 'fe', tipo: 'frase', texto: 'A fé não tira a tempestade, mas segura a sua mão dentro dela.', explicacao: 'Acreditar não acaba com os problemas, mas te dá firmeza pra atravessá-los.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },
  { categoria: 'fe', tipo: 'frase', texto: 'Deus não te trouxe até aqui para te abandonar agora.', explicacao: 'Olhe pra trás: você já superou muito. Esse capítulo também vai passar.', pesos: { idoso: 6, adulto: 4, jovem: 3 } },
  { categoria: 'fe', tipo: 'frase', texto: 'Confie no tempo de Deus: nada que é seu vai passar longe de você.', explicacao: 'O que é pra ser seu chega na hora certa; não force, confie.', pesos: { idoso: 5, adulto: 4, jovem: 2 } },
  { categoria: 'fe', tipo: 'frase', texto: 'Mesmo no escuro, a semente confia que vai virar flor.', explicacao: 'Crescer leva tempo e às vezes acontece longe dos olhos. Tenha paciência.', pesos: { idoso: 4, adulto: 4, jovem: 3 } },

  // ===================== FOCO & disciplina =====================
  { categoria: 'foco', tipo: 'frase', texto: 'Comece pequeno, comece imperfeito, mas comece.', explicacao: 'Não espere o momento perfeito; o primeiro passo imperfeito já te move.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { categoria: 'foco', tipo: 'frase', texto: 'Você não precisa de pressa, precisa de direção.', explicacao: 'Saber pra onde vai vale mais do que correr sem rumo.', pesos: { idoso: 2, adulto: 5, jovem: 5 } },
  { categoria: 'foco', tipo: 'frase', texto: 'Disciplina é lembrar do que você quis quando ainda estava inspirado.', explicacao: 'Nos dias sem vontade, é a disciplina que honra o sonho que você teve.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { categoria: 'foco', tipo: 'frase', texto: 'Um dia de cada vez já é o suficiente para mudar uma vida.', explicacao: 'Mudança não exige grandes saltos, só constância no pequeno.', pesos: { idoso: 3, adulto: 5, jovem: 4 } },
  { categoria: 'foco', tipo: 'frase', texto: 'Sua rotina silenciosa de hoje é o milagre que você vai agradecer amanhã.', explicacao: 'O esforço discreto de agora constrói a vitória que ainda vai chegar.', pesos: { idoso: 3, adulto: 5, jovem: 4 } },
  { categoria: 'foco', tipo: 'frase', texto: 'Foco não é fazer mais coisas; é fazer o que importa e deixar o resto.', explicacao: 'Escolher o essencial é dizer não com tranquilidade ao que distrai.', pesos: { idoso: 2, adulto: 5, jovem: 5 } },
  { categoria: 'foco', tipo: 'frase', texto: 'Feito é melhor que perfeito. O perfeito quase nunca sai do papel.', explicacao: 'Avançar imperfeito ensina mais do que planejar sem entregar.', pesos: { idoso: 1, adulto: 5, jovem: 6 } },

  // ===================== FORÇA & ânimo =====================
  { categoria: 'forca', tipo: 'frase', texto: 'Você já sobreviveu a 100% dos seus piores dias. Esse não vai ser diferente.', explicacao: 'Seu histórico prova que você é capaz de atravessar isso também.', pesos: { idoso: 2, adulto: 5, jovem: 6 } },
  { categoria: 'forca', tipo: 'frase', texto: 'Coragem não é não ter medo. É caminhar de mãos dadas com ele.', explicacao: 'Sentir medo é normal; agir mesmo assim é o que te faz corajoso.', pesos: { idoso: 2, adulto: 5, jovem: 5 } },
  { categoria: 'forca', tipo: 'frase', texto: 'Cai sete vezes, levanta oito. É assim que se constrói gente firme.', explicacao: 'O que te define não é cair, é a teimosia de levantar de novo.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { categoria: 'forca', tipo: 'frase', texto: 'Não desista na curva achando que era o fim da estrada.', explicacao: 'Às vezes o que parece um beco é só uma curva antes da reta boa.', pesos: { idoso: 2, adulto: 4, jovem: 6 } },
  { categoria: 'forca', tipo: 'frase', texto: 'Força não é nunca cair. É nunca se acostumar com o chão.', explicacao: 'Tropeçar acontece; o segredo é não fazer do chão o seu lugar.', pesos: { idoso: 1, adulto: 4, jovem: 6 } },
  { categoria: 'forca', tipo: 'frase', texto: 'Você é mais forte do que imagina e mais amado do que pensa.', explicacao: 'Nos dias difíceis, você tem mais reservas e mais gente do que acredita.', pesos: { idoso: 4, adulto: 4, jovem: 4 } },
  { categoria: 'forca', tipo: 'vibe', emoji: '✦', texto: 'Hoje é um bom dia pra começar de novo.', explicacao: 'Todo amanhecer é uma chance limpa de recomeçar — aproveite essa.', pesos: { idoso: 1, adulto: 3, jovem: 6 } },
  { categoria: 'forca', tipo: 'vibe', emoji: '◆', texto: 'Faça hoje o que o seu futuro vai agradecer.', explicacao: 'Pequenas escolhas de hoje são presentes pro você de amanhã.', pesos: { idoso: 1, adulto: 3, jovem: 6 } },

  // ===================== SABEDORIA (pensadores & reflexão) =====================
  { categoria: 'sabedoria', tipo: 'frase', texto: 'O sábio não é o que tem todas as respostas, mas o que faz as perguntas certas.', explicacao: 'Crescer começa por se permitir não saber e querer entender.', pesos: { idoso: 3, adulto: 5, jovem: 4 } },
  { categoria: 'sabedoria', tipo: 'frase', texto: 'Antes de mudar o mundo lá fora, vale olhar pra dentro com honestidade.', explicacao: 'O caminho de fora só faz sentido depois do caminho de dentro.', pesos: { idoso: 3, adulto: 5, jovem: 4 } },
  { categoria: 'sabedoria', tipo: 'frase', texto: 'Quem caminha devagar sabendo o porquê chega mais longe que quem corre no escuro.', explicacao: 'Propósito vale mais do que velocidade.', pesos: { idoso: 4, adulto: 5, jovem: 3 } },
  { categoria: 'sabedoria', tipo: 'frase', texto: 'A vida se entende olhando pra trás, mas só se vive olhando pra frente.', explicacao: 'Aprenda com o ontem, mas viva voltado pro amanhã.', pesos: { idoso: 4, adulto: 5, jovem: 3 } },
  { categoria: 'sabedoria', tipo: 'frase', texto: 'O que você planta no silêncio, colhe no caráter.', explicacao: 'Quem você é nos bastidores constrói quem você se torna.', pesos: { idoso: 3, adulto: 5, jovem: 4 } },
  { categoria: 'sabedoria', tipo: 'frase', texto: 'Sabedoria é saber a hora de falar e ter a coragem de calar.', explicacao: 'Nem toda verdade precisa de plateia; o tempo certo importa.', pesos: { idoso: 4, adulto: 5, jovem: 3 } },
  { categoria: 'sabedoria', tipo: 'frase', texto: 'Não busque ser uma pessoa de sucesso, mas uma pessoa de valor.', explicacao: 'Valor verdadeiro fica; status passa.', pesos: { idoso: 3, adulto: 5, jovem: 4 } },
  { categoria: 'sabedoria', tipo: 'frase', texto: 'Aquilo que você evita sentir costuma ser exatamente o que precisa ser olhado.', explicacao: 'Encarar o que incomoda é o começo de amadurecer.', pesos: { idoso: 3, adulto: 5, jovem: 4 } },

  // ===================== GRATIDÃO & bênçãos =====================
  { categoria: 'gratidao', tipo: 'frase', texto: 'Contar bênçãos é trocar a lente da falta pela lente da fartura.', explicacao: 'O que você olha cresce; escolha olhar o que já tem.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },
  { categoria: 'gratidao', tipo: 'frase', texto: 'Gratidão transforma o que você tem no que basta.', explicacao: 'Reparar no que já é bom muda o jeito como o dia inteiro te afeta.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },
  { categoria: 'gratidao', tipo: 'frase', texto: 'Quem agradece o pouco já está pronto pra cuidar do muito.', explicacao: 'Gratidão é o solo onde a abundância floresce.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },
  { categoria: 'gratidao', tipo: 'frase', texto: 'Hoje alguém orou por você sem te contar. Você é mais amado do que imagina.', explicacao: 'Você não caminha sozinho — há afeto invisível te cercando.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },
  { categoria: 'gratidao', tipo: 'frase', texto: 'Acorde e diga obrigado: o ar, a luz, mais um dia — nada disso era garantido.', explicacao: 'Começar grato muda o tom de tudo que vem depois.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },
  { categoria: 'gratidao', tipo: 'frase', texto: 'A alegria não vem de ter tudo, mas de reparar no que já basta.', explicacao: 'Felicidade mora mais na atenção do que na posse.', pesos: { idoso: 4, adulto: 4, jovem: 4 } },
  { categoria: 'gratidao', tipo: 'frase', texto: 'Muito do que hoje é rotina já foi, um dia, um pedido seu. Agradeça.', explicacao: 'O ordinário de agora já foi sonho em algum momento.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },

  // ===================== CALMA & ansiedade =====================
  { categoria: 'calma', tipo: 'frase', texto: 'Respira fundo três vezes. A maioria dos medos perde força quando o ar volta.', explicacao: 'O corpo acalma a mente: comece pela respiração.', pesos: { idoso: 5, adulto: 5, jovem: 4 } },
  { categoria: 'calma', tipo: 'frase', texto: 'Você não precisa resolver tudo hoje. Só o próximo passo já basta.', explicacao: 'A aflição diminui quando você encurta o foco pro agora.', pesos: { idoso: 4, adulto: 5, jovem: 5 } },
  { categoria: 'calma', tipo: 'frase', texto: 'A ansiedade mora no futuro; a paz mora no presente. Volte pra agora.', explicacao: 'Traga a atenção pro instante: é só aqui que dá pra respirar.', pesos: { idoso: 4, adulto: 5, jovem: 5 } },
  { categoria: 'calma', tipo: 'frase', texto: 'Tá tudo bem não estar tudo bem. Sentir é permitido; passar, também.', explicacao: 'Acolher a emoção é o primeiro passo pra ela se acalmar.', pesos: { idoso: 4, adulto: 5, jovem: 5 } },
  { categoria: 'calma', tipo: 'frase', texto: 'Solta o que você não controla. Suas mãos foram feitas pra cuidar, não pra carregar o mundo.', explicacao: 'Largar o incontrolável é um alívio, não uma derrota.', pesos: { idoso: 4, adulto: 5, jovem: 4 } },
  { categoria: 'calma', tipo: 'frase', texto: 'Descansar também é produtivo. Até a terra precisa de pousio pra dar fruto.', explicacao: 'Pausa não é preguiça; é o que te mantém inteiro.', pesos: { idoso: 5, adulto: 5, jovem: 3 } },
  { categoria: 'calma', tipo: 'frase', texto: 'Respira. O mesmo cuidado que te guardou ontem já está no seu amanhã.', explicacao: 'A proteção que te trouxe até aqui continua com você adiante.', pesos: { idoso: 6, adulto: 4, jovem: 2 } },
  { categoria: 'calma', tipo: 'frase', texto: 'Bom dia. Que hoje seja leve e cheio de pequenas alegrias.', explicacao: 'Um respiro de carinho pra começar o dia com o coração mais leve.', pesos: { idoso: 5, adulto: 3, jovem: 1 } },

  // ===================== AMOR & relações =====================
  { categoria: 'amor', tipo: 'frase', texto: 'Diga hoje o que você guarda pra dizer um dia: o amor não combina com adiamento.', explicacao: 'Palavras de afeto têm prazo melhor quando ditas agora.', pesos: { idoso: 5, adulto: 4, jovem: 4 } },
  { categoria: 'amor', tipo: 'frase', texto: 'Perdoar é soltar a corrente que prendia você ao que doeu.', explicacao: 'O perdão liberta primeiro quem perdoa.', pesos: { idoso: 5, adulto: 5, jovem: 3 } },
  { categoria: 'amor', tipo: 'frase', texto: 'Amar é torcer pelo bem do outro mesmo quando ninguém está vendo.', explicacao: 'O amor verdadeiro aparece nos gestos sem plateia.', pesos: { idoso: 5, adulto: 4, jovem: 4 } },
  { categoria: 'amor', tipo: 'frase', texto: 'Família não é perfeição; é gente imperfeita escolhendo ficar.', explicacao: 'O vínculo se constrói na permanência, não na ausência de falhas.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },
  { categoria: 'amor', tipo: 'frase', texto: 'Abrace mais. O toque diz o que as palavras às vezes não alcançam.', explicacao: 'Presença e carinho curam mais do que a gente imagina.', pesos: { idoso: 5, adulto: 4, jovem: 4 } },
  { categoria: 'amor', tipo: 'frase', texto: 'Quem ama cuida nos detalhes: lembra do café, do nome, do jeito.', explicacao: 'Amor se prova no pequeno e no constante.', pesos: { idoso: 4, adulto: 4, jovem: 4 } },
  { categoria: 'amor', tipo: 'frase', texto: 'Você é amado mesmo nos dias em que não produz nada.', explicacao: 'Seu valor não está no quanto você faz, mas em quem você é.', pesos: { idoso: 5, adulto: 4, jovem: 3 } },
];

// Planos de assinatura. A "isca" e um presente de estreia (uma vez, 1 centavo);
// a recorrencia e o mensal/trimestral/anual. Valores baixos pra comecar.
const PLANOS = [
  { slug: 'isca', nome: 'Presente de estreia', preco: 0.01, periodoDias: 1, destaque: '1 mensagem, só pra experimentar' },
  { slug: 'mensal', nome: 'Todo dia (mensal)', preco: 9.90, periodoDias: 30, destaque: 'Uma mensagem por dia no WhatsApp' },
  { slug: 'trimestral', nome: 'Todo dia (3 meses)', preco: 24.90, periodoDias: 90, destaque: 'Economize 16%' },
  { slug: 'anual', nome: 'Todo dia (1 ano)', preco: 79.90, periodoDias: 365, destaque: 'Melhor custo — 2 meses grátis' },
];

module.exports = { ACERVO, PLANOS };
