// balloon/sc_flow.js: scene 6 of THE BALLOON, FLOW FIELD (the generative plotter of styles8/s6_flow.js: navy paper, thin streamlines that never touch).
// The wind becomes visible. init() packs exactly 600 streamlines once (seed 52, Jobard-Lefer occupancy grid) and keeps them as point lists; draw(u) only strokes them:
// they grow outwards from Clawd, a few and then many, then gusts travel along them left to right, and he rides the one thick gold line up to the balloon.
(() => {
  const NAVY = '#0E1A3A', CREAM = '#EDE6D3', GOLD = '#F2B33D', X0 = 70, X1 = 1010, Y0 = 160, Y1 = 1780, U = 300 / 16, N = 600, PAD = 2, BASE = -.38, DIM = .68, GV = 520, GL = 640, GB = 170, RD = 1.45;
  const OUT = [CREAM, CREAM, CREAM, CREAM, '#7FB2E5', '#7FB2E5', '#7FB2E5', '#3D62B8', '#3D62B8', GOLD], IN = ['#F0793A', '#F0793A', '#F0793A', '#F0793A', '#F0793A', '#FFB703', '#FFB703', '#FFB703', '#FFE9C7'];
  const ss = (a, b, v) => { v = clamp((v - a) / (b - a)); return v * v * (3 - 2 * v); }, mod = (a, n) => ((a % n) + n) % n, eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, bump = k => k > 0 && k < 1 ? Math.sin(Math.PI * k) : 0;
  const mix = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.substr(i, 2), 16) * (1 - t) + parseInt(b.substr(i, 2), 16) * t).toString(16).padStart(2, '0')).join('');
  let x, LINES, HERO, FULL, GRAIN, SPR, I0, I1, TFULL;

  // the packing of the still: a line walks the field from a seed in both directions and stops before it would touch another line (occupancy grid) or leave its region
  function packer(w, h, cell) {
    const gw = Math.ceil(w / cell), gh = Math.ceil(h / cell), occ = new Int32Array(gw * gh); let id = 0;
    const near = (px, py, rad, id, mark) => { const a0 = Math.max(0, (px - rad) / cell | 0), a1 = Math.min(gw - 1, (px + rad) / cell | 0), b0 = Math.max(0, (py - rad) / cell | 0), b1 = Math.min(gh - 1, (py + rad) / cell | 0);
      for (let b = b0; b <= b1; b++) for (let a = a0; a <= a1; a++) { if (mark) occ[b * gw + a] = id; else if (occ[b * gw + a] && occ[b * gw + a] !== id) return true; } return false; };
    return { lay(pts, rad) { id++; pts.forEach(p => near(p[0], p[1], rad, id, true)); },
      line(sx, sy, rad, ang, ok, step, min, max) { id++; if (!ok(sx, sy) || near(sx, sy, rad, id)) return null;
        const half = dir => { const pts = []; let px = sx, py = sy; for (let i = 0; i < max; i++) { const a = ang(px, py) + dir; px += Math.cos(a) * step; py += Math.sin(a) * step; if (!ok(px, py) || near(px, py, rad, id)) break; pts.push([px, py]); } return pts; };
        const pts = [...half(Math.PI).reverse(), [sx, sy], ...half(0)]; if (pts.length < min) return null; pts.forEach(p => near(p[0], p[1], rad, id, true)); return pts; } };
  }
  // the line he rides: under his feet low on the left, a small dip, then up across the frame and flat under the balloon. A Catmull-Rom curve, resampled every ~3 px
  function heroPath() {
    const P = [[-60, 1338], [40, 1352], [150, 1366], [260, 1372], [360, 1368], [450, 1330], [520, 1250], [570, 1160], [615, 1075], [665, 1012], [720, 1000], [790, 994], [880, 975], [960, 950], [1040, 918], [1140, 880]], pts = [];
    for (let i = 1; i < P.length - 2; i++) for (let k = 0; k < 200; k++) { const t = k / 200, a = P[i - 1], b = P[i], c = P[i + 1], d = P[i + 2];
      const p = [0, 1].map(m => .5 * (2 * b[m] + (c[m] - a[m]) * t + (2 * a[m] - 5 * b[m] + 4 * c[m] - d[m]) * t * t + (3 * b[m] - 3 * c[m] + d[m] - a[m]) * t * t * t)), q = pts[pts.length - 1];
      if (p[0] >= X0 && p[0] <= X1 && (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) >= 3)) pts.push(p); }
    return pts;
  }
  function field(T0, T1) {
    const R = rng(52), P = packer(FW, FH, 4), gw = 108, HX = new Float32Array(gw * 192), HY = new Float32Array(gw * 192), HW = new Float32Array(gw * 192);
    for (let b = 0; b < 192; b++) for (let a = 0; a < gw; a++) { let best = 1e9, bi = 0;   // near the hero line the field bends to run beside it
      for (let i = 0; i < HERO.length; i += 3) { const d = Math.hypot(HERO[i][0] - a * 10 - 5, HERO[i][1] - b * 10 - 5); if (d < best) { best = d; bi = i; } }
      const p = HERO[Math.max(0, bi - 3)], q = HERO[Math.min(HERO.length - 1, bi + 3)], l = Math.hypot(q[0] - p[0], q[1] - p[1]), c = b * gw + a; HX[c] = (q[0] - p[0]) / l; HY[c] = (q[1] - p[1]) / l; HW[c] = ss(260, 40, best); }
    const ang = (px, py) => { const a = BASE + (vnoise(px * .0015, py * .0015) - .5) * 2.8 + (vnoise(px * .0052 + 9, py * .0052) - .5), c = (py / 10 | 0) * gw + (px / 10 | 0), w = HW[c]; return w > 0 ? Math.atan2(Math.sin(a) * (1 - w) + HY[c] * w, Math.cos(a) * (1 - w) + HX[c] * w) : a; };
    const ok = (px, py) => px >= X0 && px <= X1 && py >= Y0 && py <= Y1, L = [{ pts: HERO, w: 7, col: GOLD }]; P.lay(HERO, 6.5);
    let tries = 0; for (; tries < 250000 && L.length < N; tries++) { const w = 1.4 + R() * R() * 5, pts = P.line(X0 + R() * (X1 - X0), Y0 + R() * (Y1 - Y0), w / 2 + PAD, ang, ok, 3, 10, 66); if (pts) L.push({ pts, w, col: OUT[R() * OUT.length | 0] }); }
    if (L.length < N) console.error(`flow: only ${L.length} streamlines fit, the caption needs ${N}`);
    // they appear in rings around Clawd (he draws them), a few at first and then faster; each grows along its own path
    const key = L.map((l, i) => i ? Math.hypot(l.pts[0][0] - 260, l.pts[0][1] - 1270) + R() * 320 : -1), cb = Math.cos(BASE), sb = Math.sin(BASE);
    const S = L.map((l, i) => i).sort((a, b) => key[a] - key[b]).map(i => L[i]);
    S.forEach((l, j) => { const n = l.pts.length; l.b = T0 + (T1 - T0) * Math.pow(j / (S.length - 1), 1 / 2.6); l.g = j ? Math.min(.85, .12 + n * 3 / 1300) : 1.2; l.hi = mix(l.col, '#FFFFFF', .6); l.off = R() * 130; l.q = Float32Array.from(l.pts, p => p[0] * cb + p[1] * sb); });
    return S;
  }
  // Clawd: the same packing inside his 16 x 10 grid, on a navy halo, drawn once (2x) and then moved as a sprite. Sprite origin = grid (-2, -4), so a raised arm fits
  function sprite(body) {
    const R = rng(7), c = document.createElement('canvas'), W = 20 * U, H = 16 * U; c.width = W * 2; c.height = H * 2; const g = c.getContext('2d'); g.scale(2, 2);
    g.fillStyle = NAVY; body.forEach(([a, b, w, h]) => g.fillRect((a + 2) * U - 9, (b + 4) * U - 9, w * U + 18, h * U + 18)); g.fillStyle = '#081026'; CLAWD.eyes.forEach(([a, b, w, h]) => g.fillRect((a + 2) * U, (b + 4) * U, w * U, h * U));
    const P = packer(W, H, 2), reg = (px, py) => { const cc = px / U - 2, rr = py / U - 4; return hitR(body, cc, rr) && !hitR(CLAWD.eyes, cc, rr); }, ang = (px, py) => -.42 + (vnoise(px * .016 + 50, py * .016) - .5) * .9;
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = 0; i < 30000; i++) { const w = 1.5 + R() * 2.2, pts = P.line(R() * W, R() * H, w / 2 + 1, ang, reg, 2, 3, 420); if (!pts) continue; g.strokeStyle = IN[R() * IN.length | 0]; g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
    return c;
  }
  const path = (pts, a, b) => { x.beginPath(); x.moveTo(pts[a][0], pts[a][1]); for (let i = a + 1; i <= b; i++) x.lineTo(pts[i][0], pts[i][1]); x.stroke(); };
  function drawField(u, all) {   // returns how many lines exist
    x.globalAlpha = 1; x.fillStyle = NAVY; x.fillRect(0, 0, FW, FH); x.lineCap = 'round'; x.lineJoin = 'round';
    if (all || u >= TFULL) { x.globalAlpha = DIM; x.drawImage(FULL, 0, 0); x.globalAlpha = 1; return LINES.length; }
    let n = 0; for (const l of LINES) { if (u < l.b) break; n++; const k = clamp((u - l.b) / l.g), m = Math.max(1, Math.round(k * (l.pts.length - 1)));
      x.globalAlpha = 1 - (1 - DIM) * clamp((u - l.b - l.g) / .4); x.strokeStyle = l.col; x.lineWidth = l.w; path(l.pts, 0, m);
      if (k < 1) { x.globalAlpha = 1; x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(l.pts[m][0], l.pts[m][1], l.w / 2 + 2.5, 0, TAU); x.fill(); } }   // the pen
    x.globalAlpha = 1; return n;
  }
  function gusts(u, all) {   // the wind: bright bands sweep across the paper along BASE, so on every line a highlight travels downstream; a soft tail, then a bright head
    for (const l of LINES) { const f = all ? 1 : clamp((u - l.b - l.g) / .5); if (f <= 0) continue; const n = l.pts.length, ph = u * GV + l.off;
      for (const [bw, al, dw, col] of [[GB, .5, .6, l.col], [GB * .35, .9, 1.5, l.hi]]) { x.globalAlpha = al * f; x.strokeStyle = col; x.lineWidth = l.w + dw; let a = -1;
        for (let i = 0; i <= n; i++) { const on = i < n && mod(ph - l.q[i], GL) < bw; if (on && a < 0) a = i; else if (!on && a >= 0) { if (i - 1 > a) path(l.pts, a, i - 1); a = -1; } } } }
    x.globalAlpha = 1;
  }
  function clawd(spr, px, py, rot, sx, sy, oy) {   // oy = which row of the sprite sits on (px, py): 14 = under his feet, 9 = body centre
    x.save(); x.translate(px, py); x.rotate(rot); x.scale(sx, sy); x.drawImage(spr, -10 * U, -oy * U, 20 * U, 16 * U); x.restore();
  }
  function balloon(bx, by, r, ex, ey, sag) {   // a flat red disc on a navy halo, and a thin string to (ex, ey)
    x.fillStyle = NAVY; x.beginPath(); x.arc(bx, by, r + 10, 0, TAU); x.fill();
    const str = () => { x.beginPath(); x.moveTo(bx, by + r + 6); x.quadraticCurveTo((bx + ex) / 2 + sag, (by + r + ey) / 2 + 10, ex, ey); x.stroke(); };
    x.lineCap = 'round'; x.strokeStyle = NAVY; x.lineWidth = 12; str(); x.strokeStyle = CREAM; x.lineWidth = 2.5; str();
    x.fillStyle = FILM.RED; x.beginPath(); x.arc(bx, by, r, 0, TAU); x.fill(); x.beginPath(); x.moveTo(bx, by + r - 2); x.lineTo(bx - 9, by + r + 11); x.lineTo(bx + 9, by + r + 11); x.fill();
  }
  function hero(u, R0) {   // the gold line again, over his halo: it lights up when a pulse of wind arrives from the left, and the pulse carries him
    const l = LINES[0], n = l.pts.length, m = Math.round(clamp((u - l.b) / l.g) * (n - 1)); if (m < 1) return;
    const gl = ss(R0 - .35, R0 + .1, u); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = mix(GOLD, '#FFE08A', gl); x.lineWidth = 7 + 2 * gl; path(l.pts, 0, m);
    if (gl <= 0) return; const pf = Math.round(u < R0 ? I0 * ss(R0 - .35, R0, u) + 25 : rideIdx(u, R0) + 25 + Math.max(0, u - R0 - RD) * 400), a = clamp(pf - 50, 0, n - 1), b = clamp(pf, 0, n - 1);
    if (b > a) { x.shadowColor = '#FFB703'; x.shadowBlur = 26; x.strokeStyle = '#FFF6DC'; x.lineWidth = 11; path(l.pts, a, b); x.shadowBlur = 0; }
  }
  const rideIdx = (u, R0) => I0 + (I1 - I0) * eio(clamp((u - R0) / RD));
  function chrome(n) {
    x.globalAlpha = 1; x.strokeStyle = 'rgba(237,230,211,.55)'; x.lineWidth = 2; x.strokeRect(50, 140, 980, 1660);
    x.fillStyle = CREAM; x.font = '700 24px "JetBrains Mono"'; x.textAlign = 'left'; x.fillText(`FLOW FIELD · ${String(n).padStart(3, '0')} STREAMLINES · SEED 52`, 52, 1850); x.textAlign = 'right'; x.fillText('PLOT 06', 1030, 112); x.drawImage(GRAIN, 0, 0);
  }

  FILM.add({ id: 'flow',
    init(el) {
      const c = cv(), S = FILM.S('flow'), l0 = S.lines[0]; el.append(c); x = c.getContext('2d');
      HERO = heroPath(); LINES = field(l0.t0 - .35, l0.t0 + l0.words[5][2]); TFULL = Math.max(...LINES.map(l => l.b + l.g)) + .4;   // the last line starts as he finishes saying "six hundred lines"
      const at = X => HERO.reduce((b, p, i) => Math.abs(p[0] - X) < Math.abs(HERO[b][0] - X) ? i : b, 0); I0 = at(260); I1 = at(FILM.ANCHOR.x + 8);
      FULL = cv(); x = FULL.getContext('2d'); x.lineCap = 'round'; x.lineJoin = 'round'; LINES.forEach(l => { x.strokeStyle = l.col; x.lineWidth = l.w; path(l.pts, 0, l.pts.length - 1); });
      GRAIN = cv(); x = GRAIN.getContext('2d'); const R = rng(9); for (let i = 0; i < 16000; i++) { x.fillStyle = `rgba(255,255,255,${R() * .05})`; x.fillRect(R() * FW, R() * FH, 2, 2); }
      SPR = { sit: sprite(CLAWD.body), up: sprite(CLAWD.body.concat([[14, -2, 2, 8]])) }; x = c.getContext('2d');
    },
    draw(u, S) {
      const R0 = S.marks.ride, A = R0 + RD, n = drawField(u), AN = FILM.ANCHOR; gusts(u);
      // Clawd: still while the field is drawn; a squash, a small hop as the pulse lifts him, then he surfs the line, leaning into its slope, and settles under the balloon
      const f = rideIdx(u, R0), i = Math.min(HERO.length - 2, Math.floor(f)), t = f - i, px = HERO[i][0] + (HERO[i + 1][0] - HERO[i][0]) * t, py = HERO[i][1] + (HERO[i + 1][1] - HERO[i][1]) * t;
      const p = HERO[Math.max(0, i - 5)], q = HERO[Math.min(HERO.length - 1, i + 5)], rot = Math.atan2(q[1] - p[1], q[0] - p[0]) * .85 * ss(R0, R0 + .3, u);
      const sy = 1 - .1 * ss(R0 - .25, R0 - .06, u) + .18 * ss(R0 - .03, R0 + .1, u) - .08 * ss(R0 + .15, R0 + .42, u) - .07 * bump((u - A + .12) / .34), lift = 30 * bump((u - R0) / .42) - 4 * Math.sin((u - A) * 2.4) * ss(A + .1, A + .6, u);
      clawd(SPR.sit, px, py - 4 - lift, rot, 2 - sy, sy, 14);
      balloon(AN.x, AN.y + Math.sin(u * 1.7) * 3, AN.r, AN.x + Math.sin(u * 1.3 + 1) * 10 - 6, AN.y + AN.r + 150, Math.sin(u * 2.1) * 12);
      hero(u, R0); chrome(n);
    },
    glide(g) {   // the full field with its gusts, the hatched Clawd hanging by one raised arm under the red disc
      const sc = g.w / 300, c = Math.cos(g.rot), s = Math.sin(g.rot), u = 20 + g.k * 3;
      drawField(u, true); gusts(u, true); clawd(SPR.up, g.x, g.y, g.rot, sc, sc, 9);
      balloon(g.bx, g.by, g.br, g.x + 7 * U * sc * (c + s), g.y + 7 * U * sc * (s - c), 14 * Math.sin(g.k * 9)); chrome(LINES.length);
    },
    sfx: {
      fl_pen: { prompt: 'one single stroke of a pen plotter on paper, a short dry felt-tip scratch with a tiny motor whirr, no music, no speech', dur: .8 },
      fl_plot: { prompt: 'a pen plotter drawing hundreds of fast lines on paper, dry pen scratching and small stepper motors, starting sparse and building up denser and faster, no music, no speech', dur: 3 },
      fl_count: { prompt: 'one small soft mechanical counter click followed by a quiet high bell ding, no music, no speech', dur: .8 },
      fl_wind: { prompt: 'a soft airy wind slowly rising, a gentle breath of moving air, no whistling, no music, no speech', dur: 4 },
      fl_lift: { prompt: 'a gentle lift into the air, a soft warm airy tone rising slowly with a light shimmer, no whoosh, no swoosh, no music, no speech', dur: 2 },
      fl_settle: { prompt: 'a soft light felt bump, something small settling gently on paper, no music, no speech', dur: .5 } },
    amb: { prompt: 'a quiet drawing room, faint paper rustle and very soft moving air, no music, no speech', gain: -26 },
    cues(S) { const r = v => +v.toFixed(2), T0 = S.lines[0].t0 - .35, R0 = S.marks.ride;
      return [['fl_pen', r(T0), -6], ['fl_pen', r(T0 + .3), -10], ['fl_plot', r(T0 + .55), -8], ['fl_count', r(S.lines[0].t0 + S.lines[0].words[5][2]), -10], ['fl_wind', r(S.lines[0].t0 + S.lines[0].words[6][1] - .2), -9], ['fl_pen', r(R0 - .35), -12], ['fl_lift', r(R0 - .05), -6], ['fl_settle', r(R0 + RD), -10]]; }
  });
})();
