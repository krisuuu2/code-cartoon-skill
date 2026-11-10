// balloon/sc_bauhaus.js: scene 8 of THE BALLOON, BAUHAUS POSTER (after styles8/s8_bauhaus.js). Only HTML + CSS: absolutely positioned divs, border-radius, clip-path,
// multiply blending. The divs are built once in init; draw(u) only writes inline transform / opacity / size. No CSS animation, no transition.
// The idea is reduction: an over-decorated poster is cleared down to a triangle, a bar, a quarter circle, a ring, the type, Clawd and ONE red circle.
// The bar is a see-saw on the triangle: Clawd jumps for the circle, bumps the bar from below, and the circle rolls down it to the peg, which stands exactly on FILM.ANCHOR.
(() => {
  const K = '#151515', CREAM = '#F0E7D4', RED = '#E03A1E', YEL = '#F2B807', BLUE = '#1F4FA3', U = 22, BASE = 1050, CX = 190, RB = 64, ARMH = 86, TH = 24 * Math.PI / 180, D1 = 137, D0 = D1 - TAU * RB;
  const A = { x: 700, y: 560 }, P = [A.x - D1 * Math.cos(TH) - ARMH * Math.sin(TH), A.y - D1 * Math.sin(TH) + ARMH * Math.cos(TH)];   // the pivot: with the bar at 24 degrees and the ball against the peg, the ball is on the anchor
  const onBar = (d, th) => [P[0] + d * Math.cos(th) + ARMH * Math.sin(th), P[1] + d * Math.sin(th) - ARMH * Math.cos(th)];
  const seg = (u, a, b) => clamp((u - a) / (b - a)), mix = (a, b, k) => a + (b - a) * k, ei = k => k * k * k, eo = k => 1 - Math.pow(1 - k, 5), back = k => k <= 0 ? 0 : k >= 1 ? 1 : 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2);
  const pulse = (u, t, d = 8) => u < t ? 0 : Math.exp(-(u - t) * d), deg = r => r * 180 / Math.PI, n1 = v => (+v).toFixed(2);
  const zig = n => { const a = [], b = []; for (let i = 0; i <= n; i++) { a.push(`${n1(i / n * 100)}% ${i % 2 ? 0 : 60}%`); b.unshift(`${n1(i / n * 100)}% ${i % 2 ? 40 : 100}%`); } return `polygon(${a.concat(b).join(',')})`; };
  const teeth = n => { const a = ['0 0', '100% 0']; for (let i = n; i > 0; i--) a.push(`${n1(i / n * 100)}% 0`, `${n1((i - .5) / n * 100)}% 100%`); return `polygon(${a.join(',')})`; };
  // the decoration: [css, exit (l r u d = slides off that side, s = shrinks to nothing), base transform, html, multiply]
  const DECO = [
    [`left:80px;top:172px;width:920px;height:40px;background:${K};clip-path:${zig(23)}`, 'u'],
    [`left:300px;top:216px;font:400 150px Bangers;color:${RED}`, 'u', 'rotate(-10deg)', 'SALE!'],
    [`left:760px;top:215px;width:240px;height:172px;background-image:radial-gradient(circle,${K} 6px,transparent 6.6px);background-size:34px 34px`, 'r'],
    [`left:210px;top:350px;width:860px;height:860px;border:5px solid ${K};border-radius:50%`, 's'],
    [`left:805px;top:415px;width:110px;height:110px;background:#C8351C;border-radius:50%`, 'r', '', '', 1],
    [`left:518px;top:388px;width:84px;height:84px;background:#EE7A5C;border-radius:50%`, 'u', '', '', 1],
    [`left:560px;top:230px;width:150px;height:44px;background:repeating-linear-gradient(90deg,${BLUE} 0 44px,transparent 44px 53px)`, 'u'],
    [`left:440px;top:520px;width:96px;height:96px;background:#D9482B`, 'l', 'rotate(18deg)', '', 1],
    [`left:896px;top:526px;width:68px;height:68px;background:${RED};border-radius:50%`, 'r', '', '', 1],
    [`left:40px;top:470px;width:150px;height:190px;background:repeating-linear-gradient(90deg,${BLUE} 0 14px,transparent 14px 30px)`, 'l'],
    [`left:850px;top:610px;width:190px;height:170px;background:repeating-linear-gradient(45deg,${K} 0 12px,transparent 12px 28px)`, 'r'],
    [`left:520px;top:668px;width:160px;height:80px;background:${RED};border-radius:160px 160px 0 0`, 's', '', '', 1],
    [`left:742px;top:660px;width:92px;height:92px;border:16px solid #C8351C;border-radius:50%`, 's'],
    [`left:330px;top:590px;width:220px;height:220px;border-radius:50%;background:repeating-radial-gradient(circle,${K} 0 8px,transparent 8px 30px)`, 's'],
    [`left:420px;top:742px;font:400 46px Chango;white-space:nowrap`, 'r', 'rotate(6deg)', 'MORE IS MORE'],
    [`left:936px;top:820px;width:110px;height:110px;background:#C8351C;clip-path:polygon(50% 0,100% 100%,0 100%)`, 'r', '', '', 1],
    [`left:330px;top:870px;width:270px;height:40px;background:${K};clip-path:${teeth(6)}`, 'l'],
    [`left:330px;top:960px;font:700 28px 'JetBrains Mono';white-space:nowrap`, 'l', '', 'very_fancy.css'],
    [`left:-120px;top:1140px;width:1320px;height:6px;background:${K}`, 'l', 'rotate(-24deg)'], [`left:-120px;top:1112px;width:1320px;height:6px;background:${K}`, 'r', 'rotate(-24deg)'],
    [`left:800px;top:1150px;width:150px;height:150px;background:${YEL};border-radius:50%`, 's', '', '', 1],
    [`left:330px;top:1150px;font:800 76px 'Baloo 2';white-space:nowrap`, 'd', 'rotate(-5deg)', 'ornament'],
    [`left:880px;top:1214px;width:160px;height:160px;background:conic-gradient(${K} 25%,transparent 0 50%,${K} 0 75%,transparent 0) 0 0/40px 40px`, 'r'],
    [`left:330px;top:1270px;width:272px;height:102px;background-image:radial-gradient(circle,${RED} 9px,transparent 9.6px);background-size:34px 34px`, 'd'],
    [`left:640px;top:1250px;font:900 76px Jost;letter-spacing:12px`, 'd', '', '+++'],
    [`left:80px;top:1300px;font:400 40px 'Press Start 2P';color:${BLUE}`, 'l', '', 'NEW!'],
    [`left:560px;top:296px;font:400 64px Limelight`, 'r', 'rotate(4deg)', 'Deluxe'],
    [`left:80px;top:1372px;width:920px;height:40px;background:${RED};clip-path:${zig(23)}`, 'd']];
  const TRI = [[[80, 210], [510, 210], [80, 640]], [[P[0], P[1] + 22], [P[0] + 215, BASE], [P[0] - 215, BASE]]];   // the yellow triangle: the corner of the still -> the fulcrum of the see-saw
  const CLEAN = { red: 99, q: { tri: 1, bar: 1, ring: 1, type: 1, blue: 1 }, th: TH, peg: 1, fl: {}, cur: null, ticks: [] };

  FILM.add({ id: 'bauhaus',
    init(el) {
      el.innerHTML = `<div id="bh"><style>
        #bh { position: absolute; inset: 0; background: ${CREAM}; font-family: Jost, sans-serif; color: ${K}; overflow: hidden }
        #bh div, #bh p { position: absolute; margin: 0; box-sizing: border-box } #bh .m { mix-blend-mode: multiply } #bh .s { font-weight: 500; font-size: 34px; letter-spacing: 3px }
      </style></div>`;
      const root = el.firstChild, mk = (css, html = '', cls = '', to = root) => { const e = document.createElement('div'); e.style.cssText = css; e.innerHTML = html; if (cls) e.className = cls; to.append(e); return e; }, e = this.e = {};
      mk('left:80px;top:92px', 'exhibition of moving shapes', 's'); mk('right:80px;top:92px', 'no. 8', 's'); mk(`left:80px;top:150px;width:920px;height:6px;background:${K}`);
      mk('left:30px;top:1040px;font-size:24px;letter-spacing:6px;white-space:nowrap;transform-origin:0 0;transform:rotate(-90deg)', 'BAUHAUS · HTML + CSS · NO CANVAS · NO IMAGES', 's');
      e.tri = mk(`left:0;top:0;width:1080px;height:1920px;background:${YEL}`, '', 'm');
      e.blue = mk(`background:${BLUE};border-radius:100% 0 0 0`, `<div style="right:28px;bottom:36px;font:900 84px Jost;color:${CREAM};letter-spacing:-2px">2026</div>`, 'm');
      e.deco = DECO.map(([css, exit, base = '', html = '', m]) => { const d = mk(css, html, m ? 'm' : ''); d.exit = exit; d.base = base; return d; });
      e.ring = mk(`left:0;top:0;width:200px;height:200px;border:30px solid ${K};border-radius:50%`);
      e.saw = mk(`left:${n1(P[0])}px;top:${n1(P[1])}px;width:0;height:0`); e.bar = mk(`top:-22px;height:44px;background:${K}`, '', '', e.saw); e.peg = mk(`left:${D1 + RB}px;top:-92px;width:16px;height:72px;background:${K};transform-origin:50% 100%`, '', '', e.saw);
      e.type = mk('left:76px;top:1690px;font-weight:900;font-size:104px;line-height:94px;letter-spacing:-3px;white-space:nowrap;transform-origin:0 0', 'form follows<br>code');
      e.floor = mk(`left:80px;top:${BASE}px;width:920px;height:6px;background:${K};transform-origin:0 50%`);
      // the curator: a triangle, a circle, two rings, two lines
      e.cur = mk('left:0;top:0;width:0;height:0'); const c = (css, to = e.cur) => mk(css, '', '', to);
      e.armL = c(`left:${CX - 34}px;top:${BASE - 216}px;width:170px;height:12px;background:${K};transform-origin:0 50%`);
      c(`left:${CX - 112}px;top:${BASE - 300}px;width:224px;height:300px;background:${BLUE};clip-path:polygon(50% 0,100% 100%,0 100%)`);
      e.armR = c(`left:${CX + 34}px;top:${BASE - 216}px;width:200px;height:12px;background:${K};transform-origin:0 50%`);
      e.head = c(`left:${CX}px;top:${BASE - 292}px;width:0;height:0`);
      c(`left:-84px;top:-150px;width:60px;height:60px;background:${K};border-radius:50%`, e.head); c(`left:-60px;top:-124px;width:132px;height:132px;background:${YEL};border-radius:50%`, e.head);
      c(`left:-12px;top:-92px;width:52px;height:52px;border:8px solid ${K};border-radius:50%`, e.head); c(`left:44px;top:-92px;width:52px;height:52px;border:8px solid ${K};border-radius:50%`, e.head); c(`left:36px;top:-70px;width:12px;height:8px;background:${K}`, e.head);
      e.mouth = c(`left:22px;top:-26px;width:36px;height:7px;background:${K}`, e.head);
      // Clawd: the 16 x 10 grid in black blocks, origin at the middle of his feet
      e.cw = mk('left:0;top:0;width:0;height:0'); const g = ([a, b, w, h], col = K) => c(`left:${(a - 8) * U}px;top:${(b - 10) * U}px;width:${w * U}px;height:${h * U}px;background:${col}`, e.cw);
      g([2, 0, 12, 8]); g([0, 4, 2, 2]); e.arm = g([14, 4, 2, 2]); e.legs = [[3, 8, 1, 2], [5, 8, 1, 2], [10, 8, 1, 2], [12, 8, 1, 2]].map(q => g(q)); e.eyes = CLAWD.eyes.map(q => g(q, CREAM));
      e.str = mk(`left:0;top:0;height:4px;background:${K};transform-origin:0 50%`);
      e.ball = mk(`left:-${RB}px;top:-${RB}px;width:${RB * 2}px;height:${RB * 2}px;background:${RED};border-radius:50%`, `<div style="left:20px;top:22px;width:18px;height:18px;background:${CREAM};border-radius:50%"></div>`);
      e.ticks = [0, 1, 2, 3].map(() => mk(`left:0;top:-3px;width:34px;height:6px;background:${K};transform-origin:0 50%`));
    },
    // st: red = seconds since the reduction began; q = how far each kept shape has snapped to its clean place; th = tilt of the see-saw; fl = flash scales; cur = the curator or null
    render(st) {
      const e = this.e, q = st.q, T = 'transform';
      e.deco.forEach((d, i) => { const k = seg(st.red, .08 + i * .022, .34 + i * .022), s = d.style; if (k >= 1) { s.display = 'none'; return; } s.display = 'block';
        s[T] = d.exit === 's' ? `${d.base} scale(${n1(1 - back(1 - k) > 0 ? back(1 - k) : 0)})` : `translate(${n1({ l: -1400, r: 1400 }[d.exit] * ei(k) || 0)}px,${n1({ u: -1500, d: 1100 }[d.exit] * ei(k) || 0)}px) ${d.base}`; });
      const tp = TRI[0].map((p, i) => [mix(p[0], TRI[1][i][0], q.tri), mix(p[1], TRI[1][i][1], q.tri)]), tc = [(tp[0][0] + tp[1][0] + tp[2][0]) / 3, (tp[0][1] + tp[1][1] + tp[2][1]) / 3];
      e.tri.style.clipPath = `polygon(${tp.map(p => `${n1(p[0])}px ${n1(p[1])}px`).join(',')})`; e.tri.style.transformOrigin = `${n1(tc[0])}px ${n1(tc[1])}px`; e.tri.style[T] = `scale(${n1(1 + .16 * (st.fl.tri || 0))})`; e.tri.style.opacity = st.fl.tri > .75 ? .35 : 1;
      const bs = mix(560, 480, q.blue); e.blue.style.cssText += `;left:${n1(1080 - bs)}px;top:${n1(1920 - bs)}px;width:${n1(bs)}px;height:${n1(bs)}px`;
      e.ring.style[T] = `translate(${n1(mix(80, 800, q.ring))}px,${n1(mix(1075, 230, q.ring))}px)`;
      const bw = mix(1320, 1000, q.bar); e.bar.style.left = n1(-bw / 2) + 'px'; e.bar.style.width = n1(bw) + 'px'; e.bar.style[T] = `scaleY(${n1(1 + .9 * (st.fl.bar || 0))})`; e.bar.style.opacity = st.fl.bar > .75 ? .35 : 1;
      e.saw.style[T] = `translate(${n1(mix(540 - P[0], 0, q.bar))}px,${n1(mix(1212 - P[1], 0, q.bar))}px) rotate(${n1(mix(-24, deg(st.th), q.bar))}deg)`; e.peg.style[T] = `scaleY(${n1(st.peg)})`;
      e.type.style[T] = `translateY(${n1(26 * (1 - q.type))}px) rotate(${n1(3 * (1 - q.type))}deg) scale(${n1(1 - .08 * (1 - q.type))})`; e.floor.style[T] = `scaleX(${n1(clamp(q.type))})`;
      const cu = st.cur; e.cur.style.display = cu ? 'block' : 'none';
      if (cu) { e.cur.style.transformOrigin = `${CX}px ${BASE}px`; e.cur.style[T] = `translate(${n1(cu.x)}px,${n1(-cu.hop)}px) rotate(${n1(cu.tilt)}deg)`; e.head.style[T] = `translateY(${n1(-cu.nod)}px) rotate(${n1(cu.head)}deg)`;
        e.armR.style[T] = `rotate(${n1(cu.aR)}deg)`; e.armL.style[T] = `rotate(${n1(cu.aL)}deg)`; e.mouth.style.height = (cu.open ? 22 : 7) + 'px'; }
      const c = st.c; e.cw.style[T] = c.hang ? `translate(${n1(c.x)}px,${n1(c.y)}px) rotate(${n1(deg(c.rot))}deg) scale(${n1(c.s)}) translateY(${5 * U}px)` : `translate(${n1(c.x)}px,${n1(BASE - c.lift)}px) scale(${n1(c.sx)},${n1(c.sy)})`;
      e.arm.style.top = (c.hang ? -9 : -6) * U + 'px'; e.arm.style.height = (c.hang ? 5 : 2) * U + 'px';
      e.legs.forEach((l, i) => { l.style[T] = `translateY(${n1(-(c.legs ? c.legs[i % 2] : 0))}px)`; }); e.eyes.forEach(y => { y.style[T] = `translate(${n1(c.look[0])}px,${n1(c.look[1])}px) scaleY(${c.blink ? .12 : 1})`; });
      const b = st.ball; e.ball.style[T] = `translate(${n1(b.x)}px,${n1(b.y)}px) rotate(${n1(deg(b.rot || 0))}deg) scale(${n1(b.s || 1)})`;
      const sg = st.str; e.str.style.display = sg ? 'block' : 'none'; if (sg) { const dx = sg[2] - sg[0], dy = sg[3] - sg[1]; e.str.style.width = n1(Math.hypot(dx, dy)) + 'px'; e.str.style[T] = `translate(${n1(sg[0])}px,${n1(sg[1])}px) rotate(${n1(deg(Math.atan2(dy, dx)))}deg)`; }
      e.ticks.forEach((t, i) => { const k = st.ticks[i]; t.style.display = k ? 'block' : 'none'; if (k) t.style[T] = `translate(${n1(k[0])}px,${n1(k[1])}px) rotate(${k[2]}deg) translateX(${n1(14 + 46 * eo(k[3]))}px) scaleX(${n1(1 - k[3] * .8)})`; });
    },
    draw(u, S) {
      const [L0, L1] = S.lines, RD = S.marks.reduce, RL = S.marks.roll, W = i => L0.t0 + L0.words[i][1], Z = i => L0.t0 + L0.words[i][2], r = u - RD, t = u - RL;
      const snap = a => back(seg(r, a, a + .24)), st = { red: r, q: { blue: snap(.42), ring: snap(.5), tri: snap(.56), bar: snap(.64), type: snap(.8) }, peg: snap(.86), fl: { tri: pulse(u, W(6)), bar: pulse(u, W(8)) }, ticks: [] };
      // the see-saw tips when Clawd bumps it (t = 0); the ball accelerates down it, knocks on the peg at t = .8 and is at rest on the anchor from S.dur on
      const hitT = t - .8, calm = clamp((S.dur - u) / .25);
      st.th = t < 0 ? 0 : TH * (1 - Math.exp(-t * 14) * Math.cos(t * 20)) + (hitT > 0 ? .014 * Math.exp(-hitT * 12) * Math.sin(hitT * 30) * calm : 0);
      const d = t < 0 ? D0 : hitT < 0 ? mix(D0, D1, Math.pow(t / .8, 2)) : D1 - 22 * Math.exp(-hitT * 7) * Math.abs(Math.sin(hitT * 10)) * calm, bp = onBar(d, st.th), kb = back(seg(r, .72, .96));
      st.ball = { x: mix(A.x, bp[0], kb), y: mix(A.y, bp[1], kb), rot: (d - D0) / RB, s: 1 + .3 * pulse(u, W(4)) };
      const sk = 1 - eo(seg(r, .5, .68)); st.str = sk > 0 ? [A.x, A.y + RB - 2, A.x + 24 * sk, A.y + RB + 186 * sk] : null;
      if (t >= 0 && t < .2) st.ticks = [[232, 612, 168, t / .2], [232, 612, 12, t / .2]]; if (hitT >= 0 && hitT < .2) st.ticks = [[A.x + 70, A.y - 20, -70, hitT / .2], [A.x + 70, A.y - 20, -35, hitT / .2], [A.x + 70, A.y - 20, 0, hitT / .2]];
      // the curator: slides in, jerks and tilts on every word, points at the circle, the triangle and the line, then leaves with the rest of the decoration
      if (r < .95) { const nw = L0.words.length; let wi = -1; for (let i = 0; i < nw; i++) if (u >= W(i)) wi = i; const jerk = wi < 0 ? pulse(u, .5, 7) : pulse(u, W(wi), 7), sgn = wi % 2 ? -1 : 1;
        const aim = (x, y) => deg(Math.atan2(y - (BASE - 210), x - (CX + 34))), KEY = [[0, 75, 105], [W(0) - .05, -60, -120], [W(1), -35, -150], [W(2), -78, -102], [Z(2) + .15, 75, 105], [W(3) - .02, aim(A.x, A.y), 105], [W(5) - .02, aim(223, 353), 105], [W(7) - .02, aim(440, 1256), 105], [W(9) - .05, aim(640, 930), 130], [L0.t0 + L0.dur + .12, 75, 105]];
        let i = 0; while (i < KEY.length - 1 && u >= KEY[i + 1][0]) i++; const k = eo(seg(u, KEY[i][0], KEY[i][0] + .16)), pv = KEY[Math.max(0, i - 1)], shake = u > W(2) && u < Z(2) ? 9 * Math.sin(u * 38) : 0;
        st.cur = { x: mix(-340, 0, eo(seg(u, .12, .5))) - 520 * ei(seg(r, .55, .95)), hop: 26 * pulse(u, W(0), 9) + 18 * pulse(u, W(9), 9), tilt: sgn * 5 * jerk + 7 * pulse(u, RD, 6), head: -sgn * 10 * jerk, nod: 10 * jerk,
          aR: mix(pv[1], KEY[i][1], k) + shake, aL: mix(pv[2], KEY[i][2], k) - shake, open: L0.words.some(([, a, b]) => u >= L0.t0 + a && u < L0.t0 + b) && Math.floor(u * 15 + 1e-6) % 3 < 2 }; }
      // Clawd: listens, stamps (that clears the poster), looks at the one red circle, walks under it in grid steps, crouches, jumps and bumps the bar
      const c = st.c = { x: 800, lift: 0, sx: 1, sy: 1, look: [-7, 0], legs: [0, 0] }, T0 = L1.t0 + .75, T1 = RL - .62, N = 12, sp = (T1 - T0) / N;
      if (u >= W(4)) c.look = [-4, -7]; if (u >= W(6)) c.look = [-7, -6]; if (u >= W(8)) c.look = [-5, 7]; if (u >= W(9)) c.look = [-7, 0]; c.blink = Math.abs(u - Z(12) - .22) < .06;
      const stamp = Math.sin(Math.PI * seg(r, -.16, .12)); if (r > -.16 && r < .12) { c.sy = 1 - .22 * stamp; c.sx = 1 + .12 * stamp; } if (r >= .12) c.look = [0, 0];
      if (u >= L1.t0 + .3) c.look = [-7, -7];
      if (u >= T0) { const n = Math.min(N, (u - T0) / sp), i = Math.floor(n), f = eo(seg(n - i, 0, .7)), up = n < N ? Math.sin(Math.PI * seg(n - i, 0, .7)) : 0; c.x = 800 - (568 / N) * (i + (n < N ? f : 0)); c.legs = i % 2 ? [0, 12 * up] : [12 * up, 0]; c.lift = 5 * up; }
      if (u >= T1) { const cr = Math.sin(Math.PI / 2 * seg(u, T1 + .08, T1 + .2)) * (1 - seg(u, RL - .2, RL - .14)), up = Math.pow(seg(u, RL - .2, RL), .7), fall = seg(t, .04, .4); c.x = 232;
        c.sy = 1 - .3 * cr + .12 * Math.sin(Math.PI * up) * (t < 0) - .2 * pulse(t, 0, 22) * (t >= 0) - .22 * pulse(t, .4, 12) * Math.cos((t - .4) * 18) * (t >= .4); c.sx = 1 + .16 * cr + .1 * pulse(t, .4, 12) * (t >= .4);
        c.lift = t < 0 ? (BASE - 220 - P[1] - 22) * up : (BASE - 220 - P[1] - 22) * (1 - fall * fall); if (t > .1) c.look = [7, clamp(-7 + 14 * seg(t, .1, .8), -7, 0)]; }
      c.blink = c.blink || Math.abs(u - S.dur - .28) < .06;
      this.render(st);
    },
    glide(g) {   // the clean poster at rest; block Clawd hangs by a thin black line under the red circle
      const s = g.w / (16 * U), co = Math.cos(g.rot), si = Math.sin(g.rot), hx = 7 * U * s, hy = -4 * U * s;   // his raised hand, from the middle of his body
      this.render({ ...CLEAN, c: { hang: 1, x: g.x, y: g.y, rot: g.rot, s, look: [0, -6], legs: [6 * Math.sin(g.k * 25), -6 * Math.sin(g.k * 25)] }, ball: { x: g.bx, y: g.by, rot: g.k * 2 },
        str: [g.bx, g.by + g.br - 2, g.x + hx * co - hy * si, g.y + hx * si + hy * co] });
    },
    sfx: {
      bh_slap: { prompt: 'one sharp slap of a wooden ruler on a desk, dry, close, no music, no speech', dur: .5 },
      bh_sweep: { prompt: 'many small wooden blocks and paper shapes swept quickly off a table, a fast dry clatter sliding away, no music, no speech', dur: 1.1 },
      bh_snap: { prompt: 'one wooden building block snapping firmly into place, short dry clack, no music, no speech', dur: .5 },
      bh_steps: { prompt: 'twelve even dry taps of a wooden block walking on a wooden table, steady mechanical rhythm, no music, no speech', dur: 2.8 },
      bh_knock: { prompt: 'a wooden block knocking a wooden plank from below, one hollow knock, the plank tips, no music, no speech', dur: .6 },
      bh_roll: { prompt: 'a wooden ball rolling down a wooden plank, speeding up, smooth rumble, no music, no speech', dur: .9 },
      bh_stop: { prompt: 'a wooden ball hitting a wooden peg and stopping, one bright clack and a tiny second tap, no music, no speech', dur: .6 } },
    amb: { prompt: 'a quiet empty art gallery room, soft air, a faint distant footstep and a creak of parquet, no music, no speech', gain: -28 },
    cues(S) { const L0 = S.lines[0], L1 = S.lines[1], RD = S.marks.reduce, RL = S.marks.roll, W = i => +(L0.t0 + L0.words[i][1]).toFixed(2), f = v => +v.toFixed(2);
      return [['bh_snap', .5, -8], ['bh_slap', W(0), -5], ['bh_slap', W(4), -8], ['bh_slap', W(6), -8], ['bh_slap', W(8), -8], ['bh_snap', f(RD - .02), -3], ['bh_sweep', f(RD + .1), -3], ['bh_snap', f(RD + .62), -6], ['bh_snap', f(RD + .8), -5], ['bh_snap', f(RD + .98), -4],
        ['bh_steps', f(L1.t0 + .75), -9], ['bh_knock', f(RL), -2], ['bh_roll', f(RL + .05), -4], ['bh_stop', f(RL + .8), -3], ['bh_snap', f(RL + .4), -10]]; }
  });
})();
