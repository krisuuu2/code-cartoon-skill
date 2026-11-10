// balloon/sc_drawing.js: F3 "The boy's drawing", the thirteenth style: a child's crayon drawing. Pure SVG rebuilt per frame.
// window.BALLOON_DRAWING(t, { pre, life, hop }) returns { defs, body }: the drawing in 1080 x 1920 user units, so sc_back.js puts the very same picture on the sheet the boy holds up.
// Every stroke is a few control points pushed by a "child's hand" (a fixed error + a small one that changes on twos = the boil), run through a spline and drawn as a fat round line;
// one filter roughens the edge and knocks the paper tooth out of the wax. t < 0 is the sheet before the scene starts (nothing written yet).
window.BALLOON_DRAWING = (() => {
  const N = v => v.toFixed(1), cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const C = { paper: '#FBF8EF', or: '#F0793A', orD: '#CF5A1E', red: '#E4572E', redD: '#B5361C', ink: '#33261E', blue: '#2F7FC2', pen: '#2B4FB8', sky: '#58A6E0', green: '#55AE4E', greenD: '#2F7D3A',
    yel: '#F9CB2F', yelD: '#EE9B1C', brown: '#8A5A3C', roof: '#7C6CD0', wall: '#F6D98A', grey: '#9B9892', pink: '#F06FA0' };
  // a Catmull-Rom spline through the points, as a dense polyline
  function dense(P, step = 10) {
    const o = [];
    for (let i = 0; i < P.length - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2, n = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
      for (let j = 0; j < n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t; o.push([0, 1].map(q => .5 * (2 * p1[q] + (p2[q] - p0[q]) * t + (2 * p0[q] - 5 * p1[q] + 4 * p2[q] - p3[q]) * t2 + (3 * p1[q] - p0[q] - 3 * p2[q] + p3[q]) * t3))); } }
    o.push(P[P.length - 1]); return o;
  }
  const lengthOf = Dn => Dn.reduce((s, p, i) => i ? s + Math.hypot(p[0] - Dn[i - 1][0], p[1] - Dn[i - 1][1]) : 0, 0);
  function cut(Dn, f) {   // the first fraction f of a polyline (the crayon is still on its way)
    if (f >= 1) return Dn; const want = f * lengthOf(Dn), o = [Dn[0]]; let s = 0;
    for (let i = 1; i < Dn.length; i++) { const a = Dn[i - 1], b = Dn[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]); if (s + d <= want) { o.push(b); s += d; } else { const w = (want - s) / (d || 1); o.push([a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w]); break; } }
    return o;
  }
  // "the end" in a child's handwriting: strokes per letter (baseline y = 0), then [letter, x, a wobble of the baseline]
  const GLYPH = { t: [[[42, -205], [40, -110], [42, -30], [58, -4], [84, -12]], [[2, -128], [45, -124], [88, -130]]], h: [[[8, -212], [10, -100], [8, 0]], [[10, -60], [32, -100], [62, -108], [80, -78], [82, 0]]],
    e: [[[10, -56], [50, -58], [86, -64], [78, -100], [48, -112], [18, -92], [6, -52], [22, -14], [56, -2], [88, -20]]], n: [[[8, -108], [10, 0]], [[10, -64], [34, -100], [62, -108], [80, -78], [84, 0]]],
    d: [[[82, -70], [58, -104], [26, -98], [8, -58], [24, -12], [54, -4], [80, -34]], [[84, -212], [84, -100], [86, 0]]] };
  const STROKES = [['t', 0, 0], ['h', 94, 8], ['e', 188, -5], ['e', 340, 6], ['n', 434, -7], ['d', 528, 3]].flatMap(([ch, x, dy]) => GLYPH[ch].map(P => P.map(([px, py]) => [400 + x + px * .8, 770 + dy + py * .8])));
  const LEN = STROKES.map(P => lengthOf(dense(P))), LIFT = 70, TOTAL = LEN.reduce((a, b) => a + b + LIFT, -LIFT), START = LEN.map((_, i) => LEN.slice(0, i).reduce((a, b) => a + b + LIFT, 0));
  const W0 = .35, W1 = 2.3, CREDIT = [2.55, 3.5];   // "the end" is written between W0 and W1; the two credit lines start at CREDIT

  return function (t, { pre = 'dr', life = 1, hop = 0 } = {}) {
    const f15 = Math.floor(t * 15 + 1e-6), tq = f15 / 15, boil = ((f15 % 4) + 4) % 4; let sid = 0;
    const hand = (P, amp = 5) => { const s = ++sid * 131, r = rng(s), rb = rng(s + 17 + boil * 7919); return P.map(([x, y]) => [x + (r() - .5) * 2 * amp + (rb() - .5) * 4.4, y + (r() - .5) * 2 * amp + (rb() - .5) * 4.4]); };
    const path = (Dn, col, w, o = 1) => `<path d="M${Dn.map(p => N(p[0]) + ' ' + N(p[1])).join('L')}" stroke="${col}" stroke-width="${w}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
    const ln = (P, col, w = 14, amp = 5) => path(dense(hand(P, amp)), col, w);
    const ring = (cx, cy, rx, ry, n = 10, turn = 1.12, a0 = -1.9) => [...Array(Math.round(n * turn) + 1)].map((_, i) => { const a = a0 + i / n * 6.2832; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
    // a scribbled fill: one zigzag between the two sides of the shape (half(y) = half its width), turned by ang, and it does not stop at the outline
    const zig = (cx, cy, half, y0, y1, step, ang, col, w = 13, over = 12, o = .9) => { const P = [], ca = Math.cos(ang), sa = Math.sin(ang); let i = 0;
      for (let y = y0; y <= y1; y += step, i++) { const x = (half(y) + over) * (i % 2 ? 1 : -1); P.push([cx + x * ca - y * sa, cy + x * sa + y * ca]); } return path(dense(hand(P, 7), 14), col, w, o); };
    const box = (x0, y0, x1, y1, col, w = 14) => ln([[x0, y1 + 8], [x0 + 2, y0 - 6]], col, w, 4) + ln([[x0 - 8, y0], [x1 + 7, y0 + 2]], col, w, 4) + ln([[x1, y0 - 7], [x1 - 2, y1 + 6]], col, w, 4) + ln([[x1 + 8, y1], [x0 - 6, y1 - 1]], col, w, 4);

    const bx = life * 7 * Math.sin(tq * 2.1), by = life * 13 * Math.sin(tq * 1.6 + .5), B = [190 + bx, 620 + by], H = [140 + bx * .5, 1010 + by * .5];   // the balloon bobs, the hand that holds it follows
    const wave = .55 + life * .5 * Math.sin(tq * 9), cy = -hop, s = [];
    // the sun in the corner, a cloud, two birds
    s.push(zig(905, 215, y => Math.sqrt(Math.max(0, 105 * 105 - y * y)), -98, 98, 22, .5, C.yel, 15, 8), ln(ring(905, 215, 105, 105), C.yelD, 13, 4));
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.2832 + .2, r2 = 190 + 14 * life * Math.sin(tq * 6 + i * 2); s.push(ln([[905 + Math.cos(a) * 135, 215 + Math.sin(a) * 135], [905 + Math.cos(a) * r2, 215 + Math.sin(a) * r2]], C.yelD, 12, 4)); }
    s.push(ln([[150, 330], [170, 270], [240, 255], [290, 215], [370, 225], [410, 270], [480, 280], [500, 335], [430, 362], [300, 366], [190, 362], [150, 330]], C.sky, 13, 5));
    s.push(ln([[520, 474], [548, 444], [570, 474], [594, 442], [622, 470]], C.ink, 9, 3), ln([[640, 536], [660, 514], [676, 534], [694, 512], [712, 532]], C.ink, 8, 3));
    // the ground: green all the way down, grass on top, three flowers
    s.push(zig(540, 1640, () => 285, -580, 580, 27, 1.5, C.green, 19, 26, .85), zig(540, 1372, () => 44, -570, 570, 43, 1.65, C.greenD, 12, 10));
    for (const [fx, fy] of [[150, 1770], [480, 1810], [900, 1750]]) s.push(ln(ring(fx, fy, 17, 17, 6), C.pink, 13, 3), ln([[fx - 2, fy - 2], [fx + 3, fy + 2]], C.yel, 15, 1));
    // the little house
    s.push(zig(936, 1262, () => 68, -66, 66, 22, .25, C.wall, 14, 8), zig(936, 1150, y => (y + 46) * 1.0, -36, 44, 17, 0, C.roof, 13, 6), zig(950, 1308, () => 15, -28, 28, 12, 0, C.brown, 10, 3));
    s.push(box(866, 1194, 1006, 1340, C.brown), ln([[842, 1200], [936, 1100]], C.roof, 14, 4) + ln([[934, 1098], [1030, 1202]], C.roof, 14, 4), box(934, 1276, 968, 1340, C.brown, 10), box(882, 1216, 918, 1252, C.sky, 10), ln([[900, 1216], [900, 1252]], C.sky, 7, 2) + ln([[882, 1234], [918, 1234]], C.sky, 7, 2));
    s.push(ln([[985, 1112], [1000, 1084], [976, 1058], [1004, 1030], [982, 1002]].map(([x, y], i) => [x + life * 9 * Math.sin(tq * 3 + i), y]), C.grey, 10, 4));
    // Clawd: an orange box, stick legs, two eyes
    s.push(zig(615, 1118 + cy, () => 150, -100, 100, 22, -.35, C.or, 17, 14));
    for (const x of [510, 562, 668, 720]) s.push(ln([[x, 1212 + cy], [x + (x < 615 ? -5 : 5), 1338 + cy * .4]], C.orD, 15, 4));
    s.push(box(470, 1020 + cy, 760, 1215 + cy, C.orD, 16), ln([[472, 1120 + cy], [422, 1124 + cy]], C.orD, 22, 3), ln([[760, 1118 + cy], [760 + 62 * Math.cos(wave), 1118 + cy - 62 * Math.sin(wave)]], C.orD, 22, 3));
    s.push(ln([[558, 1072 + cy], [560, 1128 + cy]], C.ink, 22, 2), ln([[672, 1072 + cy], [670, 1128 + cy]], C.ink, 22, 2), ln([[582, 1160 + cy], [615, 1184 + cy], [650, 1158 + cy]], C.ink, 11, 3));
    // the boy: a stick figure with a huge smile; one hand in Clawd's, the other holds the balloon
    s.push(zig(280, 1150, () => 34, -60, 60, 17, .15, C.blue, 13, 10), ln([...Array(11)].map((_, i) => { const a = -2.75 + i * .236, r = i % 2 ? 96 : 60; return [280 + Math.cos(a) * r, 1012 + Math.sin(a) * r]; }), C.brown, 12, 4));
    s.push(ln(ring(280, 1010, 60, 62), C.ink, 13, 4), ln([[258, 996], [259, 1003]], C.ink, 15, 1), ln([[300, 996], [301, 1003]], C.ink, 15, 1), ln([[234, 1010], [254, 1047], [282, 1058], [308, 1046], [327, 1008]], C.ink, 12, 3));
    s.push(ln([[280, 1073], [281, 1236]], C.ink, 13, 4), ln([[281, 1234], [240, 1338], [214, 1340]], C.ink, 13, 4), ln([[281, 1234], [324, 1338], [350, 1340]], C.ink, 13, 4), ln([[281, 1112], [350, 1142], [418, 1126 + cy * .6]], C.ink, 13, 4), ln([[281, 1112], [205, 1096], H], C.ink, 13, 4));
    // the balloon
    s.push(ln([H, [H[0] + 20, 905], [B[0] - 14, 800], [B[0], B[1] + 116]], C.ink, 7, 4), zig(B[0], B[1], y => 92 * Math.sqrt(Math.max(0, 1 - y * y / 12100)), -102, 102, 20, .6, C.red, 16, 10));
    s.push(ln(ring(B[0], B[1], 92, 110), C.redD, 13, 4), ln([[B[0] - 13, B[1] + 130], [B[0], B[1] + 108], [B[0] + 14, B[1] + 129], [B[0] - 13, B[1] + 130]], C.redD, 9, 2));
    // "the end", stroke by stroke
    const done = cl((t - W0) / (W1 - W0)) * TOTAL;
    STROKES.forEach((P, i) => { const Dn = dense(hand(P, 3)), f = cl((done - START[i]) / LEN[i]); if (f > 0) s.push(path(cut(Dn, f), C.pen, 17)); });
    // the credit (Kris 10.11): written under "the end" after it, in a handwriting font pushed through the same crayon filter; never on the sheet the boy holds (t < 0 there)
    const rb = rng(900 + boil * 31), credit = (html, y, t0, d, rot) => { const k = cl((t - t0) / d); if (k <= 0) return ''; const id = `${pre}_c${y}`;
      return `<clipPath id="${id}"><rect x="270" y="${y - 96}" width="${N(800 * k)}" height="140"/></clipPath><g clip-path="url(#${id})"><text x="1034" y="${y}" text-anchor="end" font-family="'Gochi Hand', cursive" font-size="68" stroke-width="2.4" transform="translate(${N((rb() - .5) * 3)} ${N((rb() - .5) * 3)}) rotate(${rot} 700 ${y})">${html}</text></g>`; };
    s.push(credit(`<tspan fill="${C.ink}" stroke="${C.ink}">story by </tspan><tspan fill="${C.orD}" stroke="${C.orD}">@aipractically</tspan>`, 866, CREDIT[0], .9, -1.4), credit(`<tspan fill="${C.ink}" stroke="${C.ink}">&amp; Claude Fable 5.2</tspan>`, 956, CREDIT[1], .75, 1));

    return { defs: `<clipPath id="${pre}_clip"><rect width="1080" height="1920"/></clipPath>
      <filter id="${pre}_cray" filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><feTurbulence type="fractalNoise" baseFrequency=".4" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 7 0 -2.2" result="a"/><feComposite in="d" in2="a" operator="in"/></filter>`,
      body: `<g clip-path="url(#${pre}_clip)"><rect width="1080" height="1920" fill="${C.paper}"/>
      <g filter="url(#${pre}_cray)" fill="none" stroke-linecap="round" stroke-linejoin="round">${s.join('')}</g></g>` };
  };
})();

FILM.add({ id: 'drawing', enter: 'cut',
  async init(el) { this.el = el; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Gochi+Hand&display=block'; document.head.append(l); await new Promise(r => { l.onload = r; l.onerror = r; }); await document.fonts.load('60px "Gochi Hand"', 'story@5.2'); },
  draw(u, S) {
    const l = S.lines[0], uq = Math.floor(u * 15 + 1e-6) / 15, h = Math.min(1, Math.max(0, (uq - l.t0 - l.words[5][1]) / .34));   // the drawn Clawd hops on "next?"
    const d = BALLOON_DRAWING(u - S.marks.scribble, { pre: 'dr', hop: 40 * Math.sin(Math.PI * h) }), z = 1 + .03 * u / (S.dur + .6);
    this.el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0"><defs>${d.defs}</defs><rect width="1080" height="1920" fill="#FBF8EF"/>
      <g transform="translate(540 960) scale(${z.toFixed(4)}) translate(-540 -960)">${d.body}</g></svg>`;
  },
  glide() {},
  sfx: { draw_paper: { prompt: 'a sheet of drawing paper laid flat on a table, soft paper rustle, no music, no speech', dur: .8 },
    draw_crayon: { prompt: 'a wax crayon writing three letters on paper, short scratchy strokes, close up, no music, no speech', dur: 1.1 },
    draw_hop: { prompt: 'tiny cartoon hop, soft springy boing, short, no music, no speech', dur: .5 } },
  amb: { prompt: 'a quiet room in the afternoon, faint birds outside the window, no music, no speech', gain: -28 },
  cues(S) { const l = S.lines[0]; return [['draw_paper', 0, -6], ['draw_crayon', S.marks.scribble + .35, -3], ['draw_crayon', S.marks.scribble + 1.35, -3], ['draw_crayon', S.marks.scribble + 2.55, -7], ['draw_crayon', S.marks.scribble + 3.5, -7], ['draw_hop', l.t0 + l.words[5][1], -8]]; }
});
