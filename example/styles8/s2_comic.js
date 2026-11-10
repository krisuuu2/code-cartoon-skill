// styles8/s2_comic.js: style 2, COMIC BOOK (the Spider-Verse print language). Canvas 2D: Ben-Day halftone instead of gradients, ink outline, a black extrusion,
// colour plates printed off-register (cyan / magenta fringes), speed lines, lettering, slanted gutters.
S8.push({ name: 'COMIC BOOK', tech: 'Canvas 2D', init(stage) { this.c = cv(); stage.append(this.c); }, draw() {
  const x = this.c.getContext('2d'), R = rng(7), INK = '#111', CY = '#00D2FF', MG = '#FF2D7F', YL = '#FFE600';
  const each = (L, u, fn) => L.forEach(([c, r, w, h]) => fn((c - 8) * u, (r - 5) * u, w * u, h * u));
  const pad = (u, p, col) => { x.fillStyle = col; each(CLAWD.body, u, (a, b, w, h) => x.fillRect(a - p, b - p, w + 2 * p, h + 2 * p)); };
  function dots(bx, by, bw, bh, step, rf, col) {   // a halftone screen at 30 degrees; rf(px, py) is the dot radius
    x.fillStyle = col; const ca = Math.cos(.52), sa = Math.sin(.52), n = Math.ceil(Math.hypot(bw, bh) / step / 2) + 1, mx = bx + bw / 2, my = by + bh / 2;
    for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) { const px = mx + (i * ca - j * sa) * step, py = my + (i * sa + j * ca) * step; if (px < bx - step || px > bx + bw + step || py < by - step || py > by + bh + step) continue; const r = rf(px, py); if (r > .5) { x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); } }
  }
  const poly = pts => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); };
  function clawd(u, o = {}) {   // drawn around its centre in the current transform
    const p = o.ink || 14;
    if (o.ext) for (let k = o.ext; k > 0; k--) { x.save(); x.translate(k * 1.5, k * 1.9); pad(u, p, INK); x.restore(); }
    if (o.fringe) { x.save(); x.translate(-26, -12); pad(u, p, CY); x.restore(); x.save(); x.translate(22, -24); pad(u, p, MG); x.restore(); }
    pad(u, p, INK); pad(u, 0, '#FF6A1F');
    x.save(); x.beginPath(); each(CLAWD.body, u, (a, b, w, h) => x.rect(a, b, w, h)); x.clip();
    dots(-8 * u, -5 * u, 16 * u, 10 * u, u * .36, (px, py) => clamp(px / (8 * u) * .55 + py / (5 * u) * .75 + .05) * u * .2, '#C4260A');
    x.strokeStyle = '#FFD23F'; x.lineCap = 'butt'; [[0, u * .5], [1, u * .28], [2, u * .13]].forEach(([i, w]) => { x.lineWidth = w; x.beginPath(); x.moveTo((-6.3 + i * .95) * u, -2.2 * u); x.lineTo((-4.3 + i * .95) * u, -5.2 * u); x.stroke(); });
    x.restore();
    each(CLAWD.eyes, u, (a, b, w, h) => { x.fillStyle = INK; x.fillRect(a - 3, b - 3, w + 6, h + 6); x.fillStyle = '#fff'; x.fillRect(a + w * .12, b + h * .08, w * .34, h * .2); });
  }
  const letter = (s, px, py, size, fill, rot = 0, sw = size * .1) => { x.save(); x.translate(px, py); x.rotate(rot); x.font = `${size}px Bangers`; x.textAlign = 'center'; x.lineJoin = 'round'; x.fillStyle = INK; x.fillText(s, sw * .7, sw * .8); x.lineWidth = sw; x.strokeStyle = INK; x.strokeText(s, 0, 0); x.fillStyle = fill; x.fillText(s, 0, 0); x.restore(); };
  x.fillStyle = '#F6F0E0'; x.fillRect(0, 0, FW, FH);

  // panel 1: the hit
  const P1 = [[40, 40], [1040, 40], [1040, 1240], [40, 1320]], C = [560, 740];
  x.save(); poly(P1); x.clip();
  for (let i = 0; i < 28; i++) { x.fillStyle = i % 2 ? MG : YL; x.beginPath(); x.moveTo(C[0], C[1]); x.arc(C[0], C[1], 1700, i / 28 * TAU + .06, (i + 1) / 28 * TAU + .06); x.fill(); }
  dots(40, 40, 1000, 1290, 24, (px, py) => clamp((Math.hypot(px - C[0], py - C[1]) - 330) / 760) * 11.5, 'rgba(140,0,80,.5)');
  const g = x.createRadialGradient(C[0], C[1], 0, C[0], C[1], 430); g.addColorStop(0, '#fff'); g.addColorStop(.45, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, FW, 1400);
  x.fillStyle = INK; for (let i = 0; i < 52; i++) { const a = R() * TAU, r1 = 500 + R() * 300, w = (6 + R() * 26) / 1700; x.beginPath(); x.moveTo(C[0] + Math.cos(a) * r1, C[1] + Math.sin(a) * r1); x.lineTo(C[0] + Math.cos(a - w) * 1700, C[1] + Math.sin(a - w) * 1700); x.lineTo(C[0] + Math.cos(a + w) * 1700, C[1] + Math.sin(a + w) * 1700); x.fill(); }
  const star = (px, py, r1, r2, n, fill, lw) => { x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU - .2, r = i % 2 ? r2 : r1 * (.86 + .28 * h2(i, n)); x.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r); } x.closePath(); x.fillStyle = fill; x.fill(); if (lw) { x.lineWidth = lw; x.strokeStyle = INK; x.lineJoin = 'miter'; x.stroke(); } };
  star(915, 668, 230, 118, 12, '#fff', 13); star(915, 668, 150, 80, 12, YL, 0);
  x.save(); x.translate(520, 790); x.rotate(-.2); x.transform(1, 0, -.15, 1, 0, 0); clawd(46, { ext: 30, fringe: 1 }); x.restore();
  letter('KA-POW!', 430, 430, 236, CY, -.11);
  x.font = '46px Bangers'; const cw = x.measureText('MEANWHILE, INSIDE THE TERMINAL…').width + 70; x.fillStyle = YL; x.fillRect(40, 40, cw, 98); x.lineWidth = 9; x.strokeStyle = INK; x.strokeRect(40, 40, cw, 98); x.fillStyle = INK; x.textAlign = 'left'; x.fillText('MEANWHILE, INSIDE THE TERMINAL…', 74, 106);
  x.restore(); poly(P1); x.lineWidth = 14; x.strokeStyle = INK; x.lineJoin = 'miter'; x.stroke();

  // panel 2: the close-up
  const P2 = [[40, 1354], [630, 1307], [630, 1880], [40, 1880]];
  x.save(); poly(P2); x.clip(); x.fillStyle = CY; x.fillRect(0, 1280, 700, 640);
  dots(40, 1300, 600, 580, 20, (px, py) => clamp((py - 1380) / 520) * 9.5, 'rgba(10,40,150,.5)');
  x.save(); x.translate(335, 1800); clawd(60, { ink: 12 }); x.restore();
  x.fillStyle = '#fff'; x.strokeStyle = INK; x.lineWidth = 9; x.beginPath(); x.moveTo(380, 1460); x.lineTo(430, 1545); x.lineTo(450, 1452); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.ellipse(322, 1418, 236, 62, -.04, 0, TAU); x.fill(); x.stroke(); x.beginPath(); x.moveTo(386, 1462); x.lineTo(428, 1532); x.lineTo(444, 1456); x.closePath(); x.fill();
  x.fillStyle = INK; x.font = '70px Bangers'; x.textAlign = 'center'; x.fillText("LET'S SHIP IT!", 322, 1443);
  x.restore(); poly(P2); x.lineWidth = 14; x.strokeStyle = INK; x.stroke();

  // panel 3: the caption
  const P3 = [[664, 1304], [1040, 1274], [1040, 1880], [664, 1880]];
  x.save(); poly(P3); x.clip(); x.fillStyle = MG; x.fillRect(640, 1250, 440, 660); dots(664, 1270, 380, 610, 22, (px, py) => clamp(1 - (py - 1290) / 420) * 10, 'rgba(255,230,0,.9)');
  ['EVERY', 'DOT', 'IS', 'CODE.'].forEach((s, i) => letter(s, 852, 1492 + i * 112, 122, i === 3 ? YL : '#fff', -.06, 13));
  x.restore(); poly(P3); x.lineWidth = 14; x.strokeStyle = INK; x.stroke();
  for (let i = 0; i < 14000; i++) { x.fillStyle = `rgba(${R() < .5 ? '0,0,0' : '255,255,255'},.06)`; x.fillRect(R() * FW, R() * FH, 2, 2); }   // paper tooth
} });
