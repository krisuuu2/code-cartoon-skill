// styles8/s12_hose.js: style 12, RUBBER HOSE 1930 (the title card of a black-and-white cartoon). Canvas 2D: the character is a small bezier rig
// (hose limbs with no elbows, white gloves, pie-cut eyes), the stage is flat tone, and the film is simulated on top (grain, scratches, dust, a dark iris, rounded gate).
S8.push({ name: 'RUBBER HOSE 1930', tech: 'Canvas 2D · bezier rig · film grain', init(stage) { this.c = cv(); stage.append(this.c); }, draw() {
  const x = this.c.getContext('2d'), R = rng(30), PAPER = '#E9DFC8', LIGHT = '#D2C7AE', MID = '#A1967F', DARK = '#4C4437', INK = '#16120D', WHITE = '#F6F0E0', C = [540, 1090];
  x.lineCap = 'round'; x.lineJoin = 'round';
  const fs = (fill, lw = 9) => { if (fill) { x.fillStyle = fill; x.fill(); } if (lw) { x.lineWidth = lw; x.strokeStyle = INK; x.stroke(); } };
  const rr = (a, b, w, h, r) => { x.beginPath(); x.roundRect(a, b, w, h, r); }, ell = (a, b, rx, ry, rot = 0) => { x.beginPath(); x.ellipse(a, b, rx, ry, rot, 0, TAU); };
  const line = (...p) => { x.beginPath(); x.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]); };
  // the stage: a sunburst, a spotlight disc, floorboards, curtains
  x.fillStyle = LIGHT; x.fillRect(0, 0, FW, FH); x.fillStyle = PAPER; for (let i = 0; i < 24; i += 2) { x.beginPath(); x.moveTo(C[0], C[1]); x.arc(C[0], C[1], 1900, i / 24 * TAU + .13, (i + 1) / 24 * TAU + .13); x.fill(); }
  ell(C[0], C[1] - 10, 440, 440); fs(WHITE, 10); ell(C[0], C[1] - 10, 404, 404); fs(null, 3);
  x.fillStyle = MID; x.fillRect(0, 1440, FW, 480); for (let k = -9; k <= 9; k++) { line(540 + k * 64, 1440, 540 + k * 250, 1920); fs(null, 4); } line(0, 1440, FW, 1440); fs(null, 10);
  [1, -1].forEach(sg => { x.save(); if (sg < 0) { x.translate(FW, 0); x.scale(-1, 1); }
    x.beginPath(); x.moveTo(-10, -10); x.lineTo(250, -10); x.bezierCurveTo(240, 420, 150, 640, 96, 820); x.bezierCurveTo(70, 900, 40, 960, -10, 1010); x.closePath(); fs(DARK, 10);
    [70, 130, 190].forEach(k => { x.beginPath(); x.moveTo(k, 0); x.bezierCurveTo(k - 6, 380, k * .55, 600, k * .34, 800); fs(null, 5); });
    ell(92, 824, 62, 24, -.5); fs(LIGHT, 9); x.restore(); });
  for (let i = 0; i < 7; i++) { ell(i * 180, -30, 118, 118); fs(DARK, 10); ell(i * 180, 70, 13, 13); fs(LIGHT, 7); }
  // the lettering
  const type = (s, y, font, size, fill, lw, maxW) => { x.font = `${size}px ${font}`; const w = x.measureText(s).width; if (maxW && w > maxW) x.font = `${size * maxW / w | 0}px ${font}`; x.textAlign = 'center'; if (lw) { x.lineWidth = lw; x.strokeStyle = INK; x.strokeText(s, 540, y); } x.fillStyle = fill; x.fillText(s, 540, y); };
  type('FABLE 5.2 PRESENTS', 196, 'Limelight', 40, INK, 0); line(330, 216, 750, 216); fs(null, 3);
  x.save(); x.translate(540, 370); x.rotate(-.035); x.translate(-540, -370); type('CLAWD', 376, 'Chango', 190, INK, 26, 590); type('CLAWD', 368, 'Chango', 190, WHITE, 0, 590); x.restore();
  type('in', 452, 'Limelight', 46, INK, 0); type('“SHIP IT!”', 556, 'Chango', 84, WHITE, 16, 520); type('“SHIP IT!”', 556, 'Chango', 84, WHITE, 0, 520);
  // the star
  ell(C[0], 1418, 270, 26); x.fillStyle = 'rgba(40,34,24,.4)'; x.fill();
  x.save(); x.translate(C[0], 1070); x.rotate(-.06);
  const hose = (p, w = 28) => { x.beginPath(); x.moveTo(p[0], p[1]); x.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]); x.lineWidth = w; x.strokeStyle = INK; x.stroke(); };
  const shoe = (a, b, rot) => { x.save(); x.translate(a, b); x.rotate(rot); ell(14, 0, 46, 25); fs(INK, 0); x.beginPath(); x.arc(22, -6, 22, -2.3, -1.0); fs(null, 0); x.lineWidth = 6; x.strokeStyle = PAPER; x.stroke(); x.restore(); };
  const glove = (a, b, rot) => { x.save(); x.translate(a, b); x.rotate(rot); rr(-36, 28, 72, 32, 15); fs(WHITE);
    x.save(); x.rotate(1.35); rr(-14, -74, 28, 54, 14); fs(WHITE); x.restore(); [-.62, -.2, .22, .64].forEach(an => { x.save(); x.rotate(an); rr(-15, -98, 30, 66, 15); fs(WHITE); x.restore(); });
    ell(0, 0, 46, 46); fs(WHITE); [-15, 0, 15].forEach(dx => { line(dx, 4, dx, 24); fs(null, 6); }); x.restore(); };
  [[-58, 26, -.1], [58, 26, .1]].forEach(([lx, kx, rot]) => { hose([lx, 120, lx + kx, 190, lx - kx, 240, lx + kx * .2, 292], 24); shoe(lx + kx * .2 - 8, 300, rot); });          // the back pair of legs
  hose([-200, 10, -330, 10, -370, -130, -318, -238]); hose([200, 14, 330, 20, 348, 150, 232, 132]);                                                                                    // arms: one waves, one on the hip
  [[-138, -34, -.16], [138, 34, .16]].forEach(([lx, kx, rot]) => { hose([lx, 120, lx + kx, 200, lx - kx * .6, 260, lx + kx * .3, 318], 26); shoe(lx + kx * .3 - 10, 326, rot); });
  rr(-205, -150, 410, 290, 74); fs('#BDB29B', 16);
  x.save(); rr(-205, -150, 410, 290, 74); x.clip(); ell(120, 150, 300, 150, -.3); x.fillStyle = 'rgba(76,68,55,.28)'; x.fill(); x.restore();                                          // the tone under the belly
  x.beginPath(); x.arc(-110, -60, 78, 3.5, 4.5); x.lineWidth = 13; x.strokeStyle = WHITE; x.stroke();                                                                                  // the shine
  [-96, 96].forEach(ex => { ell(ex, -42, 42, 68); fs(WHITE, 10); ell(ex + 9, -22, 23, 40); x.fillStyle = INK; x.fill(); x.beginPath(); x.moveTo(ex + 9, -22); x.arc(ex + 9, -22, 46, -1.25, -.55); x.closePath(); x.fillStyle = WHITE; x.fill();   // pie-cut eyes
    x.beginPath(); x.arc(ex, -96, 34, 3.9, 5.5); fs(null, 8); });
  x.beginPath(); x.moveTo(-92, 44); x.quadraticCurveTo(0, 168, 92, 44); x.quadraticCurveTo(0, 82, -92, 44); x.closePath(); x.save(); fs(INK, 10); x.clip(); ell(6, 128, 46, 30); x.fillStyle = MID; x.fill(); x.restore();
  x.beginPath(); x.arc(-98, 36, 16, 3.6, 5.4); fs(null, 8); x.beginPath(); x.arc(98, 36, 16, 4.0, 5.8); fs(null, 8);
  glove(-318, -246, -.35); glove(226, 128, 2.1);
  x.restore();
  [[150, 1020, 42, 3.6, 5.0], [136, 1010, 74, 3.7, 4.9], [330, 1470, 30, .3, 1.5], [760, 1470, 30, 1.6, 2.8]].forEach(([a, b, r, a0, a1]) => { x.beginPath(); x.arc(a, b, r, a0, a1); fs(null, 7); });   // wave and bounce marks
  const note = (a, b, k, rot) => { x.save(); x.translate(a, b); x.rotate(rot); x.scale(k, k); ell(0, 0, 20, 14, -.4); fs(INK, 0); line(17, -4, 17, -84); fs(null, 7); x.beginPath(); x.moveTo(17, -84); x.quadraticCurveTo(52, -70, 44, -36); fs(null, 9); x.restore(); };
  note(858, 820, 1.2, .15); note(930, 960, .9, -.2); note(190, 1250, 1, -.15);
  rr(150, 1610, 780, 116, 18); fs(PAPER, 10); rr(166, 1626, 748, 84, 10); fs(null, 3); type('DRAWN ENTIRELY IN CODE', 1688, 'Limelight', 50, INK, 0, 700);
  // the film
  const nz = document.createElement('canvas'); nz.width = 540; nz.height = 960; const nx = nz.getContext('2d'), im = nx.createImageData(540, 960); for (let i = 0; i < 540 * 960; i++) { const v = 128 + (R() - .5) * 190; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } nx.putImageData(im, 0, 0);
  x.save(); x.globalCompositeOperation = 'overlay'; x.globalAlpha = .34; x.drawImage(nz, 0, 0, FW, FH); x.restore();
  for (let i = 0; i < 7; i++) { const a = (R() < .5 ? 40 : 720) + R() * 320, y0 = R() * 900; x.strokeStyle = i % 3 ? 'rgba(255,250,235,.4)' : 'rgba(20,15,8,.3)'; x.lineWidth = 1 + R() * 2; x.beginPath(); x.moveTo(a, y0); x.lineTo(a + (R() - .5) * 8, y0 + 500 + R() * 900); x.stroke(); }
  for (let i = 0; i < 46; i++) { const a = R() * FW, b = R() * FH; x.strokeStyle = x.fillStyle = `rgba(20,15,8,${.35 + R() * .4})`; if (i % 4) { ell(a, b, 1.5 + R() * 3.5, 1.5 + R() * 2.5); x.fill(); } else { x.lineWidth = 1.6; x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + (R() - .5) * 50, b + (R() - .5) * 50, a + (R() - .5) * 70, b + (R() - .5) * 70); x.stroke(); } }
  const v = x.createRadialGradient(540, 960, 620, 540, 960, 1160); v.addColorStop(0, 'rgba(22,16,8,0)'); v.addColorStop(1, 'rgba(22,16,8,.82)'); x.fillStyle = v; x.fillRect(0, 0, FW, FH);
  x.fillStyle = 'rgba(120,80,30,.1)'; x.fillRect(0, 0, FW, FH); x.beginPath(); x.rect(0, 0, FW, FH); x.roundRect(24, 24, FW - 48, FH - 48, 46); x.fillStyle = '#0B0906'; x.fill('evenodd');
} });
