// balloon/sc_book.js: scene 1 "Picture book", and BOOK, the cut-paper kit that sc_back.js (F2 "Home") shares: the meadow, the Clawd and boy puppets, the balloon, the parallax planes.
// Pure SVG rebuilt for every frame, after styles8/duet_book.js: each layer is a sheet of cut paper (edge displaced by noise + a drop shadow) on its own plane, the paint is feTurbulence.
// World: pixels, x to the right, y UP, the meadow is y = 0. Clawd is 328 wide (arm tip to arm tip), the boy 276 tall. Puppets are posed on twos (15 poses a second), the camera moves on every frame.
// Filter ids carry a prefix per scene, because every scene of the film lives in the same document.
window.BOOK = (() => {
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), k = (t, a, b) => cl((t - a) / (b - a)), mix = (a, b, u) => a + (b - a) * u;
  const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, out = x => 1 - Math.pow(1 - x, 3), inn = x => x * x * x;
  const hit = (t, a, d = 9, f = 30) => t < a ? 0 : Math.exp(-(t - a) * d) * Math.cos((t - a) * f);   // the damped wobble after an impact at time a
  const D = a => (a * 180 / Math.PI).toFixed(2), N = v => (+v).toFixed(1), q15 = u => Math.floor(u * 15 + 1e-6) / 15;
  // keys [[t, a, b...], ...]: eased from key to key (track), or one smooth curve through all of them (herm)
  const seg = (t, K) => { let i = 0; while (i < K.length - 2 && t >= K[i + 1][0]) i++; return i; };
  const track = (t, K) => { const i = seg(t, K), a = K[i], b = K[i + 1], w = eio(k(t, a[0], b[0])); return a.slice(1).map((v, j) => mix(v, b[j + 1], w)); };
  const herm = (t, K) => { const i = seg(t, K), a = K[i], b = K[i + 1], p = K[i - 1], n = K[i + 2], dt = b[0] - a[0], s = k(t, a[0], b[0]), s2 = s * s, s3 = s2 * s;
    return a.slice(1).map((v, j) => { const w = b[j + 1], ma = p ? (w - p[j + 1]) / (b[0] - p[0]) : 0, mb = n ? (n[j + 1] - v) / (n[0] - a[0]) : 0; return (2 * s3 - 3 * s2 + 1) * v + (s3 - 2 * s2 + s) * dt * ma + (3 * s2 - 2 * s3) * w + (s3 - s2) * dt * mb; }); };
  const talk = (t, l) => l.words.some(([, a, b]) => t >= l.t0 + a - .03 && t < l.t0 + b + .03) && Math.floor(t * 15 + 1e-6) % 2 === 0;   // the mouth flaps while a word of the line sounds
  const rotS = ([x, y], th, [px, py]) => [px + (x - px) * Math.cos(th) - (y - py) * Math.sin(th), py + (x - px) * Math.sin(th) + (y - py) * Math.cos(th)];   // as SVG rotate(): y down
  const OR = '#F0793A', INK = '#2B2118', SKIN = '#F6C9A0', HAIR = '#6B4226', SHIRT = '#2F7FC2', WHITE = '#FFFDF4', RED = '#E4572E', YEL = '#FFC93C';

  // ---------- Clawd: armL / armR 0 = straight out, + = raised; look [x, y], y up; mouth flat | smile | o | grin; eyes 1 open, 0 shut, 2 happy; sq = squash ----------
  const C0 = o => ({ x: 0, y: 0, rot: 0, sq: 0, eyes: 1, pop: 1, look: [0, 0], mouth: 'smile', armL: 0, armR: 0, lenL: 52, lenR: 52, legs: 0, brow: 0, ...o });
  function clawdG(c) {
    const lx = c.look[0] * 9, ly = -c.look[1] * 9, ln = `stroke="${INK}" fill="none" stroke-linecap="round"`;
    const eye = ex => c.eyes === 2 ? `<path d="M${ex - 21} -132 q 21 -22 42 0" ${ln} stroke-width="8"/>` : c.eyes < .5 ? `<path d="M${ex - 20} -138 q 20 16 40 0" ${ln} stroke-width="8"/>` :
      `<circle cx="${ex}" cy="-140" r="${N(23 * c.pop)}" fill="${WHITE}"/><circle cx="${N(ex + lx)}" cy="${N(-140 + ly)}" r="${N(11 * c.pop)}" fill="${INK}"/><circle cx="${N(ex + lx - 5)}" cy="${N(-145 + ly)}" r="4" fill="#fff"/>`;
    const mouth = { flat: `<path d="M-14 -94 h28" ${ln} stroke-width="7"/>`, smile: `<path d="M-32 -102 Q0 -72 32 -102" ${ln} stroke-width="8"/>`, o: `<ellipse cx="0" cy="-92" rx="13" ry="17" fill="${INK}"/>`,
      grin: `<path d="M-40 -106 Q0 -48 40 -106Z" fill="${INK}"/><ellipse cx="2" cy="-78" rx="15" ry="8" fill="#FF8A7A"/>` }[c.mouth];
    const brow = c.brow ? `<path d="M-98 ${N(-178 - 8 * c.brow)} L-44 ${N(-172 + 9 * c.brow)} M98 ${N(-178 - 8 * c.brow)} L44 ${N(-172 + 9 * c.brow)}" ${ln} stroke-width="9"/>` : '';
    return `<g transform="translate(${N(c.x)} ${N(-c.y)}) rotate(${D(-c.rot)} 0 -100) scale(${(1 + .8 * c.sq).toFixed(3)} ${(1 - c.sq).toFixed(3)})" fill="${OR}">
      ${[-100, -60, 40, 80].map((x, i) => `<rect x="${x}" y="-46" width="20" height="48" rx="9" transform="rotate(${D(c.legs * (i % 2 ? 1 : -1))} ${x + 10} -44)"/>`).join('')}
      <g transform="translate(-112 -100) rotate(${D(c.armL)})"><rect x="${N(-c.lenL)}" y="-20" width="${N(c.lenL + 12)}" height="40" rx="18"/></g><g transform="translate(112 -100) rotate(${D(-c.armR)})"><rect x="-12" y="-20" width="${N(c.lenR + 12)}" height="40" rx="18"/></g>
      <rect x="-120" y="-200" width="240" height="166" rx="30"/><circle cx="-102" cy="-98" r="16" fill="#FF9E80" opacity=".8"/><circle cx="102" cy="-98" r="16" fill="#FF9E80" opacity=".8"/>${eye(-70)}${eye(70)}${mouth}${brow}</g>`;
  }
  function armTip(c, side) { const a = side < 0 ? c.armL : c.armR, len = side < 0 ? c.lenL : c.lenR, p = rotS([side * (112 + len * Math.cos(a)) * (1 + .8 * c.sq), (-100 - len * Math.sin(a)) * (1 - c.sq)], -c.rot, [0, -100]); return [c.x + p[0], c.y - p[1]]; }

  // ---------- the boy: limb angles from "straight down", + swings toward screen right, PI is straight up; lean < 0 leans right; mouth smile | o | laugh | sad ----------
  const B0 = o => ({ x: 0, y: 0, rot: 0, sq: 0, lean: 0, armL: -.12, armR: .12, legL: 0, legR: 0, look: [1, 0], mouth: 'smile', ...o });
  const limb = (px, py, a, len, w, col, end) => `<g transform="translate(${px} ${py}) rotate(${D(-a)})"><rect x="${-w / 2}" y="0" width="${w}" height="${len}" rx="${w / 2}" fill="${col}"/>${end}</g>`;
  function boyG(b) {
    const shoe = `<ellipse cx="9" cy="92" rx="27" ry="15" fill="${RED}"/>`, fist = `<circle cx="0" cy="86" r="13" fill="${SKIN}"/>`, sleeve = `<rect x="-12" y="-6" width="24" height="34" rx="11" fill="${SHIRT}"/>`;
    const mouth = { smile: `<path d="M2 16 q 14 12 28 0" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`, sad: `<path d="M4 25 q 13 -11 26 0" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      o: `<ellipse cx="17" cy="20" rx="8" ry="10" fill="${INK}"/>`, laugh: `<path d="M0 12 Q16 40 34 12Z" fill="${INK}"/>` }[b.mouth];
    return `<g transform="translate(${N(b.x)} ${N(-b.y)}) rotate(${D(-b.rot)} 0 -95) scale(${(1 + .6 * b.sq).toFixed(3)} ${(1 - b.sq).toFixed(3)})">
      ${limb(-15, -95, b.legL, 92, 22, SKIN, shoe)}<g transform="rotate(${D(-b.lean)} 0 -95)">${limb(-30, -178, b.armL, 86, 18, SKIN, sleeve + fist)}</g>${limb(15, -95, b.legR, 92, 22, SKIN, shoe)}
      <rect x="-36" y="-114" width="72" height="42" rx="13" fill="${YEL}"/>
      <g transform="rotate(${D(-b.lean)} 0 -95)"><rect x="-37" y="-192" width="74" height="98" rx="22" fill="${SHIRT}"/><rect x="-37" y="-162" width="74" height="11" fill="${WHITE}"/><rect x="-37" y="-138" width="74" height="11" fill="${WHITE}"/>
        <g transform="translate(0 -232)"><circle r="45" fill="${SKIN}"/><path d="M-47 -2 A47 47 0 0 1 47 -2 L38 -14 Q10 -36 -18 -22 Q-36 -18 -47 -2Z" fill="${HAIR}"/><path d="M-6 -44 q 12 -24 28 -10 q -16 2 -14 14Z" fill="${HAIR}"/>
          <circle cx="${N(4 + b.look[0] * 5)}" cy="${N(2 - b.look[1] * 5)}" r="6" fill="${INK}"/><circle cx="${N(30 + b.look[0] * 5)}" cy="${N(2 - b.look[1] * 5)}" r="6" fill="${INK}"/><circle cx="-6" cy="20" r="10" fill="#FF9E80" opacity=".8"/>${mouth}</g>
        ${limb(30, -178, b.armR, 86, 18, SKIN, sleeve + fist)}</g></g>`;
  }
  function boyHand(b, side) { const a = side < 0 ? b.armL : b.armR; let p = rotS([side * 30 + 86 * Math.sin(a), -178 + 86 * Math.cos(a)], -b.lean, [0, -95]); p = rotS([p[0] * (1 + .6 * b.sq), p[1] * (1 - b.sq)], -b.rot, [0, -95]); return [b.x + p[0], b.y - p[1]]; }

  // ---------- the balloon (x, y) with the end of its string at (hx, hy); effects ----------
  const balloonG = bl => { const s = bl.s || .97, ky = -(bl.y - 80 * s); return `<path d="M${N(bl.hx)} ${N(-bl.hy)} Q${N(bl.hx + (bl.x - bl.hx) * .2 + 22)} ${N((-bl.hy + ky) / 2)} ${N(bl.x)} ${N(ky)}" stroke="#5B4636" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g transform="translate(${N(bl.x)} ${N(-bl.y)}) scale(${s.toFixed(3)})"><ellipse rx="62" ry="74" fill="${RED}"/><path d="M-11 72 L0 90 L11 72Z" fill="${RED}"/><ellipse cx="-22" cy="-28" rx="15" ry="25" fill="#fff" opacity=".45" transform="rotate(-20 -22 -28)"/></g>`; };
  const starPts = [...Array(10)].map((_, i) => { const a = i / 10 * 6.2832 - 1.57, r = i % 2 ? 26 : 64; return `${N(Math.cos(a) * r)},${N(Math.sin(a) * r)}`; }).join(' ');
  const fxAt = (t, list) => list.filter(([, a, d]) => t >= a && t < a + d).map(([type, a, d, x, y, s = 1]) => ({ type, x, y, s, k: (t - a) / d }));
  const fxG = F => F.map(f => { const o = N(1 - f.k * f.k), q = out(f.k), s = f.s;
    if (f.type === 'dust') return [-1, 0, 1].map(i => `<circle cx="${N(f.x + i * (50 + 90 * q) * s)}" cy="${N(-f.y - (14 + (i ? 0 : 26) * q) * s)}" r="${N((20 + 22 * q) * s)}" fill="${WHITE}" opacity="${o}"/>`).join('');
    if (f.type === 'star') return `<polygon points="${starPts}" fill="${YEL}" opacity="${o}" transform="translate(${N(f.x)} ${N(-f.y)}) rotate(${N(f.k * 40)}) scale(${N((.5 + q) * s)})"/>`;
    return `<path d="M0 18 C-34 -8 -18 -34 0 -14 C18 -34 34 -8 0 18Z" fill="#FF8FB1" opacity="${o}" transform="translate(${N(f.x)} ${N(-f.y - 90 * q)}) scale(${N((1 + q) * s)})"/>`; }).join('');   // a heart

  // ---------- the world: fixed sheets of paper, built once ----------
  const R = rng(7), cloud = (x, y, s) => `<g transform="translate(${x} ${-y}) scale(${s})" fill="${WHITE}"><circle cx="-70" cy="10" r="50"/><circle cx="-10" cy="-25" r="68"/><circle cx="65" cy="5" r="55"/><rect x="-120" y="5" width="240" height="56" rx="28"/></g>`;
  const tree = (x, y, r, col) => `<rect x="${x - 10}" y="${y - 8}" width="20" height="${r * 1.4}" rx="7" fill="#8A5A3C"/><circle cx="${x}" cy="${y - r * .5}" r="${r}" fill="${col}"/>`;
  const tuft = (x, y, col = '#4FA35A') => `<path d="M${x} ${y} l-8 -30 M${x + 14} ${y} l2 -36 M${x + 28} ${y} l10 -28" stroke="${col}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const sun = pose => `<g transform="translate(-250 -600)"><g fill="#FFAE1F">${[...Array(12)].map((_, i) => `<rect x="-13" y="-212" width="26" height="54" rx="13" transform="rotate(${i * 30 + pose * 2})"/>`).join('')}</g><circle r="128" fill="${YEL}"/><circle cx="-40" cy="-14" r="11" fill="#7A4A12"/><circle cx="40" cy="-14" r="11" fill="#7A4A12"/>
    <path d="M-44 28 Q0 74 44 28" stroke="#7A4A12" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="-70" cy="30" r="20" fill="#FF8A5B" opacity=".65"/><circle cx="70" cy="30" r="20" fill="#FF8A5B" opacity=".65"/></g>`;
  const SKY = cloud(-270, 420, .9) + cloud(360, 250, .7) + cloud(230, 974, .8) +cloud(330, 1100, .85) + cloud(760, 470, .8) + cloud(900, 1010, 1) + cloud(160, 1270, .7) + cloud(-540, 660, .75);
  const HILLS = `<path d="M700 130 Q1500 -330 2400 130 V1400 H700Z" fill="#9BD08A"/><path d="M-1500 80 Q0 -440 1500 80 V1400 H-1500Z" fill="#A9D98C"/>${tree(-120, -160, 56, '#3F8F5A')}${tree(-20, -200, 72, '#57A866')}${tree(560, -150, 60, '#57A866')}${tree(660, -90, 46, '#3F8F5A')}
    <rect x="250" y="-270" width="110" height="96" fill="#FFF3DC"/><path d="M232 -264 L305 -340 L378 -264Z" fill="${RED}"/><rect x="290" y="-228" width="32" height="54" rx="9" fill="#8A5A3C"/><rect x="262" y="-250" width="22" height="22" rx="5" fill="#8FD0E8"/>`;
  const GROUND = `<path d="M-2400 10 Q-1200 -20 0 0 T2400 0 T4800 0 V2600 H-2400Z" fill="#7CC36E"/>` + [...Array(17)].map((_, i) => tuft(-900 + i * 138 + Math.round(R() * 60), 50 + Math.round(R() * 150))).join('');
  const FG = `<path d="M-2400 130 Q-1000 60 0 120 T2400 110 T4800 120 V2900 H-2400Z" fill="#4FA35A"/>` + [...Array(20)].map((_, i) => { const x = -900 + i * 172 + Math.round(R() * 70), y = 175 + Math.round(R() * 90);
    return `<g transform="translate(${x} ${y})"><path d="M0 0 q ${i % 2 ? 12 : -12} 46 0 100" stroke="#2F6B3A" stroke-width="7" fill="none" stroke-linecap="round"/>${[0, 1, 2, 3, 4].map(q => `<circle cx="${N(Math.cos(q * 1.257) * 18)}" cy="${N(Math.sin(q * 1.257) * 18)}" r="13" fill="${[WHITE, YEL, '#FF8FB1'][i % 3]}"/>`).join('')}<circle r="9" fill="${RED}"/></g>`; }).join('');
  // the cliff: six torn strips of brown paper, the upper one always lies on the one under it; a strip of grass on top
  const CLIFF = { x: 1316, top: 1250 };
  CLIFF.svg = (() => { const cols = ['#8A5A3C', '#A9744B', '#7A4E33', '#B98556', '#94643F', '#C49A6C'], n = 6, h = (CLIFF.top + 30) / n; let s = '';
    for (let i = 0; i < n; i++) { const y1 = 60 - i * h, y0 = y1 - h - 30, xl = CLIFF.x + (i === n - 1 ? -10 : (R() - .5) * 46); let d = `M${N(xl)} ${N(y0)} L3600 ${N(y0)} L3600 ${N(y1)}`;
      for (let x = 3500; x > xl + 60; x -= 90 + R() * 90) d += ` L${N(x)} ${N(y1 + (R() - .5) * 38)}`;
      d += ` L${N(xl + (R() - .5) * 20)} ${N(y1 + 8)} L${N(xl - 12 + R() * 26)} ${N((y0 + y1) / 2)}Z`; s += `<path d="${d}" fill="#2B170C" opacity=".26" transform="translate(-4 12)"/><path d="${d}" fill="${cols[i]}"/>`; }
    for (const [x, y, w] of [[1500, -260, 90], [1640, -700, 70], [1420, -930, 110], [1760, -480, 80]]) s += `<path d="M${x} ${y} l${w * .4} 26 l${w * .25} -18 l${w * .35} 22" stroke="#5E3B26" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>`;
    const g = `M${CLIFF.x - 30} ${-CLIFF.top - 16} Q${CLIFF.x + 500} ${-CLIFF.top - 44} 3600 ${-CLIFF.top - 20} L3600 ${-CLIFF.top + 30} ` + [...Array(14)].map((_, i) => `L${N(3500 - i * 165)} ${N(-CLIFF.top + 14 + R() * 30)}`).join(' ') + ` L${CLIFF.x - 34} ${-CLIFF.top + 22}Z`;
    return s + `<path d="${g}" fill="#2B170C" opacity=".26" transform="translate(-3 12)"/><path d="${g}" fill="#7CC36E"/>${tree(1730, -CLIFF.top - 60, 66, '#3F8F5A')}${tuft(1380, -CLIFF.top - 20)}${tuft(1560, -CLIFF.top - 26)}${tuft(1900, -CLIFF.top - 24)}${tuft(1340, 70)}${tuft(1470, 84)}${tuft(1640, 70)}`; })();

  // ---------- one frame ----------
  // a parallax plane: p = 0 is glued to the screen, 1 is the plane of the actors, more than 1 is in front of them. The paper filter sits on a group around the planes = in screen space,
  // which keeps it fast; and the fewer filtered groups the faster (about 0.07 s each), so sheets that never overlap share one.
  const plane = cam => (p, inner) => `<g transform="translate(540 960) scale(${(1 + (cam.zoom - 1) * p).toFixed(4)}) translate(${(-cam.cx * p).toFixed(2)} ${(cam.cy * p).toFixed(2)})">${inner}</g>`;
  const paper = (id, seed, scale, shadow) => `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><feTurbulence type="fractalNoise" baseFrequency=".028" numOctaves="2" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="d"/>${shadow ? '<feDropShadow in="d" dx="0" dy="8" stdDeviation="6" flood-color="#17361f" flood-opacity=".3"/>' : ''}</filter>`;
  const seen = (cam, x, y, m = 280) => Math.abs(x - cam.cx) * cam.zoom < 540 + m * cam.zoom && Math.abs(y - cam.cy) * cam.zoom < 960 + m * cam.zoom;
  const shadow = (x, y, w) => `<ellipse cx="${N(x)}" cy="8" rx="${N(w * (1 - Math.min(y, 600) / 900))}" ry="${N(18 * (1 - Math.min(y, 600) / 900))}" fill="#3F8F5A" opacity=".5"/>`;
  // the paint (brush streaks, gouache blotches, grain in two alternating seeds) never changes, so it is rendered once into canvases that lie over the SVG
  async function mount(el) {
    const h = { svg: el.appendChild(document.createElement('div')), ov: [] };
    for (const [f, oct, seed, m, blend, op] of [['.003 .16', 2, 5, [.6, .1], 'soft-light', .55], ['.007 .012', 3, 21, [.5, .2], 'multiply', .28], ['.8', 3, 8, [.4, .32], 'multiply', .5], ['.8', 3, 9, [.4, .32], 'multiply', .5]]) {
      const cv = el.appendChild(document.createElement('canvas')), img = new Image(); cv.width = 1080; cv.height = 1920; cv.style.cssText = `position:absolute;left:0;top:0;pointer-events:none;mix-blend-mode:${blend}`;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><filter id="w" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${f}" numOctaves="${oct}" seed="${seed}"/><feColorMatrix type="matrix" values="${m[0]} ${m[0]} ${m[0]} 0 ${m[1]}  ${m[0]} ${m[0]} ${m[0]} 0 ${m[1]}  ${m[0]} ${m[0]} ${m[0]} 0 ${m[1]}  0 0 0 0 1"/></filter><rect width="1080" height="1920" filter="url(#w)"/></svg>`);
      await img.decode(); cv.getContext('2d').drawImage(img, 0, 0); h.ov.push([cv, op]);
    }
    return h;
  }
  // st: { pre, cam { cx, cy, zoom }, pose, c, b, bl, fx, tex (paint 0..1), shadows, others (more puppets, world SVG), defs, under(L) / top(L) / front(L): more layers behind the puppets / in front of them / in front of everything }
  function frame(h, st) {
    const { pre, cam, pose = 0, c, b, bl, fx = [], tex = 1 } = st, P = plane(cam), F = (f, inner) => `<g filter="url(#${pre}${f})">${inner}</g>`, L = (p, inner, f = 'cut') => F(f, P(p, inner));
    const rest = (b && seen(cam, b.x, 140) ? boyG(b) : '') + (st.others || '') + fxG(fx);
    h.ov.forEach(([cv, op], i) => { cv.style.opacity = (op * tex).toFixed(3); cv.style.display = i < 2 || i - 2 === pose % 2 ? 'block' : 'none'; });
    h.svg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0">
      <defs>${paper(pre + 'cut', 4, 12, 1)}${paper(pre + 'boil', 11 + pose % 3, 12, 1)}${paper(pre + 'cray', 2 + pose % 3, 7, 0).replace('.028', '.6').replace('numOctaves="2"', 'numOctaves="1"')}${st.defs || ''}</defs>
      <rect width="1080" height="1920" fill="#BCE5F1"/>${F('cut', P(.1, sun(pose)) + P(.3, SKY) + P(.5, HILLS))}
      ${L(1, GROUND + (c ? shadow(c.x, c.y, 165) : '') + (b ? shadow(b.x, b.y, 62) : '') + (st.shadows || '') + (cam.cx + 640 / cam.zoom > CLIFF.x ? CLIFF.svg : ''))}
      ${bl && seen(cam, bl.x, bl.y - 100) ? L(1, balloonG(bl), 'boil') : ''}${st.under ? st.under(L) : ''}${c ? L(1, clawdG(c), 'boil') : ''}${rest ? L(1, rest, 'boil') : ''}
      ${st.top ? st.top(L) : ''}${L(1.3, FG)}${st.front ? st.front(L) : ''}</svg>`;
  }

  // ---------- the finale pose: the meadow at rest, the boy looking up, Clawd under the balloon at the place the engine asks for. sc_back.js starts from glideState(FILM.glidePose(1)). ----------
  const HOME = { cx: 78, cy: 372, zoom: 300 / 328 };
  function glideState(g) {
    const cam = { ...HOME }, w = (x, y) => [cam.cx + (x - 540) / cam.zoom, cam.cy + (960 - y) / cam.zoom], r = -g.rot, [mx, my] = w(g.x, g.y), [bx, by] = w(g.bx, g.by);
    const c = C0({ rot: r, x: mx + 17 * Math.sin(r), y: my - 17 * Math.cos(r) - 100, armL: 1.1, lenL: 118, legs: .2 * Math.sin(g.k * 25), look: [-.5, -.8], mouth: g.k > .85 ? 'smile' : 'grin' });   // (mx, my) is the middle of his body
    const tp = armTip(c, -1), b = B0({ x: -310, armL: -2.75, armR: 2.75, mouth: 'laugh' }), dx = c.x - b.x, dy = c.y + 117 - 232, dl = Math.hypot(dx, dy); b.look = [dx / dl, dy / dl];
    return { cam, c, b, bl: { x: bx, y: by, s: g.br / (66 * cam.zoom), hx: tp[0], hy: tp[1] }, pose: Math.floor((1 - g.k) * 36 + 1e-6) };
  }
  const SFX = {
    book_gust: { prompt: 'a short gust of wind whooshing past, soft and airy, no music, no speech', dur: 1.6 }, book_pat: { prompt: 'two gentle soft pats on a shoulder, cartoon, no music, no speech', dur: .8 },
    book_trot: { prompt: 'cartoon quick little footsteps trotting over grass, ten light springy hops, no music, no speech', dur: 2.7 }, book_bump: { prompt: 'cartoon bump into a cardboard wall, soft thud with a small boing, no music, no speech', dur: 1 },
    book_brush: { prompt: 'a small paint brush swished through the air, short soft whoosh, no music, no speech', dur: .5 }, book_hop: { prompt: 'cartoon small jump, short springy boing, no music, no speech', dur: .5 },
    book_land: { prompt: 'soft cartoon landing thud on grass, no music, no speech', dur: .5 }, book_windup: { prompt: 'cartoon wind-up before a punch, rising stretchy creak, no music, no speech', dur: .7 },
    book_whoosh: { prompt: 'soft airy whoosh of a fast camera move, no music, no speech', dur: .7 }, book_twinkle: { prompt: 'a soft sparkling twinkle of wonder, gentle and short, no speech', dur: 1.2 },
    book_steps: { prompt: 'three quick small footsteps running over grass, cartoon, no music, no speech', dur: .7 }, book_squeak: { prompt: 'a rubber balloon squeaking softly as a hand takes its string, short, no music, no speech', dur: .5 },
    book_hug: { prompt: 'a soft warm hug, gentle cloth whump, cartoon, no music, no speech', dur: .6 }, book_tug: { prompt: 'two quick cartoon tugs on a sleeve, soft stretchy pulls, no music, no speech', dur: .7 },
    book_paper: { prompt: 'a sheet of paper pulled out and held up, crisp paper rustle, no music, no speech', dur: 1 } };
  return { cl, k, mix, eio, out, inn, hit, N, q15, track, herm, talk, C0, B0, limb, armTip, boyHand, fxAt, seen, paper, mount, frame, glideState, CLIFF, SFX, SKIN, INK, WHITE, RED, YEL };
})();

(() => {
  const { k, mix, eio, out, hit, N, q15, track, herm, talk, C0, B0, limb, fxAt, seen, SKIN, INK, WHITE, RED, YEL } = BOOK, T0 = 2.45, HOP = 4 / 15;   // he sets off at T0 and trots in hops of four poses
  function clawd(t, S) {
    const M = S.marks, [, l1, l3] = S.lines, T1 = M.cliff, c = C0({ x: mix(-20, -70, eio(k(t, .95, 1.25))), look: [.5, 1], mouth: 'o' });
    if (t >= .95 && t < 2.2) { const p = eio(k(t, 1.1, 1.35)) * (1 - eio(k(t, 2, 2.2))); c.look = [-1, -.1]; c.mouth = 'smile'; c.armL = p * (.75 + .16 * Math.sin((t - 1.35) * 21) * k(t, 1.35, 1.45)); c.lenL = mix(52, 110, p); c.legs = .3 * Math.sin(Math.PI * k(t, .95, 1.25)); }   // steps to the boy, pats his shoulder
    if (t >= 2.2) { c.look = [1, .5]; c.mouth = 'flat'; c.brow = .7; c.sq = .22 * Math.sin(Math.PI * k(t, 2.2, T0)); }
    if (t >= T0 && t < T1) { const n = (t - T0) / HOP, s = Math.sin(Math.PI * (n % 1)); c.x = mix(-70, 1150, k(t, T0, T1)); c.y = 52 * s; c.legs = .6 * s * (Math.floor(n) % 2 ? 1 : -1); c.rot = -.07; c.armL = c.armR = .25 + .45 * s; c.sq = .14 * Math.pow(1 - s, 4) - .05 * s; c.look = [1, .7]; }
    if (t >= T1) { const r = out(k(t, T1, T1 + .4)); c.sq = -.34 * hit(t, T1, 5, 10); c.x = 1150 - 25 * r - .8 * c.sq * 164 * (1 - r); c.rot = .13 * hit(t, T1, 6, 20); c.brow = 0; c.eyes = t < T1 + .5 ? 0 : 1; c.mouth = 'o'; c.look = [.6, 1]; }   // the bump: flat against the cliff, then back
    if (t >= T1 + .6 && t < l1.t0) { const p = Math.sin(Math.PI * k(t, T1 + .62, T1 + 1.1)); c.sq += -.09 * p + .1 * Math.sin(Math.PI * k(t, T1 + 1.1, T1 + 1.3)); c.armR = 1.25 * p; c.lenR = 52 + 24 * p; if (t > T1 + 1.1) c.mouth = 'flat'; }   // reaches up the wall: no use
    if (t >= l1.t0 + .1) { const w = l1.words; c.mouth = 'flat'; c.look = t >= l1.t0 + w[3][1] && t < l1.t0 + w[4][2] + .25 ? [.5, 1] : [-1, .15]; if (Math.abs(t - l1.t0 - 2.6) < .05) c.eyes = 0; }   // listens; looks up when the old man points
    if (t >= l3.t0 - .1) { const h = k(t, l3.t0, l3.t0 + .32), s = Math.sin(Math.PI * h); c.brow = 1; c.sq = .16 * Math.sin(Math.PI * k(t, l3.t0 - .1, l3.t0)) - .1 * s + .26 * hit(t, l3.t0 + .32, 9, 26); c.y = 64 * s; c.armL = c.armR = .5 * s;
      c.mouth = talk(t, l3) ? 'o' : 'flat'; c.look = t < l3.t0 + .7 ? [-1, .2] : [.8, .9]; }   // "Of course I can.": a determined hop
    if (t >= M.out) { const p = out(k(t, M.out, M.out + .33)); c.x -= 25 * p - (t > M.out + .33 ? 2.5 * (Math.round(t * 15) % 2 ? 1 : -1) : 0); c.rot = .15 * p; c.sq = .1 * p; c.armR = 1.1 * p; c.lenR = 52 - 14 * p; c.armL = -.3 * p; c.look = [1, .4]; c.mouth = 'flat'; }   // the arm goes back for the punch
    return c;
  }
  function boy(t) {
    const b = B0({ x: -310 });
    if (t < .95) { const h = Math.sin(Math.PI * k(t, .2, .55)); b.y = 46 * h; b.armR = 2.8; b.armL = -2.5 + .3 * h; b.look = [.6, 1]; b.mouth = 'o'; b.sq = .12 * Math.sin(Math.PI * k(t, .05, .2)) + .14 * hit(t, .55, 9, 26); b.legL = -.25 * h; b.legR = .25 * h; }   // jumps after it
    else if (t < 2.2) { const d = eio(k(t, .95, 1.3)); b.armR = mix(2.8, .12, d); b.armL = mix(-2.5, -.12, d); b.look = t > 1.9 ? [1, .1] : [.3, -1]; b.mouth = 'sad'; b.lean = -.1 * d; b.sq = t < 2 ? .05 * Math.max(0, Math.sin((t - 1.35) * 21 + 1.2)) * k(t, 1.35, 1.45) : 0; }
    else { b.look = [1, .3]; b.mouth = t > 2.5 ? 'smile' : 'sad'; if (t > 2.6) b.armR = 2.6 + .3 * Math.sin(t * 16); }   // waves him off
    return b;
  }
  const BAL = [[0, 160, 770], [.6, 172, 800], [2.5, 610, 1010], [5, 1270, 1215], [6.3, 1420, 1570], [7.5, 1420, 1580]];   // the wind takes it over the meadow and over the edge of the cliff
  function balloon(t) { const [x, y] = herm(t, BAL), vx = (herm(t + .05, BAL)[0] - herm(t - .05, BAL)[0]) * 10, lag = Math.max(-55, Math.min(55, vx * .12)), bx = x + 5 * Math.sin(t * 1.7), by = y + 5 * Math.sin(t * 2.3); return { x: bx, y: by, hx: bx - 8 - lag, hy: by - 262 + Math.abs(lag) * .5 }; }
  function oldman(t, S) {   // arm: the angle of the brush arm (1.3 = at the canvas, 2.6 = up the cliff)
    const M = S.marks, l = S.lines[1], w = l.words, a = i => l.t0 + w[i][1], z = i => l.t0 + w[i][2], o = { arm: 1.32 + .09 * Math.sin(t * 5), open: 0, head: 0, dot: t > M.cliff + .95 };
    if (t >= M.cliff) { const up = eio(k(t, a(2), a(3))) * (1 - eio(k(t, z(6) + .2, a(7)))); o.open = talk(t, l) ? 1 : 0; o.head = -.14 * up - .07 * hit(t, M.cliff, 5, 16);
      o.arm = t < l.t0 - .05 ? mix(1.95, 1.1, eio(k(t, M.cliff + .35, M.cliff + .95))) : track(t, [[a(2), 1.1], [a(3), 2.6], [z(6) + .2, 2.6], [a(7), 1.2], [a(11), 1.75], [z(11), 1.75], [z(11) + .5, 1.32]])[0] + .12 * hit(t, a(4), 8, 30) + (t >= a(11) && t < z(11) ? .28 * Math.sin((t - a(11)) * 16) : 0); }
    return o;
  }
  const ARM = o => limb(10, -182, o.arm, 76, 22, '#5FA39B', `<rect x="-4" y="78" width="8" height="54" rx="3" fill="#8A5A3C"/><ellipse cx="0" cy="136" rx="7" ry="11" fill="${RED}"/><circle cx="0" cy="76" r="13" fill="${SKIN}"/>`);
  const oldmanG = o => `<g transform="translate(716 ${N(45 - 5 * o.open)}) scale(1.14)"><rect x="-40" y="-72" width="80" height="14" rx="6" fill="#8A5A3C"/><rect x="-34" y="-60" width="10" height="60" rx="4" fill="#8A5A3C"/><rect x="24" y="-60" width="10" height="60" rx="4" fill="#8A5A3C"/>
    ${limb(18, -86, 1.45, 62, 28, '#6B5B4B', '')}${limb(76, -80, .06, 72, 24, '#6B5B4B', '<ellipse cx="10" cy="72" rx="26" ry="13" fill="#5B4636"/>')}
    <rect x="-46" y="-208" width="88" height="142" rx="36" fill="#5FA39B"/><circle cx="-14" cy="-110" r="8" fill="${YEL}"/><circle cx="12" cy="-96" r="6" fill="#FF8FB1"/><circle cx="-22" cy="-88" r="5" fill="#2F7FC2"/>
    ${o.arm > 2 ? ARM(o) : ''}<g transform="rotate(${(o.head * 57.3).toFixed(2)} 4 -205)"><circle cx="-24" cy="-240" r="11" fill="#EDB588"/><circle cx="6" cy="-242" r="42" fill="${SKIN}"/><ellipse cx="0" cy="-277" rx="54" ry="22" fill="#5B6FA8"/><circle cx="6" cy="-300" r="7" fill="#5B6FA8"/>
      <circle cx="30" cy="-246" r="5.5" fill="${INK}"/><rect x="14" y="-266" width="32" height="10" rx="5" fill="${WHITE}" transform="rotate(-8 30 -261)"/><circle cx="22" cy="-226" r="9" fill="#FF9E80" opacity=".7"/>
      <g transform="translate(14 -218) rotate(${N(o.open * 4)}) scale(1 ${(1 + .1 * o.open).toFixed(2)}) translate(-14 218)"><path d="M-36 -236 Q-46 -150 14 -104 Q64 -150 54 -222 Q34 -206 12 -214 Q-10 -204 -36 -236Z" fill="${WHITE}"/></g>
      <ellipse cx="34" cy="-211" rx="9" ry="${N(2.5 + 7 * o.open)}" fill="${INK}"/><ellipse cx="22" cy="-221" rx="16" ry="8" fill="${WHITE}" transform="rotate(-12 22 -221)"/><ellipse cx="46" cy="-220" rx="13" ry="7" fill="${WHITE}" transform="rotate(14 46 -220)"/><circle cx="50" cy="-233" r="14" fill="#F2A98A"/></g>
    ${o.arm <= 2 ? ARM(o) : ''}</g>`;
  const easelG = dot => `<g transform="translate(868 40)"><path d="M-52 0 L-6 -262 M52 0 L6 -262 M0 -262 L18 -24" stroke="#8A5A3C" stroke-width="12" stroke-linecap="round" fill="none"/><g transform="rotate(-2)"><rect x="-62" y="-246" width="124" height="150" fill="${WHITE}"/>
    <rect x="-54" y="-238" width="108" height="134" fill="#BCE5F1"/><path d="M10 -104 L12 -204 L54 -210 L54 -104Z" fill="#A9744B"/><rect x="-54" y="-128" width="108" height="24" fill="#7CC36E"/><circle cx="-34" cy="-214" r="9" fill="${YEL}"/>${dot ? `<circle cx="-12" cy="-196" r="9" fill="${RED}"/>` : ''}</g><rect x="-68" y="-100" width="136" height="12" rx="5" fill="#6B4226"/></g>`;
  const WIND = [[.4, -60, 820, 1], [.62, 40, 700, .8], [.9, -150, 930, 1.1], [1.25, 120, 860, .9], [1.6, 260, 760, 1], [2.9, 420, 600, 1], [3.5, 760, 700, .9], [4.1, 1000, 640, 1]];   // crayon gusts: [from, x, y, size]
  const windG = t => WIND.filter(([a]) => t >= a && t < a + .9).map(([a, x, y, s]) => { const q = (t - a) / .9; return `<path pathLength="100" d="M0 0 c60 -34 110 24 170 0 s84 -46 60 -74 s-54 8 -28 36" transform="translate(${N(x + 260 * q)} ${-y}) scale(${s})" stroke="${WHITE}" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="46 200" stroke-dashoffset="${N(46 - 146 * q)}" opacity="${N(Math.sin(Math.PI * q))}"/>`; }).join('');
  function camera(u, S) {
    const M = S.marks, cX = mix(-70, 1150, k(u, T0, M.cliff)), e = eio(k(u, M.out, S.dur));   // slow drift, then it runs with him, settles at the cliff (leaning to whoever speaks), and tilts up to the balloon
    let cx = mix(30 * eio(k(u, 0, 2.4)), cX + mix(90, -20, eio(k(u, 4.3, 5.5))), eio(k(u, 2.3, 3.3))) - 45 * eio(k(u, 6.1, 7)) + 45 * eio(k(u, 10.6, 11.3)), cy = 370 + 60 * Math.sin(Math.PI * k(u, 5.3, 6.6));
    const zoom = 1 - .07 * Math.sin(Math.PI * k(u, 2.4, 5.4)) + .03 * k(u, 5.4, M.out); cx += 12 * hit(u, M.cliff, 10, 60); cy += 8 * hit(u, M.cliff + .02, 10, 73);
    return { cx: mix(cx, BAL[5][1] - 160, e), cy: mix(cy, BAL[5][2] - 400, e), zoom: mix(zoom, 1, e) };   // from S.dur on the balloon sits on FILM.ANCHOR
  }
  FILM.add({ id: 'book', async init(el) { this.h = await BOOK.mount(el); },
    draw(u, S) {
      const M = S.marks, t = q15(u), cam = camera(u, S), c = clawd(t, S), o = oldman(t, S), wind = windG(t), dust = [...Array(9)].map((_, i) => ['dust', T0 + (i + 1) * HOP, .3, mix(-70, 1150, (i + 1) * HOP / (M.cliff - T0)) - 30, 0, .45]);
      BOOK.frame(this.h, { pre: 'bk', cam, pose: Math.round(t * 15), c, b: boy(t), bl: balloon(t), shadows: `<ellipse cx="770" cy="52" rx="150" ry="16" fill="#3F8F5A" opacity=".5"/>`,
        fx: fxAt(t, [...dust, ['dust', .55, .35, -310, 0, .5], ['star', M.cliff, .3, 1296, 150], ['dust', M.cliff, .45, 1270, 0], ['dust', S.lines[2].t0 + .32, .4, c.x, 0, .7]]),
        others: seen(cam, 790, 100, 320) ? easelG(o.dot) + oldmanG(o) : '', top: L => wind ? L(1, wind, 'cray') : '' });
    },
    glide(g) { BOOK.frame(this.h, { pre: 'bk', ...BOOK.glideState(g) }); },
    sfx: BOOK.SFX, amb: { prompt: 'a sunny meadow in the morning, light breeze in the grass, a few small birds, no music, no speech', gain: -22 },
    cues(S) { const M = S.marks, [, l1, l3] = S.lines; return [['book_gust', .45], ['book_pat', 1.38, -6], ['book_trot', T0, -3], ['book_bump', M.cliff], ['book_brush', l1.t0 + l1.words[3][1], -8], ['book_hop', l3.t0, -4], ['book_land', l3.t0 + .32, -5], ['book_windup', M.out], ['book_whoosh', M.out + .1, -6]]; }
  });
})();
