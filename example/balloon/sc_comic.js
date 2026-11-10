// balloon/sc_comic.js: scene 2 of THE BALLOON, COMIC BOOK (the print language of styles8/s2_comic.js). Canvas 2D: Ben-Day halftone instead of gradients,
// ink outline, a black extrusion, colour plates printed off-register, speed lines, Bangers lettering, slanted gutters. Poses change "on twos" (15 per second).
// Page A (until lines[0]): the hit, seen from the balloon's side of the wall. Page B: one long strip of panels that runs under Clawd and stops on the shore.
(() => {
  const INK = '#111', CY = '#00D2FF', MG = '#FF2D7F', YL = '#FFE600', PAPER = '#F6F0E0', DUSK = '#2D1B55', GY = 1400, HX = 300, END = 2480, GUT = [900, 1700, 2500], A = FILM.ANCHOR;
  let x;
  const fr15 = u => Math.floor(u * 15 + 1e-6), ss = (a, b, v) => { v = clamp((v - a) / (b - a)); return v * v * (3 - 2 * v); };
  // the page scrolls from lines[0] to marks.shore; Clawd stays at screen x = HX, so his place on the page is camOf + HX
  const camOf = (u, S) => END * (1 - Math.pow(1 - clamp((u - S.lines[0].t0) / (S.marks.shore - S.lines[0].t0)), 1.3));
  const uOfWx = (wx, S) => S.lines[0].t0 + (S.marks.shore - S.lines[0].t0) * (1 - Math.pow(1 - (wx - HX) / END, 1 / 1.3));

  function dots(bx, by, bw, bh, step, rf, col, sq = 0) {   // a halftone screen at 30 degrees; rf(px, py) is the dot radius; sq squares the dots off
    x.fillStyle = col; const ca = Math.cos(.52), sa = Math.sin(.52), n = Math.ceil(Math.hypot(bw, bh) / step / 2) + 1, mx = bx + bw / 2, my = by + bh / 2; x.beginPath();
    for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) { const px = mx + (i * ca - j * sa) * step, py = my + (i * sa + j * ca) * step; if (px < bx - step || px > bx + bw + step || py < by - step || py > by + bh + step) continue; const r = rf(px, py); if (r > .5) { if (sq > 0) x.roundRect(px - r, py - r, 2 * r, 2 * r, r * (1 - sq)); else { x.moveTo(px + r, py); x.arc(px, py, r, 0, TAU); } } }
    x.fill();
  }
  const poly = pts => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); };
  const disc = (a, b, r, col) => { x.fillStyle = col; x.beginPath(); x.arc(a, b, r, 0, TAU); x.fill(); };
  const oval = (a, b, rx, ry, col) => { x.fillStyle = col; x.beginPath(); x.ellipse(a, b, rx, ry, 0, 0, TAU); x.fill(); };
  const letter = (s, px, py, size, fill, rot = 0, sw = size * .1) => { x.save(); x.translate(px, py); x.rotate(rot); x.font = `${size}px Bangers`; x.textAlign = 'center'; x.lineJoin = 'round'; x.fillStyle = INK; x.fillText(s, sw * .7, sw * .8); x.lineWidth = sw; x.strokeStyle = INK; x.strokeText(s, 0, 0); x.fillStyle = fill; x.fillText(s, 0, 0); x.restore(); };
  const star = (px, py, r1, r2, n, fill, lw, rot = -.2) => { x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU + rot, r = i % 2 ? r2 : r1 * (.86 + .28 * h2(i, n)); x.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r); } x.closePath(); x.fillStyle = fill; x.fill(); if (lw) { x.lineWidth = lw; x.strokeStyle = INK; x.lineJoin = 'miter'; x.stroke(); } };
  const frame = P => { poly(P); x.lineWidth = 14; x.strokeStyle = INK; x.lineJoin = 'miter'; x.stroke(); };

  function clawd(u, o = {}) {   // drawn around its centre in the current transform; o: ext, fringe, trail, legs (lengths in grid rows), eye (height 0..1), look, arm (raised)
    const p = o.ink || 12, lg = o.legs || [2, 2, 2, 2], B = [[2, 0, 12, 8], o.arm ? [0, 4, 14, 2] : [0, 4, 16, 2], ...[3, 5, 10, 12].map((c, i) => [c, 8, 1, lg[i]])]; if (o.arm) B.push([14, -2, 2, 8]);
    const each = (L, fn) => L.forEach(([c, r, w, h]) => fn((c - 8) * u, (r - 5) * u, w * u, h * u)), pad = (pp, col) => { x.fillStyle = col; each(B, (a, b, w, h) => x.fillRect(a - pp, b - pp, w + 2 * pp, h + 2 * pp)); };
    if (o.trail) [[2, CY], [1, MG]].forEach(([k, col]) => { x.save(); x.translate(-k * u * 2.4, 0); pad(p, col); x.restore(); });
    if (o.ext) for (let k = o.ext; k > 0; k--) { x.save(); x.translate(k * 1.5, k * 1.9); pad(p, INK); x.restore(); }
    if (o.fringe) { const f = o.fringe * u / 46; x.save(); x.translate(-26 * f, -12 * f); pad(p, CY); x.restore(); x.save(); x.translate(22 * f, -24 * f); pad(p, MG); x.restore(); }
    pad(p, INK); pad(0, '#FF6A1F');
    x.save(); x.beginPath(); each(B, (a, b, w, h) => x.rect(a, b, w, h)); x.clip();
    dots(-8 * u, -7 * u, 16 * u, 12 * u, u * .36, (px, py) => clamp(px / (8 * u) * .55 + py / (5 * u) * .75 + .05) * u * .2, '#C4260A');
    x.strokeStyle = '#FFD23F'; x.lineCap = 'butt'; [[0, u * .5], [1, u * .28], [2, u * .13]].forEach(([i, w]) => { x.lineWidth = w; x.beginPath(); x.moveTo((-6.3 + i * .95) * u, -2.2 * u); x.lineTo((-4.3 + i * .95) * u, -5.2 * u); x.stroke(); });
    x.restore();
    const eh = o.eye == null ? 1 : o.eye, lk = (o.look || 0) * u;
    each(CLAWD.eyes, (a, b, w, h) => { const hh = h * eh, bb = b + (h - hh) / 2; x.fillStyle = INK; x.fillRect(a + lk - 3, bb - 3, w + 6, hh + 6); if (eh > .6) { x.fillStyle = '#fff'; x.fillRect(a + lk + w * .12, bb + hh * .08, w * .34, hh * .2); } });
  }
  function balloon(bx, by, o = {}) {   // the red balloon, radius A.r, with its string
    const r = A.r, sw = o.sway || 0; x.save(); x.translate(bx, by);
    if (!o.noString) { x.strokeStyle = INK; x.lineWidth = 6; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, r + 14); x.bezierCurveTo(-18 + sw * .3, r + 60, 16 + sw * .7, r + 105, -4 + sw, r + 150); x.stroke(); }
    disc(-9, -5, r + 7, CY); disc(8, -9, r + 7, MG); for (let k = 7; k > 0; k--) disc(k * 1.5, k * 1.9, r + 7, INK);
    poly([[0, r - 2], [-15, r + 20], [15, r + 20]]); x.fillStyle = INK; x.fill(); disc(0, 0, r + 7, INK); disc(0, 0, r, FILM.RED);
    x.save(); x.beginPath(); x.arc(0, 0, r, 0, TAU); x.clip(); dots(-r, -r, 2 * r, 2 * r, 13, (px, py) => clamp((px + py) / r * .6 + .1) * 6.5, '#9E2410');
    x.strokeStyle = '#fff'; x.lineWidth = 11; x.lineCap = 'round'; x.beginPath(); x.arc(0, 0, r - 20, Math.PI * 1.08, Math.PI * 1.42); x.stroke(); x.restore(); x.restore();
  }
  function wall(x0, y0, w, h, ox) {   // cyan bricks, ink mortar; ox scrolls the brick pattern
    x.save(); x.beginPath(); x.rect(x0, y0, w, h); x.clip(); x.fillStyle = '#1FB6E6'; x.fillRect(x0, y0, w, h);
    dots(x0, y0, w, h, 22, (px, py) => clamp((py - y0) / h * 1.1 - .15) * 9, 'rgba(10,40,150,.45)');
    const bh = 96, bw = 220, hi = []; x.strokeStyle = INK; x.lineWidth = 7; x.beginPath();
    for (let r = Math.floor(y0 / bh); r * bh < y0 + h; r++) { const yy = r * bh; x.moveTo(x0, yy); x.lineTo(x0 + w, yy); for (let c = Math.floor((x0 - ox) / bw) - 1; c * bw + ox < x0 + w + bw; c++) { const xx = c * bw + ox + (r & 1 ? bw / 2 : 0); x.moveTo(xx, yy); x.lineTo(xx, yy + bh); if (h2(c, r) > .55) hi.push([xx + 18, yy + 16, 40 + 70 * h2(r, c)]); } }
    x.stroke(); x.fillStyle = '#fff'; hi.forEach(([a, b, l]) => x.fillRect(a, b, l, 8)); x.restore();
  }
  const brick = (bx, by, w, rot) => { x.save(); x.translate(bx, by); x.rotate(rot); x.fillStyle = INK; x.fillRect(-w / 2 - 7, -w * .24 - 7, w + 14, w * .48 + 14); x.fillStyle = '#1FB6E6'; x.fillRect(-w / 2, -w * .24, w, w * .48); x.fillStyle = '#fff'; x.fillRect(-w / 2 + 8, -w * .24 + 7, w * .4, 6); x.restore(); };
  const holePts = (cx, cy, R0) => [...Array(18)].map((_, i) => { const a = i / 18 * TAU, r = R0 * ((i % 2 ? .8 : 1.02) + .2 * h2(i, 5)); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  function burst(cx, cy, n = 28) {   // the hit background of the still: alternating rays, a radial halftone, a white core
    for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? MG : YL; x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, 2200, i / n * TAU + .06, (i + 1) / n * TAU + .06); x.fill(); }
    dots(cx - 760, cy - 900, 1520, 1500, 24, (px, py) => clamp((Math.hypot(px - cx, py - cy) - 300) / 700) * 11, 'rgba(140,0,80,.5)');
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, 400); g.addColorStop(0, '#fff'); g.addColorStop(.45, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(cx - 400, cy - 400, 800, 800);
  }
  function wedges(cx, cy, n, r0, r1, seed) { const R = rng(seed); x.fillStyle = INK; for (let i = 0; i < n; i++) { const a = R() * TAU, ra = r0 + R() * r1, w = (6 + R() * 26) / 1900; x.beginPath(); x.moveTo(cx + Math.cos(a) * ra, cy + Math.sin(a) * ra); x.lineTo(cx + Math.cos(a - w) * 1900, cy + Math.sin(a - w) * 1900); x.lineTo(cx + Math.cos(a + w) * 1900, cy + Math.sin(a + w) * 1900); x.fill(); } }
  function cracks(cx, cy, r0, lvl) { const R = rng(11); x.strokeStyle = INK; x.lineWidth = 7; x.lineJoin = 'miter'; x.lineCap = 'butt'; for (let i = 0; i < 8; i++) { let a = i / 8 * TAU + R(), px = cx + Math.cos(a) * r0, py = cy + Math.sin(a) * r0; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < lvl + 1; k++) { a += (R() - .5) * 1.3; const l = 40 + R() * 60; px += Math.cos(a) * l; py += Math.sin(a) * l; x.lineTo(px, py); } x.stroke(); } }
  function cloud(cx, cy, s) { const P = [[-90, 10, 50], [-30, -25, 70], [50, -10, 60], [112, 16, 42]]; P.forEach(([a, b, r]) => disc(cx + a * s, cy + b * s, r * s + 9, INK)); x.fillStyle = INK; x.fillRect(cx - 100 * s, cy + 20 * s, 220 * s, 44 * s + 9); P.forEach(([a, b, r]) => disc(cx + a * s, cy + b * s, r * s, '#fff')); x.fillStyle = '#fff'; x.fillRect(cx - 100 * s, cy + 20 * s, 220 * s, 44 * s); }
  function bubble(cx, cy, rx, ry, tx, ty, s, size, sc = 1) {   // a speech balloon with its tail at (tx, ty)
    x.save(); x.translate(cx, cy); x.scale(sc, sc); x.translate(-cx, -cy); x.fillStyle = '#fff'; x.strokeStyle = INK; x.lineWidth = 9; x.lineJoin = 'round';
    const a = Math.atan2(ty - cy, tx - cx), P = (da, k) => [cx + Math.cos(a + da) * rx * k, cy + Math.sin(a + da) * ry * k];
    poly([P(-.3, .9), P(.3, .9), [tx, ty]]); x.fill(); x.stroke(); x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.fill(); x.stroke();
    poly([P(-.22, .8), P(.22, .8), [cx + (tx - cx) * .8, cy + (ty - cy) * .8]]); x.fill();
    x.fillStyle = INK; x.font = `${size}px Bangers`; x.textAlign = 'center'; x.fillText(s, cx, cy + size * .36); x.restore();
  }
  function sea(y0, y1, u) {   // a halftone sea with inked wave marks that change pose three times a second
    x.fillStyle = CY; x.fillRect(-40, y0, FW + 80, y1 - y0); dots(0, y0, FW, y1 - y0, 22, (px, py) => clamp((py - y0) / 520) * 8.5 + 1.5, 'rgba(10,40,150,.5)');
    const wf = Math.floor(u * 3) % 2; x.lineCap = 'round'; x.lineJoin = 'round';
    for (let r = 0; r * 70 + 46 < y1 - y0; r++) for (let c = -1; c < 7; c++) { const wx = c * 200 + (r % 2) * 100 + (wf ? 26 : 0) * (r % 2 ? 1 : -1) + 60 * h2(r, 3), wy = y0 + 46 + r * 70; [[INK, 17], ['#fff', 7]].forEach(([col, lw]) => { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(wx, wy); x.quadraticCurveTo(wx + 24, wy - 22, wx + 48, wy); x.quadraticCurveTo(wx + 72, wy - 22, wx + 96, wy); x.stroke(); }); }
    x.fillStyle = INK; x.fillRect(-40, y0 - 5, FW + 80, 10);
  }

  // ---------- page A: the hit ----------
  function pageA(u) {
    const hit = u >= .35, f = fr15(u - .35), odd = fr15(u) % 2, C = [420, 900];
    const P1 = [[40, 40], [1040, 40], [1040, 1240], [40, 1320]], P2 = [[40, 1354], [630, 1307], [630, 1880], [40, 1880]], P3 = [[664, 1304], [1040, 1274], [1040, 1880], [664, 1880]];
    x.save(); poly(P1); x.clip();
    if (hit && f === 0) { x.fillStyle = INK; x.fillRect(0, 0, FW, 1400); star(C[0], C[1], 760, 330, 14, '#fff', 0); star(C[0], C[1], 420, 190, 14, YL, 0); }   // the impact frame
    else if (hit && f === 1) { burst(C[0], C[1]); wedges(C[0], C[1], 52, 420, 300, 7); }
    else {
      wall(0, 0, FW, 1400, 0);
      if (!hit) { x.save(); x.beginPath(); x.arc(A.x + 44, A.y + 58, 72, 0, TAU); x.clip(); dots(A.x - 40, A.y - 30, 170, 170, 13, () => 5.2, 'rgba(10,40,150,.6)'); x.restore(); if (u >= .12) cracks(C[0], C[1], 10, u < .24 ? 1 : 3); }
      else {
        const lp = u >= 1.2; wedges(C[0], C[1], lp ? 56 : 36, lp ? 460 : 400, 260, lp ? 13 + f : 7); cracks(C[0], C[1], 300, 2);
        const HP = holePts(C[0], C[1], 300); x.save(); poly(HP); x.clip(); burst(C[0], C[1]); x.restore(); poly(HP); x.lineWidth = 18; x.strokeStyle = INK; x.lineJoin = 'miter'; x.stroke();
        star(160, 770, 190, 100, 12, '#fff', 12); star(160, 770, 120, 66, 12, YL, 0);
      }
    }
    if (hit && f >= 1) {   // Clawd comes through the wall at us: small, overshoot, settle, crouch, leap
      const lp = u >= 1.3 ? 2 : u >= 1.2 ? 1 : 0, cr = u >= 1.02 && !lp, sc = f === 1 ? .82 : f === 2 ? 1.08 : lp === 2 ? 1.75 : lp === 1 ? 1.28 : 1;
      x.save(); x.translate(C[0] + (lp === 2 ? 50 : 0), C[1] + 20 - 70 * lp + (cr ? 36 : 0)); x.rotate(-.14 + (f < 5 ? (odd ? .03 : -.03) : 0)); x.transform(1, 0, -.15, 1, 0, 0); x.scale(sc * (cr ? 1.1 : 1), sc * (cr ? .84 : 1));
      clawd(31, { ext: 22, fringe: 1, legs: cr ? [1, 1, 1, 1] : lp ? [1, 2, 2, 1] : [2, 2, 2, 2] }); x.restore();
    }
    balloon(A.x, A.y + (hit && f < 2 ? -5 : 0), { sway: hit && f < 6 ? (odd ? 16 : -10) : 0 });
    if (hit) letter('KA-POW!', 410, 352 + (f > 2 && f < 7 && odd ? 7 : 0), 205 * ([1.5, 1.14, .95][f] || 1), YL, f === 0 ? -.17 : -.11);
    x.font = '46px Bangers'; const cw = x.measureText('MEANWHILE, BEYOND THE WALL…').width + 70; x.fillStyle = YL; x.fillRect(40, 40, cw, 98); x.lineWidth = 9; x.strokeStyle = INK; x.strokeRect(40, 40, cw, 98); x.fillStyle = INK; x.textAlign = 'left'; x.fillText('MEANWHILE, BEYOND THE WALL…', 74, 106);
    x.restore(); frame(P1);
    if (hit) { const tt = (f + .5) / 15, skip = Math.atan2(A.y - C[1], A.x - C[0]); for (let i = 0; i < 18; i++) {   // bricks fly at the reader and out over the gutter (none through the balloon); the lower panels cover them
      const a = i / 18 * TAU + h2(i, 1) * .5; if (Math.abs(Math.atan2(Math.sin(a - skip), Math.cos(a - skip))) < .42) continue; const d = 150 + (520 + 900 * h2(i, 2)) * tt;
      brick(C[0] + Math.cos(a) * d, C[1] + Math.sin(a) * d * .9 + 700 * tt * tt, (80 + 60 * h2(i, 3)) * (1 + tt * .7), a + tt * (h2(i, 4) - .5) * 14); } }
    // panel 2: his eyes, on the other side
    x.save(); poly(P2); x.clip(); x.fillStyle = hit ? MG : YL; x.fillRect(0, 1280, 700, 640);
    dots(40, 1300, 600, 580, 20, (px, py) => clamp((py - 1380) / 520) * 9.5, hit ? 'rgba(255,230,0,.9)' : 'rgba(255,45,127,.55)'); wedges(335, 1606, hit ? 40 : 18, hit ? 250 : 330, 120, hit ? 5 + (f < 6 ? f : 0) : 3);
    x.save(); x.translate(335 + (hit && f < 4 ? (odd ? 8 : -8) : 0), 1730); clawd(62, { eye: hit ? 1 : u > .18 ? .34 : .62 }); x.restore();
    if (hit && f >= 1) star(560, 1540, f === 1 ? 90 : 62, 14, 4, '#fff', 7, odd ? .3 : 0);
    x.restore(); frame(P2);
    // panel 3: the lettering
    x.save(); poly(P3); x.clip(); x.fillStyle = hit ? YL : MG; x.fillRect(640, 1250, 440, 660); dots(664, 1270, 380, 610, 22, (px, py) => clamp(1 - (py - 1290) / 420) * 10, hit ? 'rgba(255,45,127,.75)' : 'rgba(255,230,0,.9)');
    if (hit) ['ONE', 'PUNCH', 'LATER…'].forEach((s, i) => { const k = f - i * 2; if (k >= 0) letter(s, 852, 1520 + i * 126, 122 * (k === 0 ? 1.35 : 1), i === 1 ? CY : '#fff', -.06, 13); });
    x.restore(); frame(P3);
  }

  // ---------- page B: the strip he runs across, and the shore ----------
  function ground(l, r, col, dcol) { x.fillStyle = col; x.fillRect(l - 40, GY, r - l + 80, FH - GY); dots(l - 40, GY, r - l + 80, FH - GY, 22, (px, py) => clamp((py - GY) / 420) * 9 + 1, dcol); x.fillStyle = INK; x.fillRect(l - 40, GY - 6, r - l + 80, 14); }
  function panelWall(l, r, cam) {
    wall(l - 40, 0, r - l + 80, GY, -cam); const hx = 330 - cam, HP = holePts(hx, 1010, 270); x.save(); poly(HP); x.clip(); burst(hx, 1010, 20); x.restore(); poly(HP); x.lineWidth = 18; x.strokeStyle = INK; x.lineJoin = 'miter'; x.stroke();
    ground(l, r, MG, 'rgba(140,0,80,.5)'); [[150, 0, .2], [470, 0, -.3], [560, -44, .5], [650, 0, .1], [780, 0, -.15]].forEach(([bx, by, ro]) => brick(bx - cam, GY - 36 + by, 110, ro));
  }
  function panelCity(l, r, cam) {
    x.fillStyle = MG; x.fillRect(l - 40, 0, r - l + 80, GY); dots(l - 40, 40, r - l + 80, GY - 40, 22, (px, py) => clamp(1 - (py - 40) / 1000) * 10, 'rgba(255,230,0,.9)');
    for (let i = 0; i < 8; i++) { const bw = 96 + 50 * h2(i, 3), bx = 930 + i * 98 - cam, bh = 260 + 520 * h2(i, 9); x.fillStyle = INK; x.fillRect(bx, GY - bh, bw, bh); x.fillStyle = YL; for (let wy = 0; wy * 46 + 60 < bh; wy++) for (let wxi = 0; wxi * 30 + 34 < bw; wxi++) if (h2(i * 7 + wxi, wy) > .45) x.fillRect(bx + 14 + wxi * 30, GY - bh + 22 + wy * 46, 16, 24); }
    ground(l, r, CY, 'rgba(10,40,150,.45)');
  }
  function panelHills(l, r, cam) {
    x.fillStyle = CY; x.fillRect(l - 40, 0, r - l + 80, GY); dots(l - 40, 40, r - l + 80, GY - 40, 22, (px, py) => clamp((py - 40) / 1200) * 9 + 1, 'rgba(10,40,150,.5)');
    cloud(1960 - cam, 470, 1); cloud(2330 - cam, 260, .7);
    [[1890, 380, 330], [2340, 300, 230]].forEach(([hx, rx, ry]) => { const hill = () => { x.beginPath(); x.ellipse(hx - cam, GY + 30, rx, ry, 0, Math.PI, TAU); x.closePath(); }; hill(); x.fillStyle = '#fff'; x.fill(); x.save(); x.clip(); dots(hx - cam - rx, GY - ry, 2 * rx, ry + 30, 20, px => clamp((px - (hx - cam)) / rx * .7 + .25) * 8, 'rgba(255,45,127,.7)'); x.restore(); hill(); x.lineWidth = 12; x.strokeStyle = INK; x.stroke(); });
    x.fillStyle = INK; x.fillRect(2193 - cam, 1100, 14, GY - 1100); poly([[2085, 1040], [2285, 1040], [2340, 1096], [2285, 1152], [2085, 1152]].map(([a, b]) => [a - cam, b])); x.fillStyle = '#fff'; x.fill(); x.lineWidth = 10; x.strokeStyle = INK; x.lineJoin = 'miter'; x.stroke();
    x.fillStyle = INK; x.font = '84px Bangers'; x.textAlign = 'center'; x.fillText('FERRY', 2196 - cam, 1126);
    ground(l, r, YL, 'rgba(255,45,127,.55)');
  }
  function ferryman(X, u, S) {   // big chin, captain's cap, pipe; he leans on a mooring post and laughs through his whole line
    const L = S.lines[1], t = u - L.t0, on = t >= 0 && t < L.dur, f = fr15(u), w = L.words, word = on && w.some(([, a, b]) => t > a - .05 && t < b + .05);
    const ph = !on ? -1 : t < w[0][1] - .12 ? 0 : t < w[2][1] - .2 ? 1 : t < w[7][1] - .2 ? 2 : 3;   // the laugh, "Nice punch!", "the ferry is gone", "Can you do pixels?"
    const lean = ph === 0 ? .15 : ph === 3 ? -.02 : .07, shake = on ? (f % 2 ? -1 : 0) * (ph === 0 || !word ? 14 : 8) : 0, open = on && (ph === 0 || (word && f % 2 === 0)), laugh = ph === 0 || (on && !word), jit = word && f % 2 ? 1 : 0;
    const HAND = [[-118, -250], [-36, -262], [-236 - 6 * jit, -350 - 12 * jit], [-256 - 12 * jit, -384 + 12 * jit], [-244 + 10 * jit, -305 - 12 * jit]][ph + 1];
    const ca = Math.cos(lean), sa = Math.sin(lean), PT = [175 * ca - 300 * sa, -175 * sa - 300 * ca - shake], SK = '#FFC8A0', COAT = '#2B4BC4';
    x.fillStyle = INK; x.fillRect(X + 143, GY - 312, 64, 320); x.fillStyle = '#D98E32'; x.fillRect(X + 151, GY - 304, 48, 304); x.fillStyle = INK; x.fillRect(X + 143, GY - 262, 64, 10); x.fillRect(X + 143, GY - 236, 64, 10);
    const limb = (a, b, bend) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, e = [mx - (b[1] - a[1]) / d * bend, my + (b[0] - a[0]) / d * bend]; x.lineCap = 'round'; x.lineJoin = 'round';
      [[INK, 66], [COAT, 48]].forEach(([col, lw]) => { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(e[0], e[1]); x.lineTo(b[0], b[1]); x.stroke(); });
      x.lineCap = 'butt'; x.strokeStyle = YL; x.lineWidth = 48; x.beginPath(); x.moveTo(e[0] + (b[0] - e[0]) * .62, e[1] + (b[1] - e[1]) * .62); x.lineTo(e[0] + (b[0] - e[0]) * .76, e[1] + (b[1] - e[1]) * .76); x.stroke(); disc(b[0], b[1], 34, INK); disc(b[0], b[1], 26, SK); };
    x.save(); x.translate(X, GY); x.rotate(lean);
    [-70, 14].forEach(a => { x.fillStyle = INK; x.fillRect(a - 8, -180, 72, 180); x.fillStyle = '#18245E'; x.fillRect(a, -180, 56, 172); oval(a + 14, -10, 54, 20, INK); });
    x.translate(0, shake); limb([104, -392], PT, 0);
    const coat = () => poly([[-106, -150], [-130, -335], [-98, -428], [98, -428], [134, -335], [110, -150]]);
    coat(); x.lineJoin = 'round'; x.lineWidth = 20; x.strokeStyle = INK; x.stroke(); x.fillStyle = COAT; x.fill(); x.save(); coat(); x.clip(); dots(-135, -430, 275, 285, 15, px => clamp((px + 10) / 130) * 6, 'rgba(0,0,60,.5)'); x.restore();
    [[-44, -372], [-44, -302], [-44, -232], [30, -372], [30, -302], [30, -232]].forEach(([a, b]) => { disc(a, b, 13, INK); disc(a, b, 8, YL); });
    x.save(); x.translate(-8, -428); x.rotate(ph === 0 ? .2 : laugh ? .08 : 0);   // the head
    const parts = [[0, -92, 70, 66], [-24, -34, 98, 58], [-66, -16, 54, 40]]; parts.forEach(([a, b, c, d]) => oval(a, b, c + 9, d + 9, INK)); oval(70, -78, 22, 26, INK); parts.forEach(([a, b, c, d]) => oval(a, b, c, d, SK)); oval(68, -78, 13, 17, SK);
    x.save(); x.beginPath(); parts.slice(1).forEach(([a, b, c, d]) => { x.moveTo(a + c, b); x.ellipse(a, b, c, d, 0, 0, TAU); }); x.clip(); dots(-130, -40, 210, 80, 12, (px, py) => clamp((py + 40) / 60) * 3.2, 'rgba(90,40,20,.45)'); x.restore();
    x.strokeStyle = INK; x.lineWidth = 8; x.lineCap = 'round';
    if (open) { x.fillStyle = INK; x.beginPath(); x.ellipse(-62, -52, 52, 38, 0, 0, Math.PI); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.fillRect(-100, -50, 76, 12); } else { x.beginPath(); x.moveTo(-112, -58); x.quadraticCurveTo(-62, -26, -12, -56); x.stroke(); }
    oval(-92, -84, 34, 28, INK); oval(-92, -84, 26, 20, '#FF9C7A');
    [-44, 8].forEach(ex => { if (laugh) { x.beginPath(); x.moveTo(ex - 16, -104); x.quadraticCurveTo(ex, -126, ex + 16, -104); x.stroke(); } else { oval(ex, -108, 8, 10, INK); x.beginPath(); x.moveTo(ex - 18, -130); x.lineTo(ex + 16, -134); x.stroke(); } });
    const pj = open ? 9 : 0; x.lineWidth = 13; x.beginPath(); x.moveTo(-104, -46 + pj); x.lineTo(-166, -30 + pj); x.stroke(); x.fillStyle = INK; x.fillRect(-204, -74 + pj, 52, 60); x.fillStyle = '#8A4B1E'; x.fillRect(-197, -67 + pj, 38, 46);
    for (let i = 0; i < 3; i++) { const s = (f / 15 * (laugh ? 1.4 : .5) + i / 3) % 1, r = (9 + 15 * s) * (s > .8 ? (1 - s) * 5 : 1), px = -178 - 30 * s + 12 * Math.sin(i * 2 + s * 5), py = -86 + pj - 110 * s; disc(px, py, r + 6, INK); disc(px, py, r, '#fff'); }
    oval(4, -160, 104, 47, INK); oval(4, -162, 95, 38, '#fff'); x.fillStyle = INK; x.fillRect(-82, -158, 168, 46); x.fillStyle = '#18245E'; x.fillRect(-74, -150, 152, 30);
    poly([[-74, -130], [-152, -112], [-146, -96], [-74, -108]]); x.fillStyle = INK; x.fill(); disc(-36, -135, 15, INK); disc(-36, -135, 9, YL);
    x.restore(); limb([-100, -392], HAND, ph > 0 ? 46 : 30); x.restore();
  }
  function shore(u, S) {   // drawn in its place at rest (panel 40..1040): halftone sky and sea, the empty mooring, the FERRY sign, the ferryman
    const HZ = 900, sunk = ss(S.marks.out - 1.3, S.dur + .6, u), sq = ss(.45, 1, sunk), sy = 690 + 50 * ss(S.marks.shore, S.marks.out, u) + 215 * sunk, f4 = Math.floor(u * 4) % 2;
    x.fillStyle = YL; x.fillRect(-40, 0, FW + 80, HZ);
    dots(0, 40, FW, HZ - 40, 26, (px, py) => (3 + 9 * clamp(1 - (py - 40) / 860)) * (1 + 1.6 * sunk), 'rgba(255,45,127,.78)', sq);   // the sunset: the dots of the sky grow and square off
    if (sunk > 0) dots(0, 40, FW, HZ - 40, 26, (px, py) => sunk * 17 * clamp(1.1 - (py - 40) / 620), DUSK, sq);
    disc(215, sy, 152, INK); disc(215, sy, 140, '#fff'); x.save(); x.beginPath(); x.arc(215, sy, 140, 0, TAU); x.clip(); dots(75, sy - 140, 280, 280, 18, (px, py) => clamp((py - sy) / 140 + .3) * 7, 'rgba(255,106,31,.9)'); x.restore();
    x.strokeStyle = INK; x.lineWidth = 7; x.lineCap = 'round'; [[610 - 16 * (u - S.marks.shore), 330, 1], [470 - 10 * (u - S.marks.shore), 250, .7], [930 - 20 * (u - S.marks.shore), 390, .8]].forEach(([gx, gy, s], i) => { const d = ((f4 + i) % 2 ? -12 : 7) * s; x.beginPath(); x.moveTo(gx - 28 * s, gy + d); x.quadraticCurveTo(gx - 12 * s, gy - 8 * s, gx, gy); x.quadraticCurveTo(gx + 12 * s, gy - 8 * s, gx + 28 * s, gy + d); x.stroke(); });
    const fx = 440 + 12 * (u - S.marks.shore); poly([[fx - 44, HZ - 22], [fx + 44, HZ - 22], [fx + 32, HZ], [fx - 32, HZ]]); x.fillStyle = INK; x.fill(); x.fillRect(fx - 22, HZ - 40, 40, 20); x.fillRect(fx + 2, HZ - 58, 10, 20); [0, 1, 2].forEach(i => disc(fx - 6 - i * 20, HZ - 68 - i * 13, 7 + i * 3, INK));   // the ferry, gone
    sea(HZ, GY, u); if (sunk > 0) dots(0, HZ, FW, GY - HZ, 26, () => sunk * 8, DUSK, sq);
    x.fillStyle = '#FFF4C2'; x.fillRect(-40, GY, FW + 80, FH - GY); dots(0, GY, FW, FH - GY, 22, (px, py) => clamp((py - GY) / 420) * 8 + 1, 'rgba(10,40,150,.3)');   // the pier
    x.fillStyle = INK; x.fillRect(-40, GY - 6, FW + 80, 14); [70, 170, 290, 420].forEach((d, r) => { x.fillRect(-40, GY + d, FW + 80, 7); for (let c = 0; c < 6; c++) x.fillRect(90 + c * 210 + (r % 2) * 105, GY + d - (r ? [100, 120, 130][r - 1] : 70), 7, r ? [100, 120, 130][r - 1] : 70); });
    x.fillRect(578, 1050, 14, GY - 1050); x.save(); x.translate(585, 1008); x.rotate(-.04); x.fillStyle = '#fff'; x.fillRect(-105, -48, 210, 96); x.lineWidth = 10; x.strokeStyle = INK; x.lineJoin = 'miter'; x.strokeRect(-105, -48, 210, 96); x.fillStyle = INK; x.font = '82px Bangers'; x.textAlign = 'center'; x.fillText('FERRY', 0, 30); x.restore();
    x.lineCap = 'round'; [[INK, 20], ['#fff', 9]].forEach(([col, lw]) => { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(640, GY - 34); x.bezierCurveTo(600, GY - 4, 570, GY - 30, 540, GY - 12); x.stroke(); });   // the loose rope of the empty mooring
    x.fillStyle = INK; x.fillRect(618, GY - 58, 44, 56); oval(640, GY - 58, 36, 15, INK); x.fillStyle = '#fff'; x.fillRect(628, GY - 46, 7, 30);
    ferryman(800, u, S);
  }
  function hero(u, S) {   // Clawd on page B: he keeps his place on the screen and the page runs under him
    const T1 = S.marks.shore, L3 = S.lines[2], f = fr15(u), U = 20, wx = camOf(f / 15, S) + HX, t3 = u - L3.t0, o = { ext: 10, look: .5 };
    let h = 0, sx = 1, sy = 1, rot = 0, legs = [2, 2, 2, 2], dust = 0;
    if (u < T1) {
      o.trail = 1; rot = .12; legs = f % 2 ? [2, 1, 2, 1] : [1, 2, 1, 2]; h = f % 2 ? 14 : 0;
      const j0 = (wx - HX) / 300; if (j0 < 1) { h = 330 * (1 - j0 * j0); rot = .25; sx = .94; sy = 1.1; legs = [1, 1, 2, 2]; }   // out of the hole
      for (const g of GUT) { const j = (wx - g + 200) / 400;   // over a gutter: anticipation, the jump, the landing
        if (j > 0 && j < 1) { h = 4 * j * (1 - j) * 270; rot = -.16 + .36 * j; sx = .94; sy = 1.1; legs = j < .5 ? [1, 1, 2, 2] : [2, 2, 1, 1]; } else if (j > -.2 && j <= 0) { sx = 1.12; sy = .8; rot = 0; legs = [1, 1, 1, 1]; h = 0; } else if (j >= 1 && j < 1.16) { sx = 1.16; sy = .78; rot = 0; legs = [1, 1, 1, 1]; h = 0; dust = 1; } }
      if (wx > 2764) { rot = -.14; legs = [2, 2, 2, 2]; h = 0; dust = 1; o.trail = 0; }   // the skid on the planks
    } else {
      if (u < T1 + .2) { sx = 1.14; sy = .8; dust = 1; }
      if (t3 >= 0) { o.fringe = .7; if (t3 < .14) { h = 56; sx = .94; sy = 1.1; } else { sx = sy = 1.1; rot = -.07; if (t3 < L3.dur && (f >> 1) % 2) h = 10; star(HX, GY - 110, fr15(t3 - .14) === 0 ? 300 : 250, 170, 14, YL, 10); } }
    }
    if (dust) [[-150, 26], [-196, 18], [-232, 12], [150, 16]].forEach(([a, r], i) => { const b = GY - r - (f % 2) * 12 - i * 6; disc(HX + a, b, r + 6, INK); disc(HX + a, b, r, '#fff'); });
    x.save(); x.translate(HX, GY - h); x.rotate(rot); x.scale(sx, sy); x.translate(0, -(3 + Math.max(...legs)) * U); clawd(U, { ...o, legs }); x.restore();
    if (t3 >= .3 && t3 < 1.5) { const k = fr15(t3 - .3); star(HX + 178, GY - 238, k === 0 ? 50 : k === 1 ? 122 : k % 2 ? 104 : 84, 16, 4, '#fff', 7, k % 2 ? .28 : 0); }   // the sparkle of "Of course."
  }
  function pageB(u, S) {
    const T1 = S.marks.shore, cam = camOf(u, S), f = fr15(u), p = clamp((u - S.lines[0].t0) / (T1 - S.lines[0].t0));
    [[40, 880, panelWall], [920, 1680, panelCity], [1720, 2480, panelHills], [2520, 3520, null]].forEach(([a, b, fn], i) => {
      const l = a - cam, r = b - cam; if (r < -40 || l > FW + 40) return; const P = [[l + (i ? 20 : 0), 40], [r + (i < 3 ? 20 : 0), 40], [r - (i < 3 ? 20 : 0), 1880], [l - (i ? 20 : 0), 1880]];
      x.save(); poly(P); x.clip(); if (fn) fn(l, r, cam); else { x.translate(l - 40, 0); shore(u, S); } x.restore(); frame(P);
    });
    if (p < 1) { const R = rng(f * 7 + 3), n = Math.round(20 * Math.pow(1 - p, .5)); x.fillStyle = INK; for (let i = 0; i < n; i++) { const y = 120 + R() * 1220, x0 = R() * (FW + 300), len = 180 + R() * 520, th = 4 + R() * 12; x.beginPath(); x.moveTo(x0, y - th / 2); x.lineTo(x0, y + th / 2); x.lineTo(x0 - len, y); x.fill(); } }   // speed lines, redrawn on twos
    GUT.forEach((g, i) => { const k = fr15(u - uOfWx(g - 200, S)); if (u >= uOfWx(g - 200, S) && k < 5) letter(['HUP!', 'HOP!', 'HUP!'][i], 170, 880 - k * 6, 120 * (k === 0 ? 1.3 : 1), [CY, YL, MG][i], -.2); });
    hero(u, S);
    const go = ss(S.lines[0].t0, S.lines[0].t0 + .5, u) * (1 - ss(S.marks.out - 1.2, S.dur - .05, u)), bob = (2 + 2 * go) * Math.sin(u * 2.4);   // the balloon stays ahead of him, then drifts back over the sea to the anchor
    balloon(A.x + 90 * go, A.y - 55 * go + bob, { sway: u < T1 ? -46 * Math.pow(1 - p, .4) + (f % 2 ? 6 : 0) : 9 * Math.sin(u * 2.4 + 1) });
    const L = S.lines[1], t = u - L.t0, w = L.words;
    if (t >= 0 && t < L.dur + .3) {
      if (t < w[0][1] - .12) [[470, 860, 96, -.14], [600, 800, 120, .06], [505, 715, 84, -.05]].forEach(([a, b, s, r], i) => { const k = fr15(t - .08 - i * .17); if (k >= 0) letter('HA!', a, b - (f % 2) * 6, s * (k === 0 ? 1.3 : 1), [YL, '#fff', CY][i], r); });
      else { const ph = t < w[2][1] - .2 ? 0 : t < w[7][1] - .2 ? 1 : 2, t0 = [w[0][1] - .12, w[2][1] - .2, w[7][1] - .2][ph], te = [w[1][2], w[6][2], w[10][2]][ph] + .3;
        if (t < te) bubble(455, 830, 245, 76, 682, 916, ['NICE PUNCH!', 'THE FERRY IS GONE!', 'CAN YOU DO PIXELS?'][ph], ph ? 58 : 76, fr15(t - t0) === 0 ? .8 : fr15(t - t0) === 1 ? 1.06 : 1); }
    }
  }

  FILM.add({ id: 'comic',
    init(el) { const c = cv(); el.append(c); x = c.getContext('2d'); const t = cv(), tx = t.getContext('2d'), R = rng(7); for (let i = 0; i < 14000; i++) { tx.fillStyle = `rgba(${R() < .5 ? '0,0,0' : '255,255,255'},.06)`; tx.fillRect(R() * FW, R() * FH, 2, 2); } el.append(t); },   // the paper tooth is a fixed layer on top
    draw(u, S) { x.fillStyle = PAPER; x.fillRect(0, 0, FW, FH); if (u < S.lines[0].t0) pageA(u); else pageB(u, S); },
    glide(g) {   // one calm panel: halftone sky, clouds, the sea far below, a few speed lines pointing down
      const P = [[40, 40], [1040, 40], [1040, 1880], [40, 1880]], U = g.w / 16, R = rng(5), ca = Math.cos(g.rot), sa = Math.sin(g.rot), hx = g.x + 7 * U * ca + 7 * U * sa, hy = g.y + 7 * U * sa - 7 * U * ca;
      x.fillStyle = PAPER; x.fillRect(0, 0, FW, FH); x.save(); poly(P); x.clip(); x.fillStyle = CY; x.fillRect(0, 0, FW, FH); dots(40, 40, 1000, 1560, 26, (px, py) => clamp(1 - (py - 40) / 1300) * 10 + 1, 'rgba(10,40,150,.45)');
      cloud(230, 470 - 70 * g.k, 1.2); cloud(860, 1130 - 110 * g.k, 1); cloud(170, 1330 - 150 * g.k, .8); sea(1600, FH, 0);
      x.fillStyle = INK; for (let i = 0; i < 11; i++) { const x0 = 80 + R() * 920, y0 = 40 + R() * 260, len = 260 + R() * 420 + 120 * g.k, th = 5 + R() * 11; if (Math.abs(x0 - g.x) < 230) continue; x.beginPath(); x.moveTo(x0 - th / 2, y0 - 60); x.lineTo(x0 + th / 2, y0 - 60); x.lineTo(x0, y0 + len); x.fill(); }
      x.strokeStyle = INK; x.lineWidth = 6; x.lineCap = 'round'; x.beginPath(); x.moveTo(g.bx, g.by + g.br + 14); x.quadraticCurveTo(g.bx - 10, (g.by + hy) / 2 + 30, hx, hy); x.stroke(); balloon(g.bx, g.by, { noString: 1 });
      x.save(); x.translate(g.x, g.y); x.rotate(g.rot); clawd(U, { ext: 10, fringe: .7, arm: 1, look: .3 }); x.restore(); x.restore(); frame(P);
    },
    sfx: {
      comic_punch: { prompt: 'cartoon comic-book punch, one huge heavy smack with a short bass thump, no music, no speech', dur: 1 },
      comic_bricks: { prompt: 'cartoon brick wall bursting, bricks and rubble tumbling to the ground, no music, no speech', dur: 2 },
      comic_jump: { prompt: 'cartoon jump, one short springy boing pop, no whoosh, no music, no speech', dur: .6 },
      comic_skid: { prompt: 'cartoon feet landing and skidding to a stop on wooden planks, short, no music, no speech', dur: .9 },
      comic_gull: { prompt: 'two seagull cries over a harbour, a little distant, no music, no speech', dur: 2 },
      comic_sparkle: { prompt: 'bright cartoon sparkle, one glinting ting, no music, no speech', dur: 1 } },
    amb: { prompt: 'calm sea shore at a wooden pier, small waves lapping, wood creaking, distant seagulls, no music, no speech', gain: -24 },
    cues(S) { const r = v => +v.toFixed(2); return [['comic_punch', .35], ['comic_bricks', .42, -4], ['comic_jump', r(S.lines[0].t0), -5], ...GUT.map(g => ['comic_jump', r(uOfWx(g - 200, S)), -6]), ['comic_skid', r(uOfWx(2700, S)), -4],
      ['comic_gull', r(S.marks.shore + .15), -9], ['comic_sparkle', r(S.lines[2].t0 + .3), -6], ['comic_gull', r(S.marks.out + .1), -12]]; }
  });
})();
