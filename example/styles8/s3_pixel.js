// styles8/s3_pixel.js: style 3, PIXEL ART (a 16-bit platformer at dusk). A 180 x 320 buffer, fixed palette, ordered (Bayer) dithering instead of gradients,
// shown x6 with smoothing off. The text is the 8 px font thresholded to whole pixels.
S8.push({ name: 'PIXEL ART', tech: '180 × 320 buffer · Bayer dither', init(stage) { this.c = cv(); stage.append(this.c); }, draw(t = 0) {
  const W = 180, H = 320, HY = 200, L = document.createElement('canvas'); L.width = W; L.height = H; const x = L.getContext('2d'), R = rng(3);
  const B4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], px = (a, b, col, w = 1, h = 1) => { x.fillStyle = col; x.fillRect(a | 0, b | 0, w, h); };
  const dith = (a, b, cols, f) => { f = clamp(f, 0, cols.length - 1.001); const i = Math.floor(f); px(a, b, (B4[b & 3][a & 3] + .5) / 16 < f - i ? cols[i + 1] : cols[i]); };
  const SKY = ['#1B1038', '#2D1B55', '#4B2372', '#7A2E7E', '#B13E72', '#E0565B', '#F58A4B', '#FFC25E'], NIGHT = '#1B1038';
  for (let b = 0; b < HY; b++) for (let a = 0; a < W; a++) dith(a, b, SKY, Math.pow(b / HY, 1.25) * 7);
  for (let i = 0; i < 46; i++) { const a = R() * W | 0, b = R() * 96 | 0; px(a, b, i % 3 ? '#B9A2E8' : '#FFE9A3'); if (i % 11 === 0) { px(a - 1, b, '#B9A2E8'); px(a + 1, b, '#B9A2E8'); px(a, b - 1, '#B9A2E8'); px(a, b + 1, '#B9A2E8'); } }
  const SX = 122, SY = 160, SR = 46;   // the sun, half under the horizon, with a dithered halo
  for (let b = SY - SR - 8; b < HY; b++) for (let a = SX - SR - 8; a <= SX + SR + 8; a++) { const d = Math.hypot(a - SX, b - SY); if (d < SR) dith(a, b, ['#FFF3C4', '#FFE08A', '#FFC25E', '#F58A4B'], (b - (SY - SR)) / (HY - SY + SR) * 3.2); else if (d < SR + 7 && (a + b) % 2 === 0) px(a, b, '#FFC25E'); }
  [[18, 58, 46], [76, 82, 64], [138, 66, 38], [-6, 118, 58], [56, 140, 52], [150, 128, 40]].forEach(([a, b, n]) => { const up = b < 100; px(a + 5, b, up ? '#7A2E7E' : '#E0565B', n - 12, 1); px(a, b + 1, up ? '#7A2E7E' : '#E0565B', n, 2); px(a + 7, b + 3, up ? '#B13E72' : '#FFC25E', n - 16, 1); });
  [[96, 104], [106, 98], [88, 112]].forEach(([a, b]) => { px(a, b, NIGHT); px(a + 1, b + 1, NIGHT); px(a + 2, b, NIGHT); });   // birds
  for (let a = 0; a < W; a++) { const h = 14 + 24 * vnoise(a * .032, 3) + 6 * vnoise(a * .16, 9) | 0, hn = 14 + 24 * vnoise((a + 1) * .032, 3) + 6 * vnoise((a + 1) * .16, 9) | 0; px(a, HY - h, '#4B2372', 1, h); px(a, HY - h, '#7A2E7E', 1, h > hn ? 3 : 1); }
  for (let a = 0; a < W; a++) { const h = 4 + 13 * vnoise(a * .05 + 40, 7) | 0; px(a, HY - h, '#2D1B55', 1, h); }
  for (let b = HY; b < H; b++) for (let a = 0; a < W; a++) {   // the water: dark bands, ripples, the sun's path
    const k = Math.min(1, (b - HY) / 62); dith(a, b, ['#4B2372', '#2D1B55', '#1B1038'], k * 2); const hw = 7 + k * 26, r = h2(a >> 2, b * 3.1);
    if (Math.abs(a - SX) < hw && r < .62 - k * .35 && b % 2 === 0) px(a, b, k < .3 ? '#FFE08A' : k < .65 ? '#FFC25E' : '#F58A4B'); else if (r > .93) px(a, b, '#7A2E7E');
  }
  const ground = (x0, x1, top) => { for (let b = top; b < H; b++) { const e = (h2(b, x1) * 4 | 0) + Math.min(6, (b - top) / 3 | 0); px(x0 < 1 ? 0 : x0 + e, b, '#120A26', x0 < 1 ? x1 - e : W - x0 - e, 1); }
    for (let a = x0; a < x1; a++) { px(a, top, '#39A383'); px(a, top + 1, '#1F5E5B', 1, 2 + (h2(a, 5) * 3 | 0)); if (h2(a, 2) > .72) px(a, top - 1, '#39A383'); if (h2(a, 8) > .9) px(a, top - 2, '#39A383'); }
    for (let i = 0; i < 60; i++) { const a = x0 + R() * (x1 - x0 - 8) | 0, b = top + 8 + R() * (H - top - 10) | 0; px(a, b, '#2D1B55', 2 + (R() * 3 | 0), 1); } };
  ground(0, 112, 240); ground(146, 180, 252);
  px(166, 224, '#FFE9A3', 1, 28); [[167, 224, 8], [167, 225, 7], [167, 226, 5], [167, 227, 3], [167, 228, 1]].forEach(([a, b, w]) => px(a, b, '#39A383', w, 1));   // the checkpoint flag
  const bob = Math.round(Math.sin(t * 5) * 1.5); [[118, 222], [129, 214], [140, 222]].forEach(([a, b]) => { b += bob; px(a + 1, b, '#B5482B', 4, 6); px(a, b + 1, '#B5482B', 6, 4); px(a + 1, b + 1, '#FFC25E', 4, 4); px(a + 2, b + 1, '#FFF3C4', 1, 3); });   // coins
  const S = 4, X0 = 26, Y0 = 200, rc = ([c, r, w, h], col, d = 0) => px(X0 + c * S - d, Y0 + r * S - d, col, w * S + 2 * d, h * S + 2 * d);   // Clawd, lit from the sun side
  CLAWD.body.forEach(q => rc(q, NIGHT, 1)); CLAWD.body.forEach(q => rc(q, '#E8743B'));
  px(X0 + 8, Y0, '#FFA35C', 48, 1); px(X0, Y0 + 16, '#FFA35C', 8, 1); px(X0 + 56, Y0 + 16, '#FFA35C', 8, 1); px(X0 + 55, Y0 + 1, '#FFC25E', 1, 15); px(X0 + 63, Y0 + 17, '#FFC25E', 1, 7);
  px(X0 + 8, Y0 + 1, '#B5482B', 2, 15); px(X0, Y0 + 22, '#B5482B', 64, 2); px(X0 + 8, Y0 + 30, '#B5482B', 48, 2); [3, 5, 10, 12].forEach(c => px(X0 + c * S, Y0 + 36, '#B5482B', S, 4));
  CLAWD.eyes.forEach(([c, r, w, h]) => { px(X0 + c * S + 1, Y0 + r * S, NIGHT, w * S, h * S); px(X0 + c * S + 3, Y0 + r * S + 1, '#FFE9A3'); });
  const tc = document.createElement('canvas'); tc.width = W; tc.height = 10; const tx = tc.getContext('2d', { willReadFrequently: true });
  const text = (s, a, b, col) => { tx.clearRect(0, 0, W, 10); tx.font = '8px "Press Start 2P"'; tx.textBaseline = 'top'; tx.fillText(s, 0, 1); const d = tx.getImageData(0, 0, W, 10).data; [[1, 1, NIGHT], [0, 0, col]].forEach(([ox, oy, c]) => { for (let j = 0; j < 10; j++) for (let i = 0; i < W; i++) if (d[(j * W + i) * 4 + 3] > 110) px(a + i + ox, b + j + oy, c); }); };
  const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  [0, 1, 2].forEach(n => HEART.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'X') px(8 + n * 10 + i, 9 + j, n < 2 ? '#E0565B' : '#4B2372'); })) || px(9 + n * 10, 10, n < 2 ? '#FFE9A3' : '#7A2E7E'));
  px(71, 9, '#B5482B', 4, 6); px(70, 10, '#B5482B', 6, 4); px(71, 10, '#FFC25E', 4, 4); px(72, 10, '#FFF3C4', 1, 3); text('x08', 79, 7, '#FFE9A3'); text('LV 5.2', 124, 7, '#FFE9A3');
  px(6, 268, '#FFE9A3', 168, 44); px(7, 269, NIGHT, 166, 42); px(9, 271, '#7A2E7E', 162, 1); px(9, 308, '#7A2E7E', 162, 1); text('CLAWD FOUND A NEW', 14, 277, '#FFE9A3'); text('ART STYLE!', 14, 291, '#FFC25E');
  if (Math.floor(t * 2) % 2 === 0) [[158, 300, 7], [159, 301, 5], [160, 302, 3], [161, 303, 1]].forEach(([a, b, w]) => px(a, b, '#FFE9A3', w, 1));
  const m = this.c.getContext('2d'); m.imageSmoothingEnabled = false; m.drawImage(L, 0, 0, FW, FH);
} });
