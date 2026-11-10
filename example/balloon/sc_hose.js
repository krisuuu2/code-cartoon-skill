// balloon/sc_hose.js: scene 9 of THE BALLOON, RUBBER HOSE 1930 (after styles8/s12_hose.js). Canvas 2D: a black-and-white cartoon on a stage, drawn with a small bezier rig
// (hose limbs with no elbows, white gloves, pie-cut eyes), posed on twos (15 poses a second), with the film simulated on top (grain, scratches, dust, flicker, a dark vignette, the rounded gate).
// Everything is sepia except the balloon, which stays red. The grain, scratches and dust are seeded from the frame number, so every frame can be rendered again and comes out the same.
(() => {
  const PAPER = '#E9DFC8', LIGHT = '#D2C7AE', MID = '#A1967F', DARK = '#4C4437', INK = '#16120D', WHITE = '#F6F0E0', BODY = '#BDB29B', C = [540, 1090], FLOOR = 1400, CX = 660, HP = 212, HH = 345, SX = 210;
  let x, BG, GRAIN = [], PATH;
  const seg = (u, a, b) => clamp((u - a) / (b - a)), mix = (a, b, k) => a + (b - a) * k, eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, eo = k => 1 - Math.pow(1 - k, 3);
  const el = k => k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-7 * k) * Math.cos(k * 11), hit = (t, a, d = 8, f = 24) => t < a ? 0 : Math.exp(-(t - a) * d) * Math.cos((t - a) * f), q15 = u => Math.floor(u * 15 + 1e-6) / 15;
  const fs = (fill, lw = 9) => { if (fill) { x.fillStyle = fill; x.fill(); } if (lw) { x.lineWidth = lw; x.strokeStyle = INK; x.stroke(); } };
  const rr = (a, b, w, h, r) => { x.beginPath(); x.roundRect(a, b, w, h, r); }, ell = (a, b, rx, ry, rot = 0) => { x.beginPath(); x.ellipse(a, b, rx, ry, rot, 0, TAU); };
  const line = (...p) => { x.beginPath(); x.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]); };
  const hose = (p, w = 28) => { x.beginPath(); x.moveTo(p[0], p[1]); x.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]); x.lineWidth = w; x.strokeStyle = INK; x.stroke(); };
  const shoe = (a, b, rot) => { x.save(); x.translate(a, b); x.rotate(rot); ell(14, 0, 46, 25); fs(INK, 0); x.beginPath(); x.arc(22, -6, 22, -2.3, -1.0); x.lineWidth = 6; x.strokeStyle = PAPER; x.stroke(); x.restore(); };
  function glove(a, b, rot, k = 1, grip = 0) {   // fingers point "up" in its own frame; grip closes them
    x.save(); x.translate(a, b); x.rotate(rot); x.scale(k, k); rr(-36, 28, 72, 32, 15); fs(WHITE);
    x.save(); x.rotate(1.35 - grip * .5); rr(-14, -74, 28, 54, 14); fs(WHITE); x.restore(); [-.62, -.2, .22, .64].forEach(an => { x.save(); x.rotate(an * (1 - grip * .7)); rr(-15, -98 + grip * 22, 30, 66 - grip * 22, 15); fs(WHITE); x.restore(); });
    ell(0, 0, 46, 46); fs(WHITE); [-15, 0, 15].forEach(dx => { line(dx, 4, dx, 24); fs(null, 6); }); x.restore();
  }
  // a boneless limb through a list of points, and the same limb as a list: from a to b with a sideways bend and a wave running along it
  function noodle(p, w = 28) { x.beginPath(); x.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length - 1; i++) x.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2); const n = p[p.length - 1]; x.lineTo(n[0], n[1]); x.lineWidth = w; x.strokeStyle = INK; x.stroke(); }
  function limb(a, b, bend = 0, amp = 0, ph = 0, waves = 2.5) { const o = [], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    for (let i = 0; i <= 12; i++) { const s = i / 12, off = bend * Math.sin(Math.PI * s) + amp * Math.sin(s * waves * TAU - ph) * Math.sin(Math.PI * s); o.push([a[0] + dx * s + nx * off, a[1] + dy * s + ny * off]); } return o; }
  const endRot = p => { const a = p[p.length - 1], b = p[p.length - 3] || p[0]; return Math.atan2(a[1] - b[1], a[0] - b[0]) + Math.PI / 2; };
  function star(a, b, r, rot = 0, fill = WHITE, n = 5, inner = .45, lw = 8) { x.beginPath(); for (let i = 0; i < n * 2; i++) { const an = rot + i / (n * 2) * TAU, q = i % 2 ? r * inner : r; x[i ? 'lineTo' : 'moveTo'](a + Math.cos(an) * q, b + Math.sin(an) * q); } x.closePath(); fs(fill, lw); }
  function type(s, a, b, font, size, fill, lw, rot = 0) { x.save(); x.translate(a, b); x.rotate(rot); x.font = `${size}px ${font}`; x.textAlign = 'center'; if (lw) { x.lineWidth = lw; x.strokeStyle = INK; x.strokeText(s, 0, 0); } x.fillStyle = fill; x.fillText(s, 0, 0); x.restore(); }

  function paintBG() {   // fixed: the sunburst, the spotlight disc, the floorboards, the curtains and the footlights of the still
    x.fillStyle = LIGHT; x.fillRect(0, 0, FW, FH); x.fillStyle = PAPER; for (let i = 0; i < 24; i += 2) { x.beginPath(); x.moveTo(C[0], C[1]); x.arc(C[0], C[1], 1900, i / 24 * TAU + .13, (i + 1) / 24 * TAU + .13); x.fill(); }
    ell(C[0], C[1] - 10, 440, 440); fs(WHITE, 10); ell(C[0], C[1] - 10, 404, 404); fs(null, 3);
    x.fillStyle = MID; x.fillRect(0, 1440, FW, 480); for (let k = -9; k <= 9; k++) { line(540 + k * 64, 1440, 540 + k * 250, 1920); fs(null, 4); } line(0, 1440, FW, 1440); fs(null, 10);
    [1, -1].forEach(sg => { x.save(); if (sg < 0) { x.translate(FW, 0); x.scale(-1, 1); }
      x.beginPath(); x.moveTo(-10, -10); x.lineTo(250, -10); x.bezierCurveTo(240, 420, 150, 640, 96, 820); x.bezierCurveTo(70, 900, 40, 960, -10, 1010); x.closePath(); fs(DARK, 10);
      [70, 130, 190].forEach(k => { x.beginPath(); x.moveTo(k, 0); x.bezierCurveTo(k - 6, 380, k * .55, 600, k * .34, 800); fs(null, 5); });
      ell(92, 824, 62, 24, -.5); fs(LIGHT, 9); x.restore(); });
    for (let i = 0; i < 7; i++) { ell(i * 180, -30, 118, 118); fs(DARK, 10); ell(i * 180, 70, 13, 13); fs(LIGHT, 7); }
    for (let i = 0; i < 6; i++) { const a = 115 + i * 170; x.beginPath(); x.moveTo(a - 70, 1730); x.lineTo(a - 130, 1560); x.lineTo(a + 130, 1560); x.lineTo(a + 70, 1730); x.closePath(); x.fillStyle = 'rgba(246,240,224,.16)'; x.fill();
      x.beginPath(); x.arc(a, 1800, 62, Math.PI, 0); x.closePath(); fs(WHITE, 9); x.beginPath(); x.arc(a, 1800, 34, Math.PI * 1.15, Math.PI * 1.6); fs(null, 5); rr(a - 74, 1798, 148, 30, 8); fs(DARK, 9); }
  }
  function balloon(bx, by, r, end, sway = 0) {   // the one spot of colour; end = where the string ends (a hand), or it hangs free
    const e = end || [bx + 10 + sway, by + r + 196]; x.beginPath(); x.moveTo(bx, by + r + 10); x.bezierCurveTo(bx + 26 - sway, by + r + 70, bx - 24 + sway * 2, (by + r + e[1]) / 2 + 30, e[0], e[1]); fs(null, 5);
    x.beginPath(); x.moveTo(bx - 11, by + r + 12); x.lineTo(bx, by + r - 8); x.lineTo(bx + 11, by + r + 12); x.closePath(); fs(FILM.RED, 6);
    ell(bx, by, r - 4, r - 4); fs(FILM.RED, 8); x.beginPath(); x.arc(bx, by, r - 22, 3.5, 4.5); x.lineWidth = 9; x.strokeStyle = WHITE; x.stroke();
  }
  // Clawd. c: x, y = the floor under him; h = body centre above the floor; hose 0 = his plain boxy self (the 16 x 10 grid), 1 = the rubber-hose star; aL / aR = arms as point lists in body space
  function clawd(c) {
    const sq = c.sq || 0, k = c.s || 1; x.save(); x.translate(c.x, c.y); x.rotate(c.rot || 0); x.scale(k * (1 + sq * .7), k * (1 - sq)); x.translate(0, -c.h);
    const lk = c.look || [0, 0];
    if (!c.hose) { const w = c.wig || 0;
      [-171, -102, 68, 137].forEach(a => { rr(a, 120, 34, 92, 8); fs(BODY, 9); }); [[-1, w], [1, -w]].forEach(([sg, r]) => { x.save(); x.translate(sg * 200, 32); x.rotate(r); rr(sg > 0 ? 0 : -74, -36, 74, 72, 12); fs(BODY, 12); x.restore(); });
      rr(-205, -150, 410, 290, 26); fs(BODY, 14); x.save(); rr(-205, -150, 410, 290, 26); x.clip(); ell(120, 150, 300, 150, -.3); x.fillStyle = 'rgba(76,68,55,.28)'; x.fill(); x.restore();
      x.beginPath(); x.arc(-130, -80, 50, 3.5, 4.5); x.lineWidth = 11; x.strokeStyle = WHITE; x.stroke();
      [-120, 120].forEach(ex => { if (c.blink) { line(ex - 18, -40, ex + 18, -40); fs(null, 10); } else { rr(ex - 17 + lk[0] * 8, -78 + lk[1] * 8, 34, 74, 8); fs(INK, 0); rr(ex - 9 + lk[0] * 8, -70 + lk[1] * 8, 9, 18, 4); fs(WHITE, 0); } });
      x.restore(); return; }
    const dg = c.dang || 0;
    [[-58, 26, -.1], [58, 26, .1]].forEach(([lx, kx, rot]) => { hose([lx, 120, lx + kx + dg * 40, 190, lx - kx + dg * 60, 240, lx + kx * .2 + dg * 30, 292], 24); shoe(lx + kx * .2 - 8 + dg * 30, 300, rot + dg * .5); });
    if (c.aL && !c.front) noodle(c.aL, c.wL || 28); if (c.aR) noodle(c.aR, 28);
    [[-138, -34, -.16], [138, 34, .16]].forEach(([lx, kx, rot]) => { hose([lx, 120, lx + kx - dg * 50, 200, lx - kx * .6 - dg * 70, 260, lx + kx * .3 - dg * 40, 318], 26); shoe(lx + kx * .3 - 10 - dg * 40, 326, rot - dg * .5); });
    rr(-205, -150, 410, 290, 74); fs(BODY, 16); x.save(); rr(-205, -150, 410, 290, 74); x.clip(); ell(120, 150, 300, 150, -.3); x.fillStyle = 'rgba(76,68,55,.28)'; x.fill(); x.restore();
    x.beginPath(); x.arc(-110, -60, 78, 3.5, 4.5); x.lineWidth = 13; x.strokeStyle = WHITE; x.stroke();
    [-96, 96].forEach(ex => { const ey = c.eyes || 'pie';
      if (ey === 'x') { line(ex - 30, -72, ex + 30, -12); fs(null, 12); line(ex + 30, -72, ex - 30, -12); fs(null, 12); return; }
      ell(ex, -42, 42, 68); fs(WHITE, 10); const px = ex + 9 + lk[0] * 9, py = -22 + lk[1] * 14; ell(px, py, 23, 40); x.fillStyle = INK; x.fill(); x.beginPath(); x.moveTo(px, py); x.arc(px, py, 46, -1.25, -.55); x.closePath(); x.fillStyle = WHITE; x.fill();
      if (ey === 'sad' || ey === 'shut') { x.save(); ell(ex, -42, 47, 73); x.clip(); x.fillStyle = BODY; x.fillRect(ex - 60, -120, 120, ey === 'shut' ? 150 : 74); x.restore(); line(ex - 42, ey === 'shut' ? -20 : -46, ex + 42, ey === 'shut' ? -20 : -46); fs(null, 9); }
      const br = c.brow || 0; x.beginPath(); x.arc(ex, -96 - br * 6, 34, 3.9, 5.5); fs(null, 8); if (br > 0) { line(ex - Math.sign(ex) * 44, -118, ex + Math.sign(ex) * 20, -100); fs(null, 10); } });
    const m = c.mouth || 'smile';
    if (m === 'smile' || m === 'talk') { const d = m === 'talk' ? 60 : 0; x.beginPath(); x.moveTo(-92 + d * .5, 44); x.quadraticCurveTo(0, 168 - d * .2, 92 - d * .5, 44); x.quadraticCurveTo(0, 82 - d * .5, -92 + d * .5, 44); x.closePath(); x.save(); fs(INK, 10); x.clip(); ell(6, 128, 46, 30); x.fillStyle = MID; x.fill(); x.restore();
      x.beginPath(); x.arc(-98 + d * .5, 36, 16, 3.6, 5.4); fs(null, 8); x.beginPath(); x.arc(98 - d * .5, 36, 16, 4.0, 5.8); fs(null, 8); }
    else if (m === 'o') { ell(0, 76, 26, 34); fs(INK, 0); }
    else if (m === 'shut') { x.beginPath(); x.moveTo(-60, 62); x.quadraticCurveTo(0, 96, 60, 62); fs(null, 10); }
    else { x.beginPath(); x.moveTo(-58, 92); x.quadraticCurveTo(0, 50, 58, 92); fs(null, 10); }   // sad
    if (c.aL && c.front) noodle(c.aL, 28); if (c.aL) glove(c.aL[c.aL.length - 1][0], c.aL[c.aL.length - 1][1], c.gL == null ? endRot(c.aL) : c.gL, c.gk || .92, c.grip || 0); if (c.aR) glove(c.aR[c.aR.length - 1][0], c.aR[c.aR.length - 1][1], c.gR == null ? endRot(c.aR) : c.gR, .92);
    x.restore();
  }
  // the showman: tall, thin, top hat, moustache, cane. s = [lean, hand R x, y, hand L x, y, cane angle, hat lift, squash], hands from his feet (y up is negative)
  function showman(s, o) {
    const [lean, rx, ry, lx, ly, cane, hat, sq] = s; x.save(); x.translate(o.x, FLOOR - o.hop); x.scale(1 + sq * .7, 1 - sq);
    [[-24, -34, -.12], [24, 30, .12]].forEach(([a, f, rot]) => { hose([a, -250, a - 14, -170, a + 14, -90, f, -22], 22); shoe(f - 8, -14, rot); });
    x.rotate(lean * .35); x.save(); x.translate(0, -250); x.rotate(lean * .65); x.translate(0, 250);
    x.beginPath(); x.moveTo(-50, -270); x.lineTo(-74, -190); x.lineTo(-30, -236); x.lineTo(0, -200); x.lineTo(30, -236); x.lineTo(74, -190); x.lineTo(50, -270); x.closePath(); fs(INK, 8);   // coat tails
    const aL = limb([-50, -515], [lx, ly], -46), aR = limb([50, -515], [rx, ry], 46); noodle(aL, 22);
    rr(-60, -560, 120, 310, 48); fs(INK, 8); x.beginPath(); x.moveTo(-22, -556); x.lineTo(0, -430); x.lineTo(22, -556); x.closePath(); fs(WHITE, 6); [-492, -458].forEach(b => { ell(0, b, 5, 5); fs(INK, 0); });
    x.beginPath(); x.moveTo(0, -548); x.lineTo(-34, -568); x.lineTo(-34, -528); x.closePath(); fs(WHITE, 6); x.beginPath(); x.moveTo(0, -548); x.lineTo(34, -568); x.lineTo(34, -528); x.closePath(); fs(WHITE, 6);
    x.save(); x.translate(0, -560); x.rotate(lean * .5 + (o.nod || 0)); const tk = o.talk ? 1 : 0;
    ell(0, -78, 64, 68); fs(WHITE, 9); [-22, 26].forEach(ex => { if (o.blink) { line(ex - 12, -96, ex + 12, -96); fs(null, 7); } else { ell(ex + 6, -96, 12, 20); fs(INK, 0); x.beginPath(); x.moveTo(ex + 6, -96); x.arc(ex + 6, -96, 24, -1.25, -.55); x.closePath(); x.fillStyle = WHITE; x.fill(); } });
    line(-34, -128 - tk * 4, -8, -122); fs(null, 6); line(40, -128 - tk * 4, 14, -122); fs(null, 6);
    ell(6, -26 + tk * 5, 20, 8 + tk * 16); fs(INK, 0); ell(4, -66, 13, 11); fs(LIGHT, 7);
    [1, -1].forEach(sg => { x.beginPath(); x.moveTo(4, -52); x.bezierCurveTo(4 + sg * 40, -66 - tk * 6, 4 + sg * 92, -40, 4 + sg * 100, -78 - tk * 10); x.bezierCurveTo(4 + sg * 110, -22, 4 + sg * 36, -18, 4, -40); x.closePath(); fs(INK, 4); });   // the moustache
    x.save(); x.translate(-10, -138); x.rotate(-.1 - hat * .55); x.translate(-hat * 26, -hat * 96); rr(-84, -14, 168, 26, 12); fs(INK, 6); rr(-52, -150, 104, 140, 10); fs(INK, 6); x.fillStyle = LIGHT; x.fillRect(-49, -48, 98, 22); x.restore();
    x.restore();
    const cr = cane * Math.PI / 180; line(rx - Math.cos(cr) * 34, ry - Math.sin(cr) * 34, rx + Math.cos(cr) * 300, ry + Math.sin(cr) * 300); fs(null, 13); ell(rx - Math.cos(cr) * 40, ry - Math.sin(cr) * 40, 15, 15); fs(WHITE, 7);
    noodle(aR, 22); glove(lx, ly, endRot(aL), .68, hat > .3 ? .6 : 0); glove(rx, ry, cr - Math.PI / 2, .68, .8);
    x.restore(); x.restore();
  }
  // the film on top of the picture: everything random comes from the frame number f
  function film(f) {
    const R = rng(5000 + f * 17), g = GRAIN[f % GRAIN.length];
    x.save(); x.globalCompositeOperation = 'overlay'; x.globalAlpha = .34; if (f % 2) { x.translate(FW, FH); x.scale(-1, -1); } x.drawImage(g, 0, 0, FW, FH); x.restore();
    x.fillStyle = `rgba(${R() < .5 ? '255,250,235' : '20,15,8'},${(R() * .05).toFixed(3)})`; x.fillRect(0, 0, FW, FH);   // flicker
    for (let i = 0; i < 6; i++) { const a = (R() < .5 ? 40 : 720) + R() * 320, y0 = R() * 900; if (R() < .45) continue; x.strokeStyle = i % 3 ? 'rgba(255,250,235,.4)' : 'rgba(20,15,8,.3)'; x.lineWidth = 1 + R() * 2; x.beginPath(); x.moveTo(a, y0); x.lineTo(a + (R() - .5) * 8, y0 + 500 + R() * 900); x.stroke(); }
    for (let i = 0; i < 40; i++) { const a = R() * FW, b = R() * FH; x.strokeStyle = x.fillStyle = `rgba(20,15,8,${.35 + R() * .4})`; if (i % 4) { ell(a, b, 1.5 + R() * 3.5, 1.5 + R() * 2.5); x.fill(); } else { x.lineWidth = 1.6; x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + (R() - .5) * 50, b + (R() - .5) * 50, a + (R() - .5) * 70, b + (R() - .5) * 70); x.stroke(); } }
    const v = x.createRadialGradient(540, 960, 620, 540, 960, 1160); v.addColorStop(0, 'rgba(22,16,8,0)'); v.addColorStop(1, 'rgba(22,16,8,.82)'); x.fillStyle = v; x.fillRect(0, 0, FW, FH);
    x.fillStyle = 'rgba(120,80,30,.1)'; x.fillRect(0, 0, FW, FH); x.beginPath(); x.rect(0, 0, FW, FH); x.roundRect(24, 24, FW - 48, FH - 48, 46); x.fillStyle = '#0B0906'; x.fill('evenodd');
  }
  // the long way of the stretched arm: from his shoulder, up past the showman's hat, along the top of the theatre and down to the balloon's string
  const WP = [[CX - 200, FLOOR - HH + 10], [330, 960], [395, 700], [300, 430], [150, 300], [330, 205], [620, 235], [880, 300], [975, 490], [925, 680], [800, 742]];
  function buildPath() { const P = [], cr = (a, b, c, d, t) => .5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
    for (let i = 0; i < WP.length - 1; i++) { const a = WP[Math.max(0, i - 1)], b = WP[i], c = WP[i + 1], d = WP[Math.min(WP.length - 1, i + 2)]; for (let j = 0; j < 14; j++) P.push([cr(a[0], b[0], c[0], d[0], j / 14), cr(a[1], b[1], c[1], d[1], j / 14)]); }
    P.push(WP[WP.length - 1]); let L = 0; P.forEach((p, i) => { if (i) L += Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]); p[2] = L; }); return { P, L }; }
  function pathTo(p, wob = 0, ph = 0) {   // the arm so far, in screen pixels; wob = the whip running through it
    const o = [], L = PATH.L * p; for (let i = 0; i < PATH.P.length; i += 2) { const q = PATH.P[i]; if (q[2] > L) break; o.push([q[0], q[1], q[2]]); }
    let j = 1; while (j < PATH.P.length - 1 && PATH.P[j][2] < L) j++; const a = PATH.P[j - 1], b = PATH.P[j], k = clamp((L - a[2]) / Math.max(1e-3, b[2] - a[2])); o.push([mix(a[0], b[0], k), mix(a[1], b[1], k), L]);
    if (o.length < 3) o.unshift(o[0], o[0]);
    return wob ? o.map((q, i) => { const s = q[2] / Math.max(1, L), w = wob * Math.sin(s * 9 - ph) * Math.sin(Math.PI * s); return [q[0] + w * .6, q[1] + w]; }) : o;
  }
  window.HOSE = { paintBG, balloon, clawd, showman, film, limb, pathTo, buildPath, star, type, ell, line, fs, seg, mix, eio, eo, el, hit, q15, set: (c, bg, gr, path) => { x = c; if (bg) BG = bg; if (gr) GRAIN = gr; if (path) PATH = path; }, K: { PAPER, LIGHT, MID, DARK, INK, WHITE, FLOOR, CX, HP, HH, SX } };
})();
(() => {
  const { paintBG, balloon, clawd, showman, film, limb, pathTo, buildPath, star, type, ell, line, fs, seg, mix, eio, eo, el, hit, q15 } = HOSE, { INK, WHITE, PAPER, FLOOR, CX, HP, HH, SX } = HOSE.K;
  const REST = [0, 96, -300, -100, -330, 90, 0, 0], A = FILM.ANCHOR, HOLD = 1.25, SNAP = 1.65, SMACK = 1.85;   // seconds after marks.stretch: fingers on the string, the snap, the glove in his face
  let x, BG;
  const times = S => { const [L0, L1, L2] = S.lines; return { L0, L1, L2, ST: S.marks.stretch, POP: L1.t0 + L1.words[1][1], W: i => L0.t0 + L0.words[i][1], Z: i => L0.t0 + L0.words[i][2] }; };
  const sounding = (t, l) => l.words.some(([, a, b]) => t >= l.t0 + a - .03 && t < l.t0 + b + .03);
  function man(t, S) {   // the showman's pose: keys [time, [lean, hand R, hand L, cane angle, hat lift, squash]], each reached with a rubbery overshoot
    const { L0, L2, ST, W, Z } = times(S), KEY = [[0, REST], [W(1) - .06, [.14, 250, -470, -110, -360, 8, 0, 0]], [W(3) - .04, [0, 60, -420, -30, -420, -80, 0, .04]], [W(4) - .04, [-.04, 44, -436, 2, -436, -84, 0, .1]],
      [W(5) - .04, [.02, 290, -650, -230, -690, -62, 0, -.08]], [Z(5) + .12, REST], [W(6) - .05, [.24, 150, -292, -96, -430, 78, 0, .03]], [W(11) - .04, [.3, 150, -290, -44, -706, 78, 1, .02]], [Z(11) + .2, REST],
      [ST + .5, [-.1, 96, -300, -40, -700, 90, 0, .12]], [ST + 1.3, REST], [ST + SNAP, [-.05, 110, -330, -150, -480, 80, .25, -.05]], [ST + 2.3, REST], [L2.t0 + 1.25, [.12, 96, -300, -44, -706, 90, 1, .04]], [L2.t0 + 2.15, REST]];
    let i = 0; while (i < KEY.length - 1 && t >= KEY[i + 1][0]) i++; const k = el(seg(t, KEY[i][0], KEY[i][0] + .4)), from = KEY[Math.max(0, i - 1)][1], s = KEY[i][1].map((v, j) => mix(from[j], v, k));
    const talk = sounding(t, L0) && Math.floor(t * 15 + 1e-6) % 2 === 0, e = seg(t, .1, .72); s[7] += .16 * hit(t, .72, 7, 20) - (talk ? .03 : 0);
    return [s, { x: mix(-170, SX, e), hop: 70 * Math.abs(Math.sin(e * Math.PI * 2)), talk, nod: talk ? -.07 : 0, blink: Math.abs(t - 2.9) < .07 || Math.abs(t - 7.2) < .07 || Math.abs(t - 10.6) < .07 }];
  }
  function hero(t, S) {   // Clawd's pose
    const { L1, L2, ST, POP, W, Z } = times(S), a = t - ST, p = t - POP, c = { x: CX, y: FLOOR, h: HP, hose: 0, look: [.3, -1], sq: 0 };
    if (p < 0) { if (t > .9) c.look = [-1, -.2]; if (t >= W(4) - .05 && t < Z(5) + .3) { c.look = [-1, .6]; c.wig = .3 * Math.sin((t - W(4)) * 13); }   // he looks at his own short arms
      c.blink = Math.abs(t - 3.4) < .07 || Math.abs(t - 5.05) < .07; c.sq = .24 * Math.sin(Math.PI / 2 * seg(t, L1.t0 + .1, POP)); return c; }
    const toLocal = P => P.map(q => [(q[0] - c.x) / (1 + c.sq * .7), (q[1] - c.y) / (1 - c.sq) + c.h]);
    c.hose = 1; c.h = mix(HP, HH, eo(seg(p, 0, .14))); c.sq = p < 1.2 ? -.2 * hit(p, 0, 7, 20) : 0; c.look = [-.8, -.1]; c.mouth = sounding(t, L1) && Math.floor(t * 15 + 1e-6) % 2 === 0 ? 'talk' : 'smile'; c.pop = p;
    const out = el(seg(p, 0, .45)), big = seg(t, L1.t0 + L1.words[6][1] - .1, L1.t0 + L1.words[6][1] + .2), go = seg(p, .5, 1), amp = (24 + 40 * big) * go, sw = (50 + 80 * big) * Math.sin(t * 7) * go;   // "no bones": the wave gets bigger
    c.aL = limb([-200, 10], [mix(-230, -300, out), mix(40, -190, out) + sw], -60, amp, t * 13); c.aR = limb([200, 14], [mix(230, 300, out), mix(40, -190, out) - sw], 60, amp, t * 13 + 2);
    if (a >= 0) { c.mouth = 'shut'; c.brow = 1; c.look = [.4, -1]; c.aR = limb([200, 14], [226, 128], 86); c.gR = 2.1;   // one fist on his hip, the other arm does the work
      if (a < .5) { const an = -a * TAU * 3; c.sq = .2 * Math.sin(Math.PI / 2 * seg(a, 0, .3)); c.aL = limb([-200, 10], [-330 + 120 * Math.cos(an), -50 + 120 * Math.sin(an)], -70); c.whirl = 1; }
      else if (a < SNAP) { const pp = eio(seg(a, .5, HOLD)); c.sq = -.07 * pp; c.aL = toLocal(pathTo(Math.max(.03, pp), a > HOLD ? 3 : 0, a * 60)); c.wL = mix(28, 17, pp); c.grip = .5 * seg(a, HOLD, HOLD + .12); if (a > HOLD) { c.mouth = 'o'; c.brow = 0; } }
      else if (a < SMACK) { const pp = 1 - Math.pow(seg(a, SNAP, SMACK), .6); c.aL = toLocal(pathTo(Math.max(.03, pp), 44, a * 50)); c.wL = mix(28, 17, pp); c.mouth = 'o'; c.brow = 0; }
      else { const k = a - SMACK, sl = eio(seg(k, .4, .72)); c.rot = .2 * hit(k, 0, 5, 14); c.x = CX + 34 * hit(k, 0, 5, 14); c.sq = .16 * hit(k, 0, 7, 18); c.eyes = k < .7 ? 'x' : 'sad'; c.mouth = 'sad'; c.brow = 0; c.look = [.3, -.6]; c.dizzy = k;
        c.front = sl < .5; c.gk = mix(1.35, .92, sl); c.aL = limb([-200, 10], [mix(-10, -300, sl), mix(-30, 262, sl)], mix(-130, -50, sl), 14 * (1 - sl), k * 20); c.gL = mix(.45, 3.3, sl); c.aR = limb([200, 14], [mix(226, 250, sl), mix(128, 262, sl)], 60); c.gR = mix(2.1, 2.9, sl); } }
    if (t >= L2.t0) { const d = t - L2.t0, dr = eio(seg(d, .55, 1.1)); c.sq = -.05 * Math.sin(Math.PI * seg(d, .15, .6)) + .13 * dr; c.eyes = 'sad'; c.mouth = d > .5 && d < 1.05 ? 'o' : 'sad'; c.look = [.3, -.8]; c.puff = d;   // a deep breath, and he droops
      c.aL = limb([-200, 10], [-300 - 30 * dr, 262 + 70 * dr], -50 - 40 * dr); c.gL = 3.3 + .9 * dr; c.aR = limb([200, 14], [250 + 20 * dr, 262 + 70 * dr], 50 + 40 * dr); c.gR = 2.9 - .9 * dr; }
    return c;
  }
  FILM.add({ id: 'hose',
    init(el) {
      const c = cv(), bg = document.createElement('canvas'), gr = []; el.append(c); x = c.getContext('2d'); bg.width = FW; bg.height = FH; BG = bg;
      const bx = bg.getContext('2d'); bx.lineCap = bx.lineJoin = x.lineCap = x.lineJoin = 'round'; HOSE.set(bx); paintBG();
      for (let n = 0; n < 3; n++) { const R = rng(30 + n), nz = document.createElement('canvas'); nz.width = 540; nz.height = 960; const nx = nz.getContext('2d'), im = nx.createImageData(540, 960);
        for (let i = 0; i < 540 * 960; i++) { const v = 128 + (R() - .5) * 190; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } nx.putImageData(im, 0, 0); gr.push(nz); }
      HOSE.set(x, bg, gr, buildPath());
    },
    draw(u, S) {
      const { L2, ST, POP } = times(S), f = Math.round(u * 30), t = q15(u), a = t - ST, R = rng(900 + f), M = S.marks;
      HOSE.set(x); x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#0B0906'; x.fillRect(0, 0, FW, FH); x.translate((R() - .5) * 3, (R() - .5) * 3); x.drawImage(BG, 0, 0);   // the gate weave
      // the balloon: on the anchor, tugged a little while the fingers hold its string, then it bobs away higher and sinks back before the iris
      const up = a >= SNAP ? 70 * (1 - Math.exp(-(a - SNAP) * 5) * Math.cos((a - SNAP) * 11)) * (1 - eio(seg(t, L2.t0 + 1.2, M.out))) : 0, bob = 3 * Math.sin(t * 2.2) * seg(t, 0, .6) * (1 - seg(t, M.out - .3, S.dur - .05));
      const bx = A.x + (a >= SNAP ? 16 * hit(a, SNAP, 4, 9) : 0), by = A.y + bob - up + (a < SNAP ? 9 * seg(a, HOLD, HOLD + .1) : 0), [s, o] = man(t, S), c = hero(t, S);
      ell(o.x, FLOOR + 18, 120, 16); x.fillStyle = 'rgba(40,34,24,.4)'; x.fill(); ell(c.x, FLOOR + 18, 270, 26); x.fill();
      if (c.pop != null && c.pop < .2) star(CX, FLOOR - 300, 380 + 500 * c.pop, c.pop * 3, WHITE, 14, .7, 10);   // the pop
      if (c.dizzy != null && c.dizzy < .14) star(c.x - 40, FLOOR - HH - 20, 370, .3, WHITE, 11, .62, 10);        // the smack
      showman(s, o); balloon(bx, by, A.r, null, a >= SNAP ? 30 * hit(a, SNAP, 3, 12) : a > HOLD ? -8 : 0);
      if (c.whirl) [0, 1, 2].forEach(i => { x.beginPath(); x.arc(CX - 330, FLOOR - HH - 50, 150 + i * 26, -a * TAU * 3 + i * 2.1, -a * TAU * 3 + i * 2.1 + 1.1); fs(null, 7); });   // the wind-up
      clawd(c);
      if (a > HOLD && a < HOLD + .2) [-2.6, -2.0, -1.4].forEach(an => { line(700 + Math.cos(an) * 34, 742 + Math.sin(an) * 34, 700 + Math.cos(an) * 66, 742 + Math.sin(an) * 66); fs(null, 6); });   // fingers on the string
      if (a >= SNAP && a < SNAP + .75) { const k = [.6, 1.15, 1][Math.min(2, Math.round((a - SNAP) * 15))]; star(400, 400, 235 * k, -.2, PAPER, 13, .72, 9); type('SNAP!', 400, 440, 'Chango', 110 * k, WHITE, 24, -.12); type('SNAP!', 400, 440, 'Chango', 110 * k, WHITE, 0, -.12); }
      if (c.dizzy != null && c.dizzy > .1 && c.dizzy < 1.25) [0, 1, 2, 3].forEach(i => { const an = c.dizzy * 7 + i * TAU / 4; star(c.x + Math.cos(an) * 200, FLOOR - HH - 215 + Math.sin(an) * 44, 34 * (1 - seg(c.dizzy, .9, 1.25)) + 4, an, WHITE, 5, .45, 7); });
      if (c.puff > .6 && c.puff < 1.45) { const k = seg(c.puff, .6, 1.45), px = c.x + 110 + 150 * k, py = FLOOR - HH + 120 + 50 * k, r = 20 + 22 * k; x.globalAlpha = 1 - k * k; [[-r, 6, .8], [r * .9, 4, .85], [0, -r * .5, 1]].forEach(([dx, dy, q]) => { ell(px + dx, py + dy, r * q, r * q); fs(WHITE, 7); }); ell(px, py + 4, r * 1.2, r * .7); fs(WHITE, 0); x.globalAlpha = 1; }
      const io = seg(u, M.out, M.out + .45); if (io > 0) { x.beginPath(); x.rect(-20, -20, FW + 40, FH + 40); x.arc(A.x, A.y + 26, mix(1500, 150, eio(io)), 0, TAU, true); x.fillStyle = '#0B0906'; x.fill('evenodd'); }   // the iris closes on the balloon
      x.setTransform(1, 0, 0, 1, 0, 0); film(f);
    },
    glide(g) {   // the stage at rest; the rubber-hose Clawd hangs from the string by one long arm
      const s = g.w / 547, co = Math.cos(g.rot), si = Math.sin(g.rot), hand = [g.bx + 6, g.by + g.br + 118], dx = (hand[0] - g.x) / s, dy = (hand[1] - g.y) / s, sw = Math.sin(g.k * 22);
      HOSE.set(x); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(BG, 0, 0); balloon(g.bx, g.by, g.br, hand);
      clawd({ x: g.x - si * HH * s, y: g.y + co * HH * s, h: HH, s, rot: g.rot, hose: 1, look: [.2, -1], mouth: 'smile', dang: .5 * sw, grip: .8, gL: -g.rot,
        aL: limb([-200, 10], [dx * co + dy * si, -dx * si + dy * co], -70), aR: limb([200, 14], [330 + 30 * sw, 190], 60, 18, g.k * 30) });
      film(Math.round(g.k * 300));
    },
    sfx: {
      hs_cane: { prompt: 'one tap of a wooden walking cane on a hollow wooden stage floor, old cartoon, no music, no speech', dur: .5 },
      hs_pop: { prompt: 'old 1930s cartoon pop, a cork pop with a short springy boing, no music, no speech', dur: .7 },
      hs_wiggle: { prompt: 'old cartoon wobble of rubber arms, a soft flubbery wobbling, no music, no speech', dur: 1.1 },
      hs_windup: { prompt: 'old cartoon wind-up, a fast ratchet spinning three times, no whistle, no music, no speech', dur: .6 },
      hs_stretch: { prompt: 'a thick rubber band being stretched very far, slow creaking rubber groan rising in tension, no whistle, no music, no speech', dur: 1.1 },
      hs_tink: { prompt: 'one tiny delicate glass ting, very short, no music, no speech', dur: .5 },
      hs_snap: { prompt: 'a big rubber band snapping back, sharp elastic twang and whip, no music, no speech', dur: .6 },
      hs_slap: { prompt: 'old cartoon slap in the face with a wet rubber glove, one loud smack, no music, no speech', dur: .6 },
      hs_dizzy: { prompt: 'old cartoon dizzy stars, a few small twittering bird chirps circling, no music, no speech', dur: 1.1 },
      hs_sigh: { prompt: 'a small cartoon character sighing, one soft breathy exhale, no words, no music', dur: 1 },
      hs_iris: { prompt: 'an old film camera iris closing, soft mechanical shutter slide, no music, no speech', dur: .6 } },
    amb: { prompt: 'an old film projector running, steady flicker and hum, behind it a soft murmur of a small theatre audience, no music, no clear speech', gain: -24 },
    cues(S) { const { L1, L2, ST, POP, W, Z } = times(S), r = v => +v.toFixed(2);
      return [['hs_cane', .74, -5], ['hs_cane', r(W(1)), -8], ['hs_cane', r(Z(5) + .2), -6], ['hs_cane', r(W(11)), -7], ['hs_pop', r(POP), -2], ['hs_wiggle', r(L1.t0 + L1.words[6][1] - .1), -7], ['hs_windup', r(ST), -5], ['hs_stretch', r(ST + .45), -3],
        ['hs_tink', r(ST + HOLD), -8], ['hs_snap', r(ST + SNAP), -1], ['hs_slap', r(ST + SMACK), -1], ['hs_dizzy', r(ST + SMACK + .1), -9], ['hs_sigh', r(L2.t0 + .55), -6], ['hs_iris', r(S.marks.out), -8]]; }
  });
})();
