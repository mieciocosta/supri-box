// Gera os icones PNG do app (orbe da marca) sem nenhuma dependencia externa.
// Roda no build (postinstall) e escreve em frontend/icons/. Encoder PNG proprio
// usando apenas zlib nativo — assim nao precisamos versionar binarios no repo.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'frontend', 'icons');

// ---- mini encoder PNG (RGBA, 8 bits) ----
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filtro none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---- helpers de cor ----
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const hex = (h) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
const mix = (a, b, t) => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x-e0)/(e1-e0))); return t*t*(3-2*t); };

const ACCENT      = hex('#82b09c'); // eucalipto (marca)
const ACCENT_LT   = hex('#def0e8');
const ACCENT_DK   = hex('#244236');
const BG_TOP      = hex('#141a24');
const BG_BOT      = hex('#0d1015');
const WHITE       = [255,255,255];

// padding: fracao do raio do orbe (maskable precisa de mais respiro)
function render(N, orbFrac) {
  const buf = Buffer.alloc(N * N * 4);
  const cx = N * 0.5, cy = N * 0.46, R = N * orbFrac;
  const hx = cx - R * 0.34, hy = cy - R * 0.38; // brilho especular
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      // fundo (gradiente vertical)
      let col = mix(BG_TOP, BG_BOT, y / N);
      const dx = x - cx, dy = y - cy, dist = Math.hypot(dx, dy);
      // halo externo suave
      const halo = (1 - smooth(R * 0.9, R * 2.0, dist)) * 0.5;
      if (halo > 0 && dist > R) col = mix(col, ACCENT, halo * 0.35);
      // corpo do orbe
      if (dist < R + 1.5) {
        const t = Math.min(1, dist / R);
        let body = mix(ACCENT_LT, ACCENT, Math.pow(t, 0.7));
        body = mix(body, ACCENT_DK, smooth(0.55, 1.0, t)); // escurece a borda
        const hd = Math.hypot(x - hx, y - hy);
        const spec = Math.pow(1 - Math.min(1, hd / (R * 0.85)), 2) * 0.85; // brilho
        body = mix(body, WHITE, spec);
        const cover = 1 - smooth(R - 1.2, R + 1.2, dist); // anti-alias da borda
        col = mix(col, body, cover);
      }
      const i = (y * N + x) * 4;
      buf[i] = clamp(col[0]); buf[i+1] = clamp(col[1]); buf[i+2] = clamp(col[2]); buf[i+3] = 255;
    }
  }
  return encodePNG(N, N, buf);
}

fs.mkdirSync(OUT, { recursive: true });
const jobs = [
  ['icon-192.png', 192, 0.30],
  ['icon-512.png', 512, 0.30],
  ['maskable-512.png', 512, 0.24],   // mais respiro pra mascara adaptativa
  ['apple-touch-icon.png', 180, 0.32],
  ['favicon-64.png', 64, 0.34],
];
for (const [name, size, frac] of jobs) {
  fs.writeFileSync(path.join(OUT, name), render(size, frac));
  console.log('icone gerado:', name);
}
console.log('Icones em frontend/icons/ ✅');
