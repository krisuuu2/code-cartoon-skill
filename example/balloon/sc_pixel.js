// balloon/sc_pixel.js: scene 3 of THE BALLOON, PIXEL ART (the 16-bit platformer at dusk of styles8/s3_pixel.js). A 180 x 320 buffer, a fixed palette,
// ordered (Bayer) dithering instead of gradients, shown x6 with smoothing off. Everything moves in whole pixels; sprite frames change 12 times a second.
// A side-scroller: the camera is locked to Clawd, the world scrolls under him with parallax, and it stops at the castle gate.
(() => {
  const W = 180, H = 320, HY = 200, GY = 236, NIGHT = '#1B1038', AX = 117, AY = 93, SX = 122, SY = 160, SR = 46, CAM1 = 326, G0 = 98, G1 = 136, GT = 74;   // gate x0, x1, top (castle canvas pixels)
  const B4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], SKY = ['#1B1038', '#2D1B55', '#4B2372', '#7A2E7E', '#B13E72', '#E0565B', '#F58A4B', '#FFC25E'];
  let x, L, BG, CASTLE, BARS, tx, out;
  const px = (a, b, col, w = 1, h = 1) => { if (w > 0 && h > 0) { x.fillStyle = col; x.fillRect(a | 0, b | 0, w, h); } };
  const dith = (a, b, cols, f) => { f = clamp(f, 0, cols.length - 1.001); const i = Math.floor(f); px(a, b, (B4[b & 3][a & 3] + .5) / 16 < f - i ? cols[i + 1] : cols[i]); };
  const ss = (a, b, v) => { v = clamp((v - a) / (b - a)); return v * v * (3 - 2 * v); }, mod = (a, n) => ((a % n) + n) % n, mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  function text(s, a, b, col, sh = NIGHT) {   // the 8 px font thresholded to whole pixels
    tx.clearRect(0, 0, W, 10); tx.font = '8px "Press Start 2P"'; tx.textBaseline = 'top'; tx.fillText(s, 0, 1); const d = tx.getImageData(0, 0, W, 10).data;
    (sh ? [[1, 1, sh], [0, 0, col]] : [[0, 0, col]]).forEach(([ox, oy, c]) => { for (let j = 0; j < 10; j++) for (let i = 0; i < W; i++) if (d[(j * W + i) * 4 + 3] > 110) px(a + i + ox, b + j + oy, c); });
  }
  const gateTop = a => { const d = Math.min(a - G0, G1 - 1 - a); return d < 0 ? 999 : GT + (d < 1 ? 6 : d < 2 ? 4 : d < 4 ? 2 : d < 7 ? 1 : 0); }, inGate = (a, b) => b >= gateTop(a);

  function paintBG() {   // fixed: the dithered sky, the stars, the big sun, the water's bands
    const R = rng(3);
    for (let b = 0; b < HY; b++) for (let a = 0; a < W; a++) dith(a, b, SKY, Math.pow(b / HY, 1.25) * 7);
    for (let i = 0; i < 46; i++) { const a = R() * W | 0, b = R() * 96 | 0; px(a, b, i % 3 ? '#B9A2E8' : '#FFE9A3'); if (i % 11 === 0) { px(a - 1, b, '#B9A2E8'); px(a + 1, b, '#B9A2E8'); px(a, b - 1, '#B9A2E8'); px(a, b + 1, '#B9A2E8'); } }
    for (let b = SY - SR - 8; b < HY; b++) for (let a = SX - SR - 8; a <= SX + SR + 8; a++) { const d = Math.hypot(a - SX, b - SY); if (d < SR) dith(a, b, ['#FFF3C4', '#FFE08A', '#FFC25E', '#F58A4B'], (b - (SY - SR)) / (HY - SY + SR) * 3.2); else if (d < SR + 7 && (a + b) % 2 === 0) px(a, b, '#FFC25E'); }
    for (let b = HY; b < H; b++) for (let a = 0; a < W; a++) dith(a, b, ['#4B2372', '#2D1B55', '#1B1038'], Math.min(1, (b - HY) / 62) * 2);
  }
  function paintCastle() {   // fixed: the wall (transparent where the gate is) and the stone floor, in screen pixels at the final camera
    for (let a = 70; a < W; a++) for (let b = 56; b < GY; b++) {
      if (b < 62 && (a - 70) % 12 >= 7) continue; if (inGate(a, b)) continue;
      const row = (b - 62 + 800) >> 3, ax = a - 70 + (row & 1 ? 6 : 0), bx = ax % 12, by = (b - 62 + 800) & 7, near = inGate(a - 2, b) || inGate(a + 2, b) || inGate(a, b + 2) || inGate(a - 1, b + 1) || inGate(a + 1, b + 1);
      let col = by === 7 || bx === 11 ? NIGHT : by === 0 ? '#4B2372' : (h2(ax / 12 | 0, row) > .76 && ((a + b) & 1)) ? '#4B2372' : '#2D1B55';
      if (near) col = (a + b) % 6 === 0 ? NIGHT : '#7A2E7E'; if (a < 72) col = a === 70 ? '#B13E72' : '#7A2E7E'; if (b === 56 || (b === 62 && (a - 70) % 12 >= 7)) col = '#7A2E7E';
      px(a, b, col);
    }
    for (let b = GY; b < H; b++) { const e = 4 + (h2(b, 4) * 4 | 0) + Math.min(6, (b - GY) / 3 | 0); px(e, b, '#120A26', W - e, 1); }
    for (let a = 4; a < W; a++) { px(a, GY, a % 10 === 3 ? '#4B2372' : '#7A2E7E'); px(a, GY + 1, '#4B2372', 1, 2); if (h2(a >> 2, 7) > .8 && (a & 3) === 0) px(a, GY + 8 + (h2(a, 3) * 60 | 0), '#2D1B55', 3, 1); }
    px(82, 40, '#FFE9A3', 1, 16); [[83, 40, 8], [83, 41, 7], [83, 42, 5], [83, 43, 3], [83, 44, 1]].forEach(([a, b, w]) => px(a, b, '#E0565B', w, 1));   // the banner
  }
  function paintBars() {   // fixed: the portcullis, drawn over whatever is behind the gate
    [2, 9, 16, 23, 30].forEach(o => { const a = G0 + o; px(a, gateTop(a), '#4B2372', 1, GY - gateTop(a)); px(a + 1, gateTop(a + 1), '#120A26', 1, GY - gateTop(a + 1)); });
    for (let b = 90; b < GY - 4; b += 16) { px(G0, b, '#4B2372', G1 - G0, 1); px(G0, b + 1, '#120A26', G1 - G0, 1); [2, 9, 16, 23, 30].forEach(o => px(G0 + o, b, '#B9A2E8')); }
  }
  function world(cam, u) {   // everything far away, with parallax: clouds, birds, two ridges, the ripples and the sun's path on the water
    x.drawImage(BG, 0, 0);
    [[18, 58, 46], [76, 82, 64], [138, 66, 38], [-6, 118, 58], [56, 140, 52], [150, 128, 40]].forEach(([a, b, n]) => { a = mod(a - Math.round(cam * .06) + 70, W + 80) - 70; const up = b < 100; px(a + 5, b, up ? '#7A2E7E' : '#E0565B', n - 12, 1); px(a, b + 1, up ? '#7A2E7E' : '#E0565B', n, 2); px(a + 7, b + 3, up ? '#B13E72' : '#FFC25E', n - 16, 1); });
    const fl = Math.floor(u * 3) % 2; [[96, 104], [106, 98], [88, 112]].forEach(([a, b]) => { a = mod(a - Math.round(cam * .1) - Math.floor(u * 2), W + 20) - 10; px(a, b - fl, NIGHT); px(a + 1, b + 1 - fl, NIGHT); px(a + 2, b - fl, NIGHT); });
    const o1 = Math.round(cam * .15), o2 = Math.round(cam * .3), far = a => 14 + 24 * vnoise(a * .032, 3) + 6 * vnoise(a * .16, 9) | 0;
    for (let a = 0; a < W; a++) { const h = far(a + o1), hn = far(a + o1 + 1); px(a, HY - h, '#4B2372', 1, h); px(a, HY - h, '#7A2E7E', 1, h > hn ? 3 : 1); }
    for (let a = 0; a < W; a++) { const h = 4 + 13 * vnoise((a + o2) * .05 + 40, 7) | 0; px(a, HY - h, '#2D1B55', 1, h); }
    const ow = Math.round(cam * .6) + Math.floor(u * 3), tw = Math.floor(u * 4);
    for (let b = HY; b < H; b++) for (let a = 0; a < W; a++) { const k = Math.min(1, (b - HY) / 62), hw = 7 + k * 26;
      if (Math.abs(a - SX) < hw && b % 2 === 0 && h2((a >> 2) + tw * 31, b * 3.1) < .62 - k * .35) px(a, b, k < .3 ? '#FFE08A' : k < .65 ? '#FFC25E' : '#F58A4B'); else if (h2((a + ow) >> 2, b * 3.1) > .93) px(a, b, '#7A2E7E'); }
  }
  const grass = (a, wa) => { px(a, GY, '#39A383'); px(a, GY + 1, '#1F5E5B', 1, 2 + (h2(wa, 5) * 3 | 0)); if (h2(wa, 2) > .72) px(a, GY - 1, '#39A383'); if (h2(wa, 8) > .9) px(a, GY - 2, '#39A383'); };
  function cliff(cam) { const x1 = 60 - cam; if (x1 <= 0) return; for (let b = GY; b < H; b++) px(0, b, '#120A26', x1 - (h2(b, 112) * 4 | 0) - Math.min(6, (b - GY) / 3 | 0), 1); for (let a = 0; a < x1; a++) { grass(a, a + cam); if (h2((a + cam) >> 2, 7) > .7 && ((a + cam) & 3) === 0 && a < x1 - 14) px(a, GY + 10 + (h2(a + cam, 3) * 60 | 0), '#2D1B55', 3, 1); } }
  function platform(c, cam) { const x0 = c - 22 - cam, x1 = c + 22 - cam; if (x1 < 0 || x0 >= W) return; for (let d = 0; d < 13; d++) { const e = (d * d / 10 | 0) + (h2(d, c) * 2 | 0); px(x0 + e, GY + d, '#120A26', x1 - x0 - 2 * e, 1); } for (let a = x0; a < x1; a++) grass(a, a + cam); px(x0 + 9, GY + 6, '#2D1B55', 4, 1); px(x0 + 24, GY + 8, '#2D1B55', 3, 1); }
  function coin(a, b, f) { const w = [6, 4, 2, 4][f & 3], o = (6 - w) / 2; px(a + o + (w > 2 ? 1 : 0), b, '#B5482B', w > 2 ? w - 2 : 2, 6); px(a + o, b + 1, '#B5482B', w, 4); px(a + o + (w > 2 ? 1 : 0), b + 1, '#FFC25E', w > 2 ? w - 2 : 2, 4); if (w > 2) px(a + o + 2, b + 1, '#FFF3C4', 1, 3); }
  function balloon(cx, cy, rx = 11, wig = 0) {   // radius 11 = 64 screen pixels, plus a one-pixel outline
    for (let b = -12; b <= 12; b++) for (let a = -12; a <= 12; a++) { const d = Math.hypot(a * 11 / rx, b); if (d <= 11.7) px(cx + a, cy + b, d > 10.7 ? NIGHT : Math.hypot(a + 3, b + 3) > 10.2 ? '#B13E72' : '#E0565B'); }
    if (rx > 8) { px(cx - 6, cy - 5, '#FFE9A3', 1, 3); px(cx - 5, cy - 7, '#FFE9A3', 2, 1); px(cx - 4, cy - 8, '#FFC25E', 2, 1); }
    px(cx - 1, cy + 12, NIGHT, 3, 2); px(cx, cy + 12, '#B13E72'); if (wig >= 0) for (let i = 0; i < 14; i++) px(cx + [0, 0, 1, 1, 0, 0, -1, -1][(i + wig) & 7], cy + 14 + i, '#FFE9A3');
  }
  // Clawd: the 16 x 10 grid at 3 px per cell (48 x 30), lit from the sun side. Rows -8..31 so that a raised arm and drips fit.
  function clawdMap(legs = [6, 6, 6, 6], sq = 0, arm = 0, drip = null) {
    const m = [...Array(40)].map(() => Array(48).fill(null)), set = (i, j, c) => { if (j >= -8 && j < 32 && i >= 0 && i < 48) m[j + 8][i] = c; }, rect = (a, b, w, h, c) => { for (let j = b; j < b + h; j++) for (let i = a; i < a + w; i++) set(i, j, c); };
    const O = '#E8743B', HI = '#FFA35C', SH = '#B5482B', RIM = '#FFC25E', ey = 6 + (sq >> 1);
    rect(6, sq, 36, 24 - sq, O); rect(0, 12, arm ? 42 : 48, 6, O); [9, 15, 30, 36].forEach((a, n) => { rect(a, 24, 3, legs[n], O); rect(a, 24 + Math.max(0, legs[n] - 2), 3, Math.min(2, legs[n]), SH); });
    rect(6, sq, 36, 1, HI); rect(0, 12, 6, 1, HI); rect(41, sq + 1, 1, 11 - sq, RIM); rect(6, sq + 1, 2, 11 - sq, SH); rect(0, 16, arm ? 42 : 48, 2, SH); rect(6, 22, 36, 2, SH);
    if (arm) { rect(42, -7, 5, 25, O); rect(42, -7, 5, 1, HI); rect(46, -6, 1, 24, RIM); } else { rect(42, 12, 6, 1, HI); rect(47, 13, 1, 5, RIM); }
    rect(13, ey, 3, 6, NIGHT); rect(34, ey, 3, 6, NIGHT); set(15, ey + 1, '#FFE9A3'); set(36, ey + 1, '#FFE9A3');
    if (drip) for (let i = 0; i < 48; i++) { const leg = [9, 15, 30, 36].some(a => i >= a && i < a + 3), n = drip(i); if (leg || n <= 0) continue; const y0 = i < 6 || i > 41 ? 18 : 24; for (let k = 0; k < Math.min(n, 30 - y0); k++) set(i, y0 + k, k === n - 1 ? HI : i % 3 ? O : SH); }
    return m;
  }
  function drawClawd(m, sx, sy, o = {}) {   // (sx, sy) = top-left of the 48 x 30 body. o.flash, o.shear (pixels per column), o.melt 0..1 (columns sink into the ground)
    const cells = [];
    for (let j = -8; j < 32; j++) for (let i = 0; i < 48; i++) { const c = m[j + 8][i]; if (!c) continue; let y = j;
      if (o.melt) { const mi = clamp(o.melt * 1.4 - vnoise(i * .3, 7) * .3 - h2(i, 7) * .1); y = 30 - Math.round((30 - j) * (1 - mi)); if (y >= 30) continue; }
      if (o.shear) y += Math.round((i - 24) * o.shear); cells.push([sx + i, sy + y, o.flash && c !== NIGHT ? '#FFF3C4' : c]); }
    cells.forEach(([a, b]) => px(a - 1, b - 1, NIGHT, 3, 3)); cells.forEach(([a, b, c]) => px(a, b, c));
  }
  const GUARD = ['.....rr.........', '....rrrr........', '....rrr.........', '...hhhhhhh......', '..hHhhhhhhh.....', '..hHhhhhhhh.....', '..hhhhhhhhh.....', '.hhhhhhhhhhh....', '..ffffffhhh.....', '..fefffehhh.....', '..ffffffdhh.....', '..ffmmffd.......', '...ffffd........',
    '..aaaaaaaaa.....', '.aAaaaaaaaaa....', '.aAaayaaaaaa....', '.aAayyyaaaaa....', 'ffAaayaaaaaff...', 'ffAaaaaaaaaff...', '..aaaaaaaaa.....', '..bbbbbbbbb.....', '..aaaaaaaaa.....', '..aaaa.aaaa.....', '..llll.llll.....', '..llll.llll.....', '..llll.llll.....', '..llll.llll.....', '..llll.llll.....', '.kkkkk.kkkk.....', '.kkkkk.kkkk.....'];
  const GCOL = { r: '#E0565B', h: '#B9A2E8', H: '#FFE9A3', f: '#FFC25E', d: '#F58A4B', e: NIGHT, a: '#39A383', A: '#1F5E5B', y: '#FFC25E', b: '#FFE9A3', l: '#1F5E5B', k: '#B5482B' };
  function guard(gx, up, open) {   // helmet, plume, spear; up = the spear (and he) lifted before a stamp; open = mouth
    const top = GY - 30 - (up ? 1 : 0), st = GY - 46 - (up ? 3 : 0), sx = gx - 1;
    px(sx - 1, st - 7, NIGHT, 4, GY - st + 7 - (up ? 3 : 0)); px(sx - 2, st - 5, NIGHT, 6, 5); px(sx, st, '#B5482B', 2, GY - st - (up ? 3 : 0)); px(sx, st, '#FFC25E', 1, GY - st - (up ? 3 : 0)); px(sx, st - 6, '#FFE9A3', 2, 2); px(sx - 1, st - 4, '#B9A2E8', 4, 3); px(sx, st - 1, '#B9A2E8', 2, 1);
    GUARD.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') px(gx + i - 1, top + j - 1, NIGHT, 3, 3); }));
    GUARD.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') px(gx + i, top + j, ch === 'm' ? (open ? NIGHT : '#B5482B') : GCOL[ch]); }));
  }
  const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  function hud(coins) {
    [0, 1, 2].forEach(n => { HEART.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'X') px(8 + n * 10 + i, 9 + j, n < 2 ? '#E0565B' : '#4B2372'); })); px(9 + n * 10, 10, n < 2 ? '#FFE9A3' : '#7A2E7E'); });
    px(71, 9, '#B5482B', 4, 6); px(70, 10, '#B5482B', 6, 4); px(71, 10, '#FFC25E', 4, 4); px(72, 10, '#FFF3C4', 1, 3); text('x0' + coins, 79, 7, '#FFE9A3'); text('LV 5.2', 124, 7, '#FFE9A3');
  }
  function dialog(name, lines, n, prompt) {   // a game dialog box at the top, clear of the subtitle band; n = letters typed so far
    px(6, 26, '#FFE9A3', 168, 37); px(7, 27, NIGHT, 166, 35); px(9, 29, '#7A2E7E', 162, 1); px(9, 59, '#7A2E7E', 162, 1); px(10, 19, '#FFE9A3', name.length * 8 + 5, 11); text(name, 13, 20, NIGHT, null);
    lines.forEach((s, i) => { const t = s.slice(0, Math.max(0, n)); n -= s.length; if (t) text(t, 13, 32 + i * 12, i ? '#FFC25E' : '#FFE9A3'); });
    if (prompt) [[160, 53, 7], [161, 54, 5], [162, 55, 3], [163, 56, 1]].forEach(([a, b, w]) => px(a, b, '#FFE9A3', w, 1));
  }
  const blit = dy => { out.imageSmoothingEnabled = false; out.fillStyle = NIGHT; out.fillRect(0, 0, FW, FH); out.drawImage(L, 0, dy * 6, FW, FH); };
  const runX = (u, S) => 30 + 336 * clamp((u - S.lines[0].t0) / (S.marks.gate - S.lines[0].t0)), uOfX = (X, S) => S.lines[0].t0 + (X - 30) / 336 * (S.marks.gate - S.lines[0].t0);   // Clawd's place in the world; hops of 80 px start at X = 38
  const stamps = S => { const l = S.lines[1]; return [0, 1, 3, 6].map(i => l.t0 + l.words[i][1]); };   // "Halt!", "Nothing", "gets", "bars"

  FILM.add({ id: 'pixel',
    init(el) {
      const c = cv(); el.append(c); out = c.getContext('2d'); L = mk(); BG = mk(); CASTLE = mk(); BARS = mk(); const tc = document.createElement('canvas'); tc.width = W; tc.height = 10; tx = tc.getContext('2d', { willReadFrequently: true });
      x = BG.getContext('2d'); paintBG(); x = CASTLE.getContext('2d'); paintCastle(); x = BARS.getContext('2d'); paintBars(); x = L.getContext('2d');
    },
    draw(u, S) {
      const T0 = S.lines[0].t0, T1 = S.marks.gate, L2 = S.lines[1], L3 = S.lines[2], X = runX(u, S), p = (X - 30) / 336, cam = Math.round(CAM1 * p), f12 = Math.floor(u * 12 + 1e-6), f10 = Math.floor(u * 10 + 1e-6), co = CAM1 - cam;
      world(cam, u); cliff(cam); [118, 198, 278].forEach(c => platform(c, cam)); x.drawImage(CASTLE, co, 0);
      [90, 144].forEach(a => { px(a + co, 150, '#120A26', 2, 5); const fl = (f10 + a) % 2; px(a + co - 1, 146 - fl, '#F58A4B', 4, 4 + fl); px(a + co, 145 - fl, '#FFC25E', 2, 3); px(a + co + fl, 143 - fl, '#FFE9A3'); });   // torches
      // the balloon floats ahead of him, then slips between the bars and waits behind them, on the anchor
      const away = ss(T0, T0 + 1, u), back = ss(T1 + .1, T1 + .75, u), ox = Math.round(-26 * away * (1 - back)), oy = Math.round(12 * away * (1 - ss(T1 - .3, T1 + .3, u)) + Math.sin(u * 2.2) * 1.2 * (1 - ss(S.dur - 1, S.dur - .2, u)));
      const squeeze = back > 0 && ox < -9 && ox > -21, behind = back > 0 && ox >= -14, bal = () => balloon(AX + ox, AY + oy, squeeze ? 5 : 11, Math.floor(u * 4));
      if (behind) bal(); x.drawImage(BARS, co, 0);
      const got = [78, 158, 238, 318].map(cx => X >= cx); [78, 158, 238, 318].forEach((cx, i) => { const a = cx - 3 - cam, t = u - uOfX(cx, S);   // coins: spin, then pop
        if (!got[i]) coin(a, 184 + Math.round(Math.sin(u * 5 + i) * 1.5), f10); else if (t < .35) { const r = 2 + Math.round(t * 22); coin(a, 184 - Math.round(t * 30), 2); [[r, 0], [-r, 0], [0, r], [0, -r]].forEach(([dx, dy]) => px(a + 3 + dx, 187 + dy, '#FFF3C4')); } });
      // the guard: he stamps the spear on each phrase and his mouth moves while his line plays
      const g = u - L2.t0, talk = g >= 0 && g < L2.dur, ST = stamps(S), up = ST.some(t => u >= t - .16 && u < t), hitT = ST.find(t => u >= t && u < t + .25), gx = 80 + co;
      if (gx < W) { guard(gx, up, talk && f10 % 2 === 0 && L2.words.some(([, a, b]) => g > a - .05 && g < b + .05)); if (hitT != null) { const k = Math.round((u - hitT) * 24); px(gx - 3 - k, GY - 1 - (k >> 1), '#B9A2E8'); px(gx + 2 + k, GY - 1 - (k >> 1), '#B9A2E8'); px(gx - 2 - k, GY - 3, '#7A2E7E'); } }
      // Clawd: hops of 80 px over the water, then the gate; he blinks, drips and melts
      const c3 = u - L3.t0, mo = u - S.marks.out, d = X - 38; let h = 0, legs = [6, 6, 6, 6], sq = 0, dust = 0;
      if (u < T0) { if (u > T0 - .3) sq = 2; } else if (p < 1) { if (d < 0 || d >= 320) legs = f12 % 2 ? [6, 3, 6, 3] : [3, 6, 3, 6]; else { const j = (d % 80) / 80; h = Math.round(4 * j * (1 - j) * 34); if (h < 3) { sq = 2; dust = d > 40; } else legs = j < .5 ? [4, 5, 4, 5] : [5, 4, 5, 4]; } } else if (u < T1 + .15) { sq = 2; dust = 1; }
      const sxp = Math.round(X) - cam - 24, syp = GY - 30 - h - (c3 >= 0 && c3 < L3.dur && f12 % 4 < 2 ? 1 : 0), drip = c3 > .8 ? i => Math.floor((c3 - .8 - h2(i, 3) * .9) * 9 * (.5 + h2(i, 9))) : null, melt = clamp(mo / 1.0);
      if (dust) { px(sxp - 3, GY - 1, '#B9A2E8', 2, 1); px(sxp + 49, GY - 1, '#B9A2E8', 2, 1); px(sxp - 5, GY - 3, '#7A2E7E'); px(sxp + 52, GY - 3, '#7A2E7E'); }
      if (melt < 1) drawClawd(clawdMap(legs, sq, 0, drip), sxp, syp, { flash: c3 >= 0 && c3 < .8 && f12 % 2 === 0, melt });
      if (c3 > 1.1 && mo < .6) for (let i = 0; i < 4; i++) { const t = mod(c3 * 1.6 + i * .27, 1), a = sxp + 3 + i * 13; if (c3 * 1.6 + i * .27 > 1.2) px(a, Math.min(GY - 1, syp + 18 + Math.round(t * t * 14)), '#E8743B', 1, 2); }   // loose drops
      if (mo > .1) { const fl = clamp((mo - .1) / .6), l = sxp + 4 - Math.round(3 * melt), r = sxp + 44 + Math.round(fl * fl * 46); px(l - 1, GY - 3, NIGHT, r - l + 2, 3); px(l, GY - 2, '#E8743B', r - l, 2); px(l + 2, GY - 2, '#FFA35C', r - l - 5, 1); px(l + 4 + (f12 * 5) % Math.max(1, r - l - 8), GY - 2, '#FFF3C4', 2, 1); if (mo > .35) text('!', gx + 3, GY - 43, '#FFE9A3'); }   // the puddle runs for the gate
      if (!behind) bal();
      hud(got.filter(Boolean).length);
      if (g >= 0 && mo < 0) { if (c3 >= 0) dialog('CLAWD', ['THEN I WILL NOT', 'BE SOLID.'], Math.floor((c3 - .15) * 15), c3 > 1.9 && f12 % 6 < 3); else g < L2.words[1][1] - .1 ? dialog('GUARD', ['HALT!'], Math.floor((g - .03) * 30), g > .3 && f12 % 6 < 3) : dialog('GUARD', ['NOTHING SOLID GETS', 'THROUGH THESE BARS.'], Math.floor((g - L2.words[1][1] + .05) * 21), g > 2.5 && f12 % 6 < 3); }
      blit(hitT != null && u - hitT < .07 ? 1 : 0);
    },
    glide(g) {   // the dusk sky, the big sun, the sea and a few platforms; Clawd's sprite under the pixel balloon, all snapped to the grid
      const cam = Math.round(g.k * 30), cx = Math.round(g.x / 6), cy = Math.round(g.y / 6), bx = Math.round(g.bx / 6), by = Math.round(g.by / 6), sh = Math.tan(g.rot), hx = cx + 20, hy = cy - 15 - 7 + Math.round(20 * sh);
      world(cam, g.k * 3); [44, 150, 236].forEach(c => platform(c, cam)); coin(147 - cam, 222, Math.floor(g.k * 12));
      const n = Math.max(Math.abs(hx - bx), Math.abs(hy - by - 13)); for (let i = 0; i <= n; i++) px(Math.round(bx + (hx - bx) * i / n), Math.round(by + 13 + (hy - by - 13) * i / n), '#FFE9A3');   // the string, to his raised arm
      balloon(bx, by, 11, -1); drawClawd(clawdMap([6, 6, 6, 6], 0, 1), cx - 24, cy - 15, { shear: sh }); blit(0);
    },
    sfx: {
      px_jump: { prompt: '8-bit video game jump, one short rising square-wave blip, no music, no speech', dur: .5 },
      px_coin: { prompt: '8-bit video game coin pickup, two bright quick notes, no music, no speech', dur: .6 },
      px_step: { prompt: '8-bit video game landing, one short low noise thud, no music, no speech', dur: .5 },
      px_slip: { prompt: '8-bit video game squeeze, one short squeaky pitch bend up, no music, no speech', dur: .6 },
      px_stamp: { prompt: '8-bit video game heavy stomp, one low square-wave thump with a short noise burst, no music, no speech', dur: .6 },
      px_blink: { prompt: '8-bit video game flicker, fast repeating high blips like a character flashing, no music, no speech', dur: .9 },
      px_melt: { prompt: '8-bit video game melting, bit-crushed blips sliding down in pitch into a low bubbling, no music, no speech', dur: 2 } },
    amb: { prompt: 'quiet open sea at dusk, soft small waves and a light wind, lo-fi, no music, no speech', gain: -26 },
    cues(S) { const r = v => +v.toFixed(2), o = []; [0, 1, 2, 3].forEach(k => { o.push(['px_jump', r(uOfX(38 + 80 * k, S)), -8], ['px_coin', r(uOfX(78 + 80 * k, S)), -7]); });
      o.push(['px_step', r(S.marks.gate), -6], ['px_slip', r(S.marks.gate + .3), -9]); stamps(S).forEach((t, i) => o.push(['px_stamp', r(t), i ? -8 : -5]));
      o.push(['px_blink', r(S.lines[2].t0), -10], ['px_melt', r(S.marks.out - .9), -8], ['px_melt', r(S.marks.out), -4]); return o; }
  });
})();
