// balloon/sc_ascii.js: scene 7 of THE BALLOON, ASCII (the phosphor terminal of styles8/s7_ascii.js). No canvas: the frame is one <pre> of 80 x 87 characters.
// A gate of '#', '|' and '=' asks for a password; a tiny software raymarcher shoots one ray per character cell at a 3D Clawd; the balloon is the only red thing.
// The tube (scanlines, glow, vignette) is CSS. Everything is rebuilt from u on every frame.
(() => {
  const COLS = 80, ROWS = 87, CW = 13.2, CH = 22, PX = 12, RAMP = ' .:-=+*#%@', LX = [-.9, -.5, .5, .9];
  const SPAN = '<span style="color:#FF4B33;text-shadow:0 0 5px rgba(255,75,51,.9),0 0 20px rgba(255,75,51,.5)">';
  const ss = (a, b, v) => { v = clamp((v - a) / (b - a)); return v * v * (3 - 2 * v); }, bump = k => k > 0 && k < 1 ? Math.sin(Math.PI * k) : 0;
  const FONT = { A: ['.XX.', 'X..X', 'XXXX', 'X..X', 'X..X'], C: ['.XXX', 'X...', 'X...', 'X...', '.XXX'], E: ['XXXX', 'X...', 'XXX.', 'X...', 'XXXX'], S: ['.XXX', 'X...', '.XX.', '...X', 'XXX.'], G: ['.XXX', 'X...', 'X.XX', 'X..X', '.XXX'],
    R: ['XXX.', 'X..X', 'XXX.', 'X.X.', 'X..X'], N: ['X..X', 'XX.X', 'X.XX', 'X..X', 'X..X'], T: ['XXXX', '.XX.', '.XX.', '.XX.', '.XX.'], D: ['XXX.', 'X..X', 'X..X', 'X..X', 'XXX.'] };
  let pre, G, RED, HIT;
  const clear = () => { G = [...Array(ROWS)].map(() => Array(COLS).fill(' ')); RED = new Uint8Array(COLS * ROWS); HIT = new Uint8Array(COLS * ROWS); };
  const put = (r, c, s, red) => { if (r < 0 || r >= ROWS) return; for (let i = 0; i < s.length; i++) { const k = c + i; if (k >= 0 && k < COLS) { G[r][k] = s[i]; RED[r * COLS + k] = red ? 1 : 0; } } };
  const mid = (r, s) => put(r, 40 - (s.length >> 1), s);
  function flush() {
    let h = ''; for (let r = 0; r < ROWS; r++) { let on = 0; for (let c = 0; c < COLS; c++) { const f = RED[r * COLS + c]; if (f !== on) { h += f ? SPAN : '</span>'; on = f; } const ch = G[r][c]; h += ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '&' ? '&amp;' : ch; } h += on ? '</span>\n' : '\n'; }
    pre.innerHTML = h;
  }
  const star = (r, c) => { const h = h2(c * 1.37 + 3, r * 2.71 + 1); return h > .988 ? '*' : h > .972 ? '.' : h > .966 ? '+' : ' '; };
  const big = (r, word, rows) => { const c0 = 40 - ((word.length * 9 - 1) >> 1); [...word].forEach((ch, i) => FONT[ch].forEach((row, j) => { if (j < rows) [...row].forEach((p, k) => { if (p === 'X') put(r + j, c0 + i * 9 + k * 2, '##'); }); })); };
  function balloon(bx, by, wig) {   // a disc of red O's, radius 64 px, with one clear cell around it, and a string of | and ' below
    let rb = 0; for (let r = Math.floor((by - 90) / CH); r <= Math.ceil((by + 90) / CH); r++) for (let c = Math.floor((bx - 100 - PX) / CW); c <= Math.ceil((bx + 100 - PX) / CW); c++) { const d = Math.hypot(PX + c * CW + CW / 2 - bx, r * CH + CH / 2 - by); if (d < 68) { put(r, c, 'O', 1); rb = Math.max(rb, r); } else if (d < 84) put(r, c, ' '); }
    const c = Math.round((bx - PX - CW / 2) / CW); if (wig != null) for (let i = 1; i <= 7; i++) put(rb + i, c, (i + wig) % 2 ? '|' : "'", 1); return [rb, c];
  }
  // Clawd: the raymarcher of the still, one ray per cell in a window around (cx, cy). hop and sq (squash from the feet) for a bob, ph for walking legs, roll for the glide, arm for the raised arm
  function clawd({ cx, cy, F, yaw, pit, roll = 0, hop = 0, sq = 1, ph = null, arm = 0, pool = 1 }) {
    const f = [-Math.sin(yaw) * Math.cos(pit), -Math.sin(pit), -Math.cos(yaw) * Math.cos(pit)], rt = [Math.cos(yaw), 0, -Math.sin(yaw)], up = [rt[1] * f[2] - rt[2] * f[1], rt[2] * f[0] - rt[0] * f[2], rt[0] * f[1] - rt[1] * f[0]];
    const ro = [-f[0] * 8, -f[1] * 8 - .1, -f[2] * 8], Lv = [0, 1, 2].map(i => -rt[i] * .45 + up[i] * .7 - f[i] * .55), ll = Math.hypot(...Lv), Ld = Lv.map(v => v / ll), ca = Math.cos(roll), sa = Math.sin(roll), ks = Math.min(1, sq);
    const lift = LX.map((_, i) => ph == null ? 0 : Math.max(0, Math.sin(ph + (i & 1) * Math.PI)) * .16), loc = y => -1 + (y + 1 - hop) / sq;
    const box = (x, y, z, bx, by, hx, hy, hz) => { const a = Math.abs(x - bx) - hx, b = Math.abs(y - by) - hy, c = Math.abs(z) - hz; return Math.hypot(Math.max(a, 0), Math.max(b, 0), Math.max(c, 0)) + Math.min(Math.max(a, b, c), 0); };
    const sd = (x, y, z) => { y = loc(y); let d = Math.min(box(x, y, z, 0, .2, 1.2, .8, .45), box(x, y, z, 0, 0, 1.6, .2, .3)); for (let i = 0; i < 4; i++) d = Math.min(d, box(x, y, z, LX[i], -.8 + lift[i], .1, .2, .3)); if (arm) d = Math.min(d, box(x, y, z, 1.4, .9, .2, .9, .3)); return d * ks; };
    const c0 = Math.max(0, Math.floor((cx - F * .38 - PX) / CW)), c1 = Math.min(COLS - 1, Math.ceil((cx + F * .38 - PX) / CW)), r0 = Math.max(0, Math.floor((cy - F * .36) / CH)), r1 = Math.min(ROWS - 1, Math.ceil((cy + F * .3) / CH)); let hits = 0; const dots = [];
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const dx = PX + c * CW + CW / 2 - cx, dy = r * CH + CH / 2 - cy, sx = dx * ca + dy * sa, sy = dx * sa - dy * ca; let d = [0, 1, 2].map(i => f[i] * F + rt[i] * sx + up[i] * sy); const dl = Math.hypot(...d); d = d.map(v => v / dl);
      let tt = 4, hit = false; for (let i = 0; i < 48 && tt < 14; i++) { const q = sd(ro[0] + d[0] * tt, ro[1] + d[1] * tt, ro[2] + d[2] * tt); if (q < .004) { hit = true; break; } tt += q; }
      if (hit) { const p = [0, 1, 2].map(i => ro[i] + d[i] * tt), e = .003, n = [sd(p[0] + e, p[1], p[2]) - sd(p[0] - e, p[1], p[2]), sd(p[0], p[1] + e, p[2]) - sd(p[0], p[1] - e, p[2]), sd(p[0], p[1], p[2] + e) - sd(p[0], p[1], p[2] - e)], nl = Math.hypot(...n) || 1;
        const eye = n[2] / nl > .9 && Math.abs(Math.abs(p[0]) - .7) < .1 && Math.abs(loc(p[1]) - .4) < .2, bri = .3 + .75 * Math.max(0, (n[0] * Ld[0] + n[1] * Ld[1] + n[2] * Ld[2]) / nl) + p[1] * .05;
        put(r, c, eye ? ' ' : RAMP[clamp(Math.round(bri * 9), 1, 9)]); HIT[r * COLS + c] = 1; hits++; }
      else if (pool && d[1] < 0) { const tf = (-1 - ro[1]) / d[1], qx = ro[0] + d[0] * tf, qz = ro[2] + d[2] * tf, rr = Math.hypot(qx, qz); if (rr < 1.9 || (rr < 2.35 && (c + r) & 1)) dots.push([r, c]); }   // the floor is a small pool of light
    }
    dots.forEach(([r, c]) => { if (G[r][c] === ' ') put(r, c, '.'); });
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (!HIT[r * COLS + c] && ((c > 0 && HIT[r * COLS + c - 1]) || (c < COLS - 1 && HIT[r * COLS + c + 1]) || (r > 0 && HIT[(r - 1) * COLS + c]) || (r < ROWS - 1 && HIT[(r + 1) * COLS + c]))) put(r, c, ' ');   // one clear cell around him
    const proj = p => { const v = [0, 1, 2].map(i => p[i] - ro[i]), z = v[0] * f[0] + v[1] * f[1] + v[2] * f[2], sx = F * (v[0] * rt[0] + v[1] * rt[1] + v[2] * rt[2]) / z, sy = F * (v[0] * up[0] + v[1] * up[1] + v[2] * up[2]) / z; return [cx + sx * ca + sy * sa, cy + sx * sa - sy * ca]; };
    return { hits, proj };
  }
  function gate(u, TO) {   // a brick wall across the upper part of the frame, a sign over the opening, and a portcullis whose columns drop one by one from the middle outwards
    for (let r = 6; r <= 50; r++) for (let c = 0; c < COLS; c++) {
      if (c < 6 || c > 73) { const ch = r % 3 === 0 ? '=' : (c + ((r / 3 | 0) & 1) * 3) % 6 === 2 ? '|' : ' '; if (ch !== ' ') put(r, c, ch); }
      else if (c < 8 || c > 71 || r === 6 || r === 20 || (r > 20 && (c < 10 || c > 69))) put(r, c, '#');
      else if (r > 20 && r < 46) { const ch = star(r, c); if (ch !== ' ') put(r, c, ch); }
    }
    put(46, 10, '_'.repeat(60)); for (let r = 47; r <= 50; r++) { put(r, 39 - (r - 46) * 3, '.'); put(r, 40 + (r - 46) * 3, '.'); }   // the world beyond: a horizon and a road
    for (let c = 10; c <= 69; c++) { const t = u - TO - Math.abs(c - 39.5) * .013, drop = t > 0 ? Math.round(140 * t * t) : 0;
      for (let r = 21; r <= 50 - drop; r++) { const beam = r === 32 || r === 44 || r === 50, bar = c % 4 === 0; if (beam || bar) put(r + drop, c, beam ? (bar ? '#' : '=') : '|'); } }
  }

  FILM.add({ id: 'ascii',
    init(el) {
      el.style.background = '#020703';
      const mk = css => { const e = document.createElement('div'); e.style.cssText = 'position:absolute;inset:0;' + css; el.append(e); return e; };
      mk('background:radial-gradient(ellipse at 50% 48%,rgba(40,170,90,.2),transparent 62%)');
      pre = document.createElement('pre'); pre.style.cssText = `position:absolute;left:${PX}px;top:0;margin:0;font:700 22px/22px "JetBrains Mono",monospace;color:#56FF8E;white-space:pre;text-shadow:0 0 5px rgba(86,255,142,.8),0 0 20px rgba(86,255,142,.4)`; el.append(pre);
      mk('background:repeating-linear-gradient(0deg,rgba(0,0,0,.3) 0 2px,transparent 2px 4px)'); mk('background:radial-gradient(ellipse at center,transparent 52%,rgba(0,0,0,.8) 100%)');
    },
    draw(u, S) {
      const L1 = S.lines[0], L2 = S.lines[1], GR = S.marks.granted, TG = GR + .3, TO = TG + .2, TW = TG + .5, blink = Math.floor(u * 4) % 2 === 0, AN = FILM.ANCHOR;
      const typed = (l, n) => u < l.t0 + l.words[0][1] ? 0 : clamp(Math.floor((u - l.t0 - l.words[0][1]) / (l.words[0][2] - l.words[0][1]) * n) + 1, 0, n);
      clear();
      const cmd = './follow balloon --through gate.txt', n0 = Math.floor(clamp((u - .1) / .75) * cmd.length); put(2, 1, 'clawd@fable-5.2:~/balloon$ ' + cmd.slice(0, n0) + (n0 < cmd.length ? '█' : ''));
      if (u >= .95) put(4, 1, 'gate.txt: 60 x 30 bars. ' + (u < TG ? 'LOCKED.' : 'OPEN.'));
      gate(u, TO);
      // the sign: the terminal types its prompt while it speaks, Clawd's answer is typed while he speaks, a held breath, then the verdict in big letters
      if (u < TG) { const n1 = typed(L1, 9), n2 = n1 < 9 ? 0 : typed(L2, 6), s = '> ' + 'PASSWORD:'.slice(0, n1) + (n1 === 9 ? ' ' + 'please'.slice(0, n2) : '') + (u >= GR || blink ? '█' : ' ');
        mid(9, ':: G A T E ::'); put(13, 22, [...s].join(' ')); mid(17, '[ LOCKED ]'); }
      else { const rows = Math.floor((u - TG) / .18 * 11) + 1; big(8, 'ACCESS', Math.min(5, rows)); big(14, 'GRANTED', clamp(rows - 6, 0, 5)); }
      balloon(AN.x, AN.y, Math.floor(u * 3));
      // Clawd: still, one hop on "Please.", still again; when the bars have dropped he turns and walks in under the sign
      const tp = L2.t0 + L2.words[0][1], w = ss(TW, TW + 1.6, u), st = u > TW ? (u - TW) * 19 : null;
      const res = clawd({ cx: 440 + 90 * w, cy: 1150 - 130 * w, F: 1250 - 350 * w, yaw: .5 + Math.PI * ss(TW, TW + .6, u), pit: .34, hop: .3 * bump((u - tp) / .34) + (st == null ? 0 : .06 * Math.abs(Math.sin(st)) * ss(TW, TW + .2, u)), sq: 1 - .14 * bump((u - tp + .15) / .17) - .12 * bump((u - tp - .32) / .16), ph: st });
      put(81, 1, `${res.hits} cells hit · ramp "${RAMP.trim()}" · frame ${String(Math.round(u * 30)).padStart(4, '0')}`); put(83, 1, '0 images. 0 polygons. 1 font.');
      flush();
    },
    glide(g) {   // a sparse sky of characters, three clouds, a floor far below; everything snapped to the character grid
      clear(); const dr = Math.round(g.k * 8), snapX = v => PX + Math.round((v - PX) / CW) * CW;
      for (let r = 2; r < 68; r++) for (let c = 0; c < COLS; c++) { const ch = star(r + dr, c); if (ch !== ' ') put(r, c, ch); }
      [[12, 5], [34, 58], [52, 9]].forEach(([r, c]) => ['   .--.    ', ' .(    ).  ', '(___.__)__)'].forEach((s, j) => put(r + j - Math.round(g.k * 5), c, s)));
      put(70, 0, '_'.repeat(COLS)); for (let r = 71; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const p = 1 + (r - 70) * .45, v = (c - 39.5) / p; if (Math.abs(v / 4 - Math.round(v / 4)) * 4 * p < .5) put(r, c, '.'); }
      const res = clawd({ cx: snapX(g.x), cy: Math.round(g.y / CH) * CH, F: g.w * 2.5, yaw: .42, pit: .22, roll: g.rot, arm: 1, pool: 0 });
      const [rb, cb] = balloon(snapX(g.bx), Math.round((g.by - CH / 2) / CH) * CH + CH / 2), [hx, hy] = res.proj([1.4, 1.8, 0]), re = Math.floor(hy / CH), ce = Math.round((hx - PX - CW / 2) / CW);
      for (let r = rb + 1, pc = cb; r <= re; r++) { const c = Math.round(cb + (ce - cb) * (r - rb) / Math.max(1, re - rb)); if (!HIT[r * COLS + c]) put(r, c, c > pc ? '\\' : c < pc ? '/' : '|', 1); pc = c; }   // the string, to his raised arm
      flush();
    },
    sfx: {
      as_boot: { prompt: 'an old CRT computer monitor switching on, a soft thump and a short rising high whine, no music, no speech', dur: 1 },
      as_type: { prompt: 'a fast short burst of typing on an old mechanical computer keyboard, about ten dry key clicks, no music, no speech', dur: .7 },
      as_key: { prompt: 'one single key click on an old mechanical computer keyboard, dry and close, no music, no speech', dur: .5 },
      as_beep: { prompt: 'an old 1980s computer terminal beep, one short flat square-wave tone, no music, no speech', dur: .5 },
      as_ok: { prompt: 'an old computer access granted signal, two short rising square-wave beeps, no music, no speech', dur: .8 },
      as_gate: { prompt: 'a mechanical gate opened by electric relays: a fast clatter of relay clicks, then heavy metal bars dropping away one after another, no music, no speech', dur: 1.6 },
      as_step: { prompt: 'two small soft footsteps on a hollow metal floor, cartoon, no music, no speech', dur: .6 } },
    amb: { prompt: 'the steady low hum of an old CRT computer monitor with a faint high whine and a soft fan, no music, no speech', gain: -24 },
    cues(S) { const r = v => +v.toFixed(2), L1 = S.lines[0], L2 = S.lines[1], GR = S.marks.granted, a = L2.t0 + L2.words[0][1], b = L2.t0 + L2.words[0][2];
      const o = [['as_boot', .05, -10], ['as_type', .12, -12], ['as_beep', r(L1.t0), -8], ['as_type', r(L1.t0 + L1.words[0][1]), -9]];
      for (let i = 0; i < 6; i++) o.push(['as_key', r(a + (b - a) * i / 6), -7]);   // p l e a s e
      o.push(['as_ok', r(GR + .3), -5], ['as_gate', r(GR + .5), -4], ['as_step', r(GR + .85), -9], ['as_step', r(GR + 1.4), -11]); return o; }
  });
})();
