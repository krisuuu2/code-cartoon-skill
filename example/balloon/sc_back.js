// balloon/sc_back.js: F2 "Home", the picture book again. It is drawn with BOOK, the cut-paper kit of sc_book.js, and the sheet the boy holds up is BALLOON_DRAWING of sc_drawing.js.
// It starts on BOOK.glideState(FILM.glidePose(1)), the very frame the finale ends on (so the cut in is invisible), and ends with the sheet filling the frame exactly as sc_drawing.js draws it at u = 0.
(() => {
  const SW = 196, SH = SW * 16 / 9;   // the sheet in world units, as tall and narrow as the frame
  const tug = (t, M) => { const q = (t - M.show - .18) / .28; return q > 0 && q < 2 ? Math.pow(Math.sin(Math.PI * q), 2) : 0; };   // the boy pulls Clawd's arm twice

  function clawd(t, S, G) {
    const { C0, k, mix, eio, inn, hit, talk } = BOOK, M = S.marks, [, , l3, l4] = S.lines, c = C0({ ...G.c, look: [...G.c.look] }), H1 = M.give + 2.82, UP = M.show + 1.55;
    c.y = G.c.y * (1 - inn(k(t, 0, .2))); c.legs = G.c.legs * (1 - k(t, 0, .2)); c.sq = .22 * hit(t, .2, 8, 24); if (t >= .2) c.mouth = 'o';   // touches down
    c.armL = mix(G.c.armL, 1.15, eio(k(t, .3, .9))); c.lenL = mix(G.c.lenL, 66, eio(k(t, .3, .9)));
    if (t >= .55 && t < 1.75) { const p = eio(k(t, .6, .9)) * (1 - eio(k(t, 1.5, 1.75))); c.look = [1, .25]; c.armR = p * (.95 + .14 * Math.sin(t * 16)); c.lenR = 52 + 12 * p; c.pop = 1 + .45 * Math.exp(-(t - .55) * 9); }   // "all of that was me": looks at one arm,
    else if (t >= 1.75 && t < 2.6) { c.look = [-1, .7]; c.armL += .16 * Math.sin((t - 1.75) * 15); }                                                                                                                  // at the other,
    else if (t >= 2.6 && t < 3.2) { c.look = [0, -1]; c.legs = .4 * Math.sin((t - 2.6) * 21); }                                                                                                                        // at his feet,
    else if (t >= 3.2) { const a = mix(2.6, .5, eio(k(t, 3.2, 3.85))); c.look = [Math.cos(a), Math.sin(a)]; c.mouth = 'smile'; c.sq += .1 * Math.sin(Math.PI * k(t, 3.4, 3.75)); }                                       // and all around
    if (t >= M.give) { const g = eio(k(t, M.give + .1, M.give + .65)), bk = eio(k(t, M.give + .97, M.give + 1.27)); c.look = [-1, -.1]; c.armL = mix(1.15, .35, g) * (1 - bk); c.lenL = mix(mix(66, 84, g), 52, bk); }   // holds the string out to the boy
    if (t >= M.give + 1.4) { c.mouth = 'grin'; c.look = [-1, .2 + .5 * Math.sin(Math.PI * k(t, M.give + 1.45, M.give + 1.95))]; c.sq += .1 * hit(t, M.give + 1.95, 9, 26); }
    if (t >= H1 && t < M.show) { c.eyes = 2; c.mouth = 'smile'; c.sq += .14 * hit(t, H1, 8, 22); c.rot = .05 * eio(k(t, H1, H1 + .3)) + .02 * Math.sin((t - H1) * 2.4); c.armL = -.55; c.lenL = 74; }   // the hug
    if (t >= M.show) { const p = tug(t, M), ln = eio(k(t, M.show + 1.3, M.show + 1.7)); c.mouth = t < M.show + .8 ? 'o' : 'smile'; c.look = t < UP - .25 ? [-1, -.25] : [-.85, .75]; c.armL = -.2 * p; c.lenL = 52 + 36 * p; c.rot = .09 * p + .15 * ln; c.x -= 14 * p + 46 * ln;
      if (t >= UP - .15) c.pop = 1 + .4 * Math.exp(-(t - UP + .15) * 9); }   // tugged, then he leans in to look at the drawing
    if (t >= l3.t0 + .1 && t < l3.t0 + 1) { const s = Math.abs(Math.sin((t - l3.t0 - .1) * Math.PI / .3)); c.eyes = 2; c.mouth = 'grin'; c.sq += .07 * s; c.y = 7 * s; }   // the soft laugh: three small bounces
    else if (t >= l3.t0 + 1 && t < l3.t0 + l3.dur + .1) { c.look = [-1, -.25]; c.mouth = talk(t, l3) ? 'o' : 'smile'; }   // "Until now."
    if (t >= l4.t0) { const n = Math.sin(Math.PI * k(t, l4.t0 + .08, l4.t0 + .48)) + .5 * Math.sin(Math.PI * k(t, l4.t0 + .52, l4.t0 + .8)); c.sq += .15 * n; c.eyes = n > .6 ? 0 : 1; c.look = t < l4.t0 + .95 ? [-1, -.25] : [-.85, .75]; c.mouth = talk(t, l4) ? 'o' : 'smile'; }   // "Of course.": a nod
    return c;
  }
  function boy(t, S, G) {
    const { B0, k, mix, eio, hit } = BOOK, M = S.marks, b = B0({ ...G.b, look: [...G.b.look] }), RUN = M.give + .6, HA = M.give + .67, HB = M.give + .97, J0 = M.give + 1.3, J1 = J0 + .15, J2 = J1 + .5, H0 = M.give + 2.3, H1 = H0 + .52, SB = M.show + .75, PO = M.show + 1, UP = M.show + 1.55;
    if (t < 1) { const h = Math.sin(Math.PI * k(t, .25, .55)), h2 = Math.sin(Math.PI * k(t, .6, .9)); b.y = 36 * h + 26 * h2; b.sq = .12 * hit(t, .55, 9, 26) + .1 * hit(t, .9, 9, 26); b.legL = -.2 * (h + h2); b.legR = -b.legL; }   // two hops: he is back!
    else if (t < M.give) { const d = eio(k(t, 1, 1.4)); b.armR = mix(G.b.armR, .5, d); b.armL = mix(G.b.armL, -.5, d); b.look = [1, .15]; b.mouth = 'smile'; b.lean = -.1 * eio(k(t, M.give - .25, M.give)); b.sq = .1 * Math.sin(Math.PI * k(t, M.give - .25, M.give)); }
    else if (t < J0) { const r = k(t, M.give, RUN), s = (t - M.give) * 23.6; b.x = mix(-310, -172, 1 - Math.pow(1 - r, 1.6)); b.look = [1, .2]; b.armR = .4;   // runs over and takes the string
      if (r < 1) { b.y = 24 * Math.abs(Math.sin(s)); b.legL = .8 * Math.sin(s); b.legR = -b.legL; b.armR = .7 * Math.sin(s + Math.PI); b.lean = -.14; }
      b.armL = t < HB ? mix(-.5, 1.06, eio(k(t, RUN - .25, HA))) : mix(1.06, 3.68, eio(k(t, HB, HB + .33))); }
    else if (t < H0) { const v = k(t, J1, J2), s = Math.sin(Math.PI * v); b.x = -172; b.armL = 3.68; b.look = [.6, .8]; b.sq = .2 * Math.sin(Math.PI * k(t, J0, J1)) - .08 * s + .22 * hit(t, J2, 9, 26);   // jumps for joy
      b.y = 170 * 4 * v * (1 - v) + 46 * Math.sin(Math.PI * k(t, J2 + .1, J2 + .34)); b.armR = t > J0 + .08 ? 2.8 + .25 * Math.sin(t * 30) * s : .4; b.legL = -.55 * s; b.legR = .55 * s; b.rot = .08 * Math.sin(v * 6.2832); }
    else if (t < M.show) { const r = eio(k(t, H0, H1)), s = (t - H0) * 23.6; b.x = mix(-172, -92, r); b.armL = 3.68; b.lean = -.28 * r; b.armR = mix(2.8, 1.75, r); b.look = [1, 0]; b.mouth = 'smile'; b.sq = .08 * hit(t, H1, 8, 22);   // and hugs him
      if (t < H1) { b.legL = .6 * Math.sin(s); b.legR = -b.legL; b.y = 14 * Math.abs(Math.sin(s)); } }
    else { const p = tug(t, M), g0 = eio(k(t, M.show, M.show + .16)), sb = eio(k(t, SB, SB + .32)); b.x = mix(mix(-92, -185, g0) - 12 * p, -300, sb); b.armL = mix(3.68, 3.4, sb); b.lean = mix(-.28, 0, g0) + .16 * p; b.look = [1, .35];   // tugs his arm, steps back,
      b.armR = t < SB ? mix(1.75, .55, g0) - .15 * p : t < PO ? mix(.55, -.6, eio(k(t, SB, PO))) : mix(-.6, 2.45, eio(k(t, PO, UP)));                                                                                // pulls the sheet from behind his back, holds it up
      b.y = t >= SB && t < SB + .32 ? 16 * Math.abs(Math.sin((t - SB) * 19.6)) : 0; b.sq = .12 * hit(t, UP, 9, 26); }
    return b;
  }

  FILM.add({ id: 'back', enter: 'cut',
    async init(el) {   // in the film both files are loaded already; alone (?scene=back) it fetches them
      const need = (ok, src) => ok || new Promise(r => { const s = document.createElement('script'); s.src = src; s.onload = r; document.head.append(s); });
      await need(window.BOOK, 'balloon/sc_book.js'); await need(window.BALLOON_DRAWING, 'balloon/sc_drawing.js'); this.h = await BOOK.mount(el);
    },
    draw(u, S) {
      const { q15, k, mix, eio, hit, track, armTip, boyHand, fxAt } = BOOK, M = S.marks, G = this.G || (this.G = BOOK.glideState(FILM.glidePose(1))), t = q15(u), c = clawd(t, S, G), b = boy(t, S, G);
      // the balloon: in Clawd's hand, then in the boy's; it follows the hand a little late
      const HA = M.give + .67, HB = M.give + .97, hold = tt => { const a = armTip(clawd(tt, S, G), -1), z = boyHand(boy(tt, S, G), -1), w = eio(k(tt, HA, HB)); return [mix(a[0], z[0], w), mix(a[1], z[1], w)]; };
      const h0 = hold(t), h1 = hold(t - .1), w0 = eio(k(t, .2, 1.1)), bl = { s: G.bl.s, hx: h0[0], hy: h0[1], x: mix(G.bl.x, h1[0] + 12 * Math.sin(t * 3.1), w0), y: mix(G.bl.y, h1[1] + 222 + 6 * Math.sin(t * 2.3), w0) };
      // the sheet: out from behind his back, turned to us, up; e = the push into it at the end
      const PO = M.show + 1, UP = M.show + 1.55, po = eio(k(t, PO, UP)), e = eio(k(u, M.out, S.dur - .05)), hd = boyHand(b, 1), sc = mix(.25, 1, po), fl = mix(.2, 1, po);
      const sheet = { x: hd[0] + (SW / 2 - 30) * sc * fl, y: hd[1] + (SH / 2 - 10) * sc, rot: mix(-.5, .1, po) * (1 - e) };
      let [cx, cy, zoom] = track(u, [[0, G.cam.cx, G.cam.cy, G.cam.zoom], [.25, G.cam.cx, G.cam.cy, G.cam.zoom], [3.7, 66, 300, 1.12], [M.give + .7, -30, 290, 1.12], [M.give + 1.3, -40, 295, 1.1], [M.give + 2.82, -15, 262, 1.3], [M.show, -12, 258, 1.36], [M.show + 1.65, -115, 295, 1.48], [M.out, -118, 300, 1.52]]);
      cy += .25 * boy(u, S, G).y + 9 * hit(u, .2, 10, 60);
      const cam = { cx: mix(cx, sheet.x, e), cy: mix(cy, sheet.y, e), zoom: Math.exp(mix(Math.log(zoom), Math.log(1080 / SW), e)) }, d = po > 0 ? BALLOON_DRAWING(u - S.dur, { pre: 'bb', life: e }) : null;
      const sheetG = L => L(1, `<g transform="translate(${sheet.x.toFixed(2)} ${(-sheet.y).toFixed(2)}) rotate(${(sheet.rot * 57.2958).toFixed(2)}) scale(${(sc * fl * SW / 1080).toFixed(5)} ${(sc * SW / 1080).toFixed(5)}) translate(-540 -960)">${d.body}</g>`, 'sheet');
      BOOK.frame(this.h, { pre: 'bb', cam, pose: Math.round(t * 15), c, b, bl, tex: 1 - e, defs: d ? BOOK.paper('bbsheet', 5, (10 * (1 - e)).toFixed(2), 1) + d.defs : '', under: d && po < .35 ? sheetG : null, front: d && po >= .35 ? sheetG : null,
        fx: fxAt(t, [['dust', .2, .4, G.c.x, 0, .8], ['dust', M.give + 1.95, .4, -172, 0, .6], ['heart', M.give + 3.05, .9, -42, 300]]) });
    },
    glide() {},
    get sfx() { return BOOK.SFX; }, amb: { prompt: 'a sunny meadow in the morning, light breeze in the grass, a few small birds, no music, no speech', gain: -22 },
    cues(S) { const M = S.marks; return [['book_land', .2, -5], ['book_twinkle', .6, -8], ['book_steps', M.give, -4], ['book_squeak', M.give + .8, -8], ['book_hop', M.give + 1.45, -4], ['book_land', M.give + 1.95, -5], ['book_hug', M.give + 2.82, -5], ['book_tug', M.show + .18, -5], ['book_paper', M.show + 1], ['book_whoosh', M.out, -6]]; }
  });
})();
