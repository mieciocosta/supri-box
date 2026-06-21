// Validacao e saneamento de entrada (defensivo, sem dependencia externa).

// Corta espacos e limita o tamanho de um texto livre.
function limparTexto(s, max = 80) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, max);
}

// Normaliza e valida um WhatsApp brasileiro. Retorna "55DDDNUMERO" ou null.
// Aceita com/sem +55, com mascara, etc. Exige DDD valido (11-99) e celular (9).
function validarWhatsapp(raw) {
  let d = String(raw == null ? '' : raw).replace(/\D/g, '');
  if (d.length === 13 && d.startsWith('55')) d = d.slice(2);
  if (d.length === 12 && d.startsWith('55')) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null; // DDD + 8 ou 9 digitos
  const ddd = parseInt(d.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return null;
  if (d.length === 11 && d[2] !== '9') return null; // celular: 9 apos o DDD
  if (d.length === 10 && !/[2-9]/.test(d[2])) return null; // fixo/WhatsApp Business
  return '55' + d;
}

// Valida email (opcional). Retorna o email em minusculas ou null.
function validarEmail(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase().slice(0, 120);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null;
}

// Nome opcional: limpa, limita e exige >= 2 chars se preenchido.
function validarNome(raw) {
  const s = limparTexto(raw, 60);
  if (!s) return '';
  if (s.length < 2) return null;
  return s;
}

const PERFIS = ['idoso', 'adulto', 'jovem'];
function normalizarPerfil(raw) {
  const p = String(raw || 'adulto').toLowerCase();
  return PERFIS.includes(p) ? p : 'adulto';
}

module.exports = { limparTexto, validarWhatsapp, validarEmail, validarNome, normalizarPerfil, PERFIS };
