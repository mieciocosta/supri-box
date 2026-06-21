/**
 * Sorteio ponderado por perfil.
 * Cada conteudo tem pesos = { idoso, adulto, jovem }. Peso 0 = nao concorre.
 * Quanto maior o peso, maior a chance — e o tipo de conteudo "puxa" por perfil
 * (idoso -> mais versiculo; jovem -> mais frase/vibe).
 *
 * @param {Array} itens     conteudos ativos
 * @param {string} perfil   "idoso" | "adulto" | "jovem"
 * @param {number[]} excluir ids ja entregues recentemente (evita repeticao)
 */
function sortear(itens, perfil, excluir = []) {
  const peso = (c) => (c.pesos && c.pesos[perfil]) || 0;

  let pool = itens.filter((c) => peso(c) > 0 && !excluir.includes(c.id));
  // se filtrou tudo (usuario ja viu o acervo todo), libera repeticao
  if (pool.length === 0) pool = itens.filter((c) => peso(c) > 0);
  if (pool.length === 0) return null;

  const total = pool.reduce((s, c) => s + peso(c), 0);
  let r = Math.random() * total;
  for (const c of pool) {
    r -= peso(c);
    if (r <= 0) return c;
  }
  return pool[pool.length - 1];
}

module.exports = { sortear };
