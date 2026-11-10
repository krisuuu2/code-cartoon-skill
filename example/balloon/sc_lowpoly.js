// balloon/sc_lowpoly.js: scene 5 of THE BALLOON, LOW-POLY (the floating islands of styles8/s5_lowpoly.js, grown into an archipelago). three.js: flat-shaded
// meshes with jittered vertices, an orthographic isometric camera, one warm sun with a soft shadow map. Voxel Clawd hops from island to island, rides on top of
// a hot-air balloon, a gust takes the red balloon, a faceted crow lands on his head and talks. At the end every edge lights up as a line (layer 1, drawn in
// extra passes) because the next world is made of lines only. Everything is a pure function of u: model(S) holds the paths, draw() poses the meshes.
(() => {
const A = FILM.ANCHOR, PPU = FH / 15, s = .185, V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }, eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, bump = x => x > 0 && x < 1 ? Math.sin(Math.PI * x) : 0;
const pulse = (L, u, w = .2) => L.words.reduce((m, [, a]) => Math.max(m, bump((u - L.t0 - a) / w)), 0);   // one bump per spoken word
const spring = t => t > 0 ? Math.exp(-5 * t) * Math.sin(12 * t) * 1.5 : 0, thud = t => t >= 0 ? Math.exp(-8 * t) * Math.cos(13 * t) : 0;
// the isometric frame: screen right on the ground, away from the camera, up, toward the camera, and the camera's own up
const RT = V(1, 0, -1).normalize(), BK = V(-1, 0, -1).normalize(), UP = V(0, 1, 0), CD = V(12, 10.5, 12), CN = CD.clone().normalize(), CU = V().crossVectors(RT, CN.clone().negate());
const W = (a, h, d = 0) => V().addScaledVector(RT, a).addScaledVector(UP, h).addScaledVector(BK, d);
const s2w = (T, z, x, y, dz = 0) => T.clone().addScaledVector(RT, (x - 540) / (PPU * z)).addScaledVector(CU, (960 - y) / (PPU * z)).addScaledVector(CN, dz);   // the world point drawn at screen (x, y) when the camera looks at T with zoom z
const ISL = [{ p: W(0, 0, 0), R: 2.3 }, { p: W(4.6, .5, .5), R: 1.55 }, { p: W(9, .1, -.3), R: 1.7 }, { p: W(21.6, 2.05, 0), R: 2.7 }], SID = [0, 1, 2, 4];   // the islands he stands on and their support ids (3 = the top of the hot-air balloon)
ISL.forEach(I => I.st = I.p.clone().addScaledVector(BK, -.35));
const HB0 = W(13.3, -1.95, -.2), HB1 = W(17.4, .3, -.1), HBTOP = 1.74;
const HOPS = [[.72, 1.22, 0, 1, 1.5], [1.4, 1.9, 1, 2, 1.5], [2.08, 2.6, 2, 3, 1.9], [3.5, 4.02, 3, 4, 1.7]];   // take-off, landing, from, to, height of the arc
const CROW0 = 4.52, CROW1 = 5.2, bob = (i, u) => .08 * Math.sin(u * .8 + i * 1.9);
const seg = (m, a, b) => { const d = b.clone().sub(a), l = d.length(); m.position.copy(a).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(UP, d.multiplyScalar(1 / l)); m.scale.set(1, l, 1); };

function model(S) {   // every path of the scene as a function of u
  const gu = S.marks.gust, out = S.marks.out;
  const dip = (i, u) => HOPS.reduce((a, h) => a - (h[3] === i ? (i === 3 ? .5 : .4) * spring(u - h[1]) : 0) - (h[2] === i ? .14 * spring(u - h[0]) : 0), 0);   // an island sinks under his weight and comes back
  const hbAt = (u, raw) => { const k = eio(clamp((u - 2.74) / .78)), g = clamp(u - gu, 0, 3), p = HB0.clone().lerp(HB1, k); p.y += .5 * ss(3.5, 4.4, u) + 2.5 * g; p.addScaledVector(RT, 14 * Math.pow(g, 1.6)).addScaledVector(BK, 4 * Math.min(g * 2, 1)); if (!raw) p.y += .1 * Math.sin(u * 1.1 + 2) + dip(3, u); return p; };
  const sup = (i, u, raw) => { if (i === 3) { const p = hbAt(u, raw); p.y += HBTOP; return p; } const p = ISL[i > 3 ? 3 : i].st.clone(); if (!raw) p.y += bob(i, u) + dip(i, u); return p; };
  const feet = (u, raw) => { let on = 0;
    for (const [t0, t1, a, b, H] of HOPS) { if (u >= t0 && u < t1) { const e = (u - t0) / (t1 - t0), p = sup(a, u, raw).lerp(sup(b, u, raw), e); if (!raw) p.y += H * 4 * e * (1 - e); return { p, e }; } if (u >= t1) on = b; }
    const p = sup(on, u, raw); if (on === 4) p.addScaledVector(RT, .35 * ss(0, .5, u - gu)); return { p, e: -1 }; };
  const follow = u => { const p = V(); [.08, .2, .32, .44].forEach(d => p.addScaledVector(feet(u - d, 1).p, .25)); return p; };   // the camera travels with him, a little late and without the bounces
  const zk = u => ss(4.5, 5.25, u), zd = u => 1 + .36 * zk(u);
  const Td = u => { const z = zd(u); return follow(u).addScaledVector(RT, -(400 + 140 * zk(u) - 540) / (PPU * z)).addScaledVector(CU, -(960 - 1290) / (PPU * z)); };   // his feet at screen (400..540, 1290)
  const balA = u => s2w(Td(u), 1, A.x + 40 * Math.sin(u * .9) * ss(.3, 1.5, u), A.y - 26 * ss(.4, 2, u) + 18 * Math.sin(u * 1.7) * ss(.3, 1.5, u), 5);   // the balloon floats ahead of him
  const B0 = balA(gu), Bend = B0.clone().addScaledVector(RT, 2.6).addScaledVector(CU, 6.6), Tend = Bend.clone().addScaledVector(RT, -(A.x - 540) / PPU).addScaledVector(CU, -(960 - A.y) / PPU).addScaledVector(CN, -5);
  const bal = u => { if (u <= gu) return balA(u); const g = u - gu, k = 1 - Math.pow(1 - clamp(g / 2.6), 3); return B0.clone().lerp(Bend, k).addScaledVector(CU, .025 * Math.sin(u * 2.2) * ss(2.6, 3.2, g)).addScaledVector(RT, .2 * Math.sin(g * 6) * (1 - k)); };
  const cam = u => { const ke = eio(clamp((u - out + .22) / (S.dur - .02 - out + .22))), z = zd(u); return { T: Td(u).lerp(Tend, ke), z: z + (1 - z) * ke }; };   // at the end the camera leaves him and finds the balloon
  return { gu, out, dip, hbAt, feet, bal, cam };
}

FILM.add({ id: 'lowpoly',
  init(el) {
    const r3 = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); r3.setPixelRatio(1); r3.setSize(FW, FH, false); r3.domElement.style.cssText = 'position:absolute;left:0;top:0'; el.append(r3.domElement);
    r3.shadowMap.enabled = true; r3.shadowMap.type = THREE.PCFSoftShadowMap; r3.localClippingEnabled = true;
    const sc = new THREE.Scene(), root = new THREE.Group(); sc.add(root);
    const bg = document.createElement('canvas'); bg.width = 270; bg.height = 480; const b = bg.getContext('2d'), gr = b.createLinearGradient(0, 0, 0, 480);
    gr.addColorStop(0, '#6FCBC8'); gr.addColorStop(.5, '#C4E9D8'); gr.addColorStop(1, '#FFE0BC'); b.fillStyle = gr; b.fillRect(0, 0, 270, 480); b.fillStyle = 'rgba(255,250,225,.5)'; b.beginPath(); b.arc(58, 70, 40, 0, 7); b.fill(); b.fillStyle = '#FFF6D8'; b.beginPath(); b.arc(58, 70, 27, 0, 7); b.fill();
    const tex = new THREE.CanvasTexture(bg); tex.colorSpace = THREE.SRGBColorSpace; sc.background = tex;
    const cut = new THREE.Plane(V(1, 0, 0), 0), LM = new THREE.LineBasicMaterial({ color: '#FFFBEA', transparent: true, clippingPlanes: [cut] });
    const jit = (geo, k) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), h = Math.round(x * 40) + Math.round(y * 40) * 3.7 + Math.round(z * 40) * 9.1; p.setXYZ(i, x + (h2(h, 1) - .5) * k, y + (h2(h, 2) - .5) * k * .5, z + (h2(h, 3) - .5) * k); } geo.computeVertexNormals(); return geo; };   // by position, so shared corners stay shared
    const add = (geo, col, x, y, z, o = {}) => { const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: col, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })); m.position.set(x, y, z); if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.s) m.scale.set(...(o.s.length ? o.s : [o.s, o.s, o.s])); m.castShadow = true; m.receiveShadow = !o.ns;
      if (!o.nl) { const l = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), LM); l.layers.set(1); m.add(l); }   // its edges, for the last half second
      (o.to || root).add(m); return m; };
    const Cy = (a, b, h, n) => new THREE.CylinderGeometry(a, b, h, n), Co = (r, h, n) => new THREE.ConeGeometry(r, h, n), Ico = (r, d = 0) => new THREE.IcosahedronGeometry(r, d), Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const L = (a, d) => [(a - d) * .7071, (-a - d) * .7071], trees = [];   // island coordinates: a = screen right, d = away from the camera
    const tree = (to, a, d, k, col) => { const [x, z] = L(a, d), t = new THREE.Group(); t.position.set(x, 0, z); to.add(t); trees.push(t);
      if (col) { add(Cy(.07, .1, .7, 5), '#7A5236', 0, .3, 0, { to: t }); add(jit(Ico(k), .14), col, 0, .6 + k * .7, 0, { to: t }); }
      else { add(Cy(.08, .11, .5, 5), '#7A5236', 0, .2 * k, 0, { to: t, s: k }); ['#2F8F6B', '#3BA57B', '#55C08D'].forEach((c, n) => add(jit(Co(.6 - n * .13, .85 - n * .08, 6), .08), c, 0, (.75 + n * .42) * k, 0, { to: t, s: k, ry: a + n })); } };
    const lump = (to, a, d, r, col) => { const [x, z] = L(a, d); add(jit(Ico(r), .06), col, x, r * .5, z, { to }); };
    const island = (R, deco) => { const g = new THREE.Group(); root.add(g); add(jit(Cy(R, R * .9, .5, 10), R * .05), '#8BCB6E', 0, -.25, 0, { to: g }); add(jit(Cy(R * .9, R * .58, R * .36, 10), R * .09), '#C98F62', 0, -.5 - R * .18, 0, { to: g }); add(jit(Co(R * .58, R * .88, 8), R * .1), '#A0705A', 0, -.5 - R * .8, 0, { to: g, rx: Math.PI }); deco(g); return g; };
    const ROCK = '#B9B4C7', BUSH = '#55C08D';
    const isl = [
      island(2.3, g => { tree(g, -1.25, 1.0, .95); tree(g, 1.5, 1.0, .7); lump(g, 1.75, -.7, .16, ROCK); lump(g, -1.8, -.2, .22, BUSH); }),
      island(1.55, g => { tree(g, .15, .9, .8); lump(g, -1.0, -.4, .14, ROCK); }),
      island(1.7, g => { tree(g, -.5, 1.0, .46, '#F6B04E'); lump(g, 1.2, -.3, .18, BUSH); lump(g, -1.2, .2, .13, ROCK); }),
      island(2.7, g => { tree(g, -1.35, 1.5, 1.15); tree(g, .25, 1.85, .9); tree(g, 1.55, 1.3, 1.3); tree(g, -2.05, .35, .5, '#F6C453'); lump(g, 2.1, -.5, .2, ROCK); lump(g, -1.9, -1.0, .15, ROCK); lump(g, 2.0, .5, .24, BUSH);
        const [x, z] = L(1.5, -1.1); add(Cy(.5, .5, .06, 9), '#5CC3E8', x, .02, z, { to: g }); })];
    // small islands in the distance; one has the house of the still
    const far = [[-2.6, 1.0, 9, 1.0], [10.5, -10, 6, 1.25], [14.8, 2.4, 10, .9], [25.5, -8.5, 7, 1.1], [-4, -8.5, 5, 1.0], [27.5, 5.2, 9, 1.0], [19, -11.5, 5, .9]].map(([a, h, d, R], i) => { const g = island(R, g => {
      if (i === 1) { const hs = new THREE.Group(); hs.position.set(-.1, 0, -.1); hs.rotation.y = Math.PI / 4 + .25; g.add(hs); add(Bx(.95, .7, .85), '#FFF4E0', 0, .35, 0, { to: hs }); add(Co(.92, .62, 4), '#E8674A', 0, 1.0, 0, { to: hs, ry: Math.PI / 4 }); add(Bx(.2, .36, .04), '#7A5236', -.15, .18, .44, { to: hs }); add(Bx(.14, .4, .14), '#D9C7B0', .25, 1.05, -.1, { to: hs }); }
      else i % 2 ? tree(g, 0, .1, .42, i % 4 === 1 ? '#F6B04E' : '#F28C5E') : tree(g, .1, .1, .75); }); g.userData.p = W(a, h, d); return g; });
    const rocks = [[2.9, -3.2, -1, .3], [6.8, -2.6, 1.5, .22], [11.6, -3.6, -.6, .26], [15.8, -4.4, 1, .2], [18.6, -2.2, -1.6, .28], [24.6, -1.2, .5, .22], [-3, -2.2, .6, .24]].map(([a, h, d, r]) => { const m = add(jit(Ico(r), .12), '#A0705A', 0, 0, 0); m.userData.p = W(a, h, d); return m; });
    // clouds with corners: above and behind the path, or below and in front of it
    const R = rng(52), clouds = [];
    const cloud = (a, h, d, k) => { const g = new THREE.Group(); root.add(g); [[0, 0, 0, .5], [.5, -.05, .1, .38], [-.5, -.08, -.05, .34], [.1, .22, 0, .3]].forEach(([x, y, z, r]) => add(Ico(r * k, 1), '#FFFFFF', x * k, y * k, z * k, { to: g, s: [1, .8, 1], ns: 1 })); g.userData = { p: W(a, h, d), sp: .6 + R() * .8 }; clouds.push(g); };
    cloud(3.1, 2.3, 6, 1.25); cloud(1.0, 4.0, 7, .9);
    for (let i = 0; i < 22; i++) { const a = -12 + i * 2.1 + R() * 1.5, lift = 2 * clamp(a / 22), hi = i % 3 !== 1, d = hi ? 4 + R() * 5 : -1.5 - R() * 2.5, up = hi ? 5.6 + R() * 4.5 : -4.2 - R() * 4.5; cloud(a, (up - d * .526) / .85 + lift, d, .8 + R() * .7); }
    // Clawd, in voxels; the right arm is its own box so that it can be raised
    const cl = new THREE.Group(), OR = FILM.ORANGE; cl.rotation.order = 'YXZ'; root.add(cl);
    add(Bx(12 * s, 8 * s, .8), OR, 0, 6 * s, 0, { to: cl }); add(Bx(2 * s, 2 * s, .56), OR, -7 * s, 5 * s, 0, { to: cl });
    const arm = new THREE.Group(); arm.position.set(6 * s, 5 * s, 0); cl.add(arm); add(Bx(2 * s, 2 * s, .56), OR, s, 0, 0, { to: arm });
    [3, 5, 10, 12].forEach(c => add(Bx(s, 2 * s, .4), OR, (c - 7.5) * s, s, 0, { to: cl }));
    CLAWD.eyes.forEach(([c, r, w, h]) => add(Bx(w * s, h * s, .04), '#2B1B14', (c - 8 + w / 2) * s, (10 - r - h / 2) * s, .4, { to: cl, nl: 1 }));
    // the crow: facets, a yellow beak with a jaw, two wings on pivots. It lives in Clawd's space because it lands on his head.
    const crow = new THREE.Group(), BLK = '#2A2838', BL2 = '#3A3852'; crow.rotation.order = 'YXZ'; cl.add(crow);
    add(jit(Ico(.3), .05), BLK, 0, .34, 0, { to: crow, s: [.9, .85, 1.35] }); add(Bx(.2, .04, .42), BLK, 0, .3, -.52, { to: crow, rx: -.35 });
    const head = new THREE.Group(); head.position.set(0, .52, .26); crow.add(head); add(jit(Ico(.2), .03), BL2, 0, .14, .06, { to: head }); add(Co(.07, .3, 4), '#F6B93B', 0, .15, .37, { to: head, rx: Math.PI / 2 });
    const jaw = new THREE.Group(); jaw.position.set(0, .1, .22); head.add(jaw); add(Co(.055, .22, 4), '#E09A2B', 0, 0, .11, { to: jaw, rx: Math.PI / 2 });
    [-1, 1].forEach(k => add(Bx(.03, .06, .06), '#FFF4E0', k * .19, .2, .12, { to: head, nl: 1 }));
    const wings = [-1, 1].map(k => { const w = new THREE.Group(); w.position.set(k * .22, .48, -.02); crow.add(w); add(Bx(.62, .035, .36), BL2, k * .31, 0, -.04, { to: w }); return w; });
    [-1, 1].forEach(k => add(Cy(.016, .016, .2, 4), '#F6B93B', k * .1, .1, 0, { to: crow, nl: 1 }));
    // the red balloon (radius .5 = 64 px) and its string
    const rb = new THREE.Group(); root.add(rb); add(Ico(.5, 1), FILM.RED, 0, 0, 0, { to: rb, s: [1, 1.08, 1] }); add(Co(.1, .14, 4), '#C8452A', 0, -.58, 0, { to: rb });
    const str = [0, 1, 2].map(() => add(Cy(.022, .022, 1, 4), '#FFF4E0', 0, 0, 0, { nl: 1, ns: 1 }));
    // the hot-air balloon: lavender, so that nobody takes it for the red one
    const hb = new THREE.Group(); root.add(hb); add(Ico(1.5, 1), '#9B86D6', 0, 0, 0, { to: hb, s: [1, 1.16, 1] }); add(Cy(1.535, 1.535, .38, 12), '#FFF4E0', 0, .08, 0, { to: hb }); add(Bx(.6, .46, .6), '#7A5236', 0, -2.62, 0, { to: hb });
    [[-.25, -.25], [.25, -.25], [-.25, .25], [.25, .25]].forEach(([x, z]) => add(Cy(.02, .02, 1.0, 4), '#5B4636', x, -2.0, z, { to: hb, nl: 1 }));
    const flame = new THREE.Group(); flame.position.y = -2.34; hb.add(flame); const fm = new THREE.Mesh(Co(.2, .6, 5), new THREE.MeshBasicMaterial({ color: '#FFC34D' })); fm.position.y = .3; flame.add(fm);
    // loose triangles for the gust
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute([-.5, 0, 0, .5, 0, 0, 0, .9, 0], 3)); lg.computeVertexNormals();
    const NL = 70, leaves = new THREE.InstancedMesh(lg, new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, flatShading: true }), NL), col = new THREE.Color(); leaves.frustumCulled = false;
    for (let i = 0; i < NL; i++) leaves.setColorAt(i, col.set(['#3BA57B', '#55C08D', '#8BCB6E', '#F6B04E', '#F28C5E'][i % 5])); root.add(leaves);
    const hemi = new THREE.HemisphereLight(0xffffff, 0xFFCFA0, 1.7), sun = new THREE.DirectionalLight(0xFFF2DC, 2.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 3; sun.shadow.bias = -.0006;
    Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 13, bottom: -13, near: 1, far: 45 }); sc.add(hemi, sun, sun.target);
    const a = FW / FH, cam = new THREE.OrthographicCamera(-15 * a / 2, 15 * a / 2, 7.5, -7.5, .1, 100);
    Object.assign(this, { r3, sc, cam, sun, hemi, LM, cut, isl, far, rocks, trees, clouds, cl, arm, crow, head, jaw, wings, rb, str, hb, flame, leaves, dm: new THREE.Object3D() });
  },
  // the things that only drift: far islands, rocks, clouds
  drift(t, race) { this.far.forEach((g, i) => g.position.copy(g.userData.p).y += bob(i + 7, t)); this.rocks.forEach((m, i) => { m.position.copy(m.userData.p).y += .12 * Math.sin(t * .7 + i * 2.1); m.rotation.y = i + t * .2; }); this.clouds.forEach(g => g.position.copy(g.userData.p).addScaledVector(RT, .25 * t * g.userData.sp + race * g.userData.sp)); },
  render(T, z, wire = 0) {
    const { r3, sc, cam, sun } = this; cam.zoom = z; cam.position.copy(T).add(CD); cam.lookAt(T); cam.updateProjectionMatrix(); sun.position.copy(T).add(V(1, 11, 9)); sun.target.position.copy(T);
    sun.intensity = 2.4 * (1 - .45 * wire); this.hemi.intensity = 1.7 * (1 - .35 * wire); sc.backgroundIntensity = 1 - .3 * wire; r3.render(sc, cam);
    if (wire > 0) {   // the edges, three times with a pixel of offset (a GL line is one pixel wide); a plane sweeps them in from the lower left
      const dir = RT.clone().multiplyScalar(.55).addScaledVector(CU, .83).normalize(), tx = sc.background; this.cut.normal.copy(dir).negate(); this.cut.constant = dir.dot(T) - 10 / z + 21 / z * wire; this.LM.opacity = Math.min(1, wire * 4);
      sc.background = null; r3.autoClear = false; cam.layers.set(1); [[0, 0], [1, 0], [0, 1]].forEach(([dx, dy]) => { cam.setViewOffset(FW, FH, dx, dy, FW, FH); r3.render(sc, cam); }); cam.clearViewOffset(); cam.layers.set(0); r3.autoClear = true; sc.background = tx;
    }
  },
  draw(u, S) {
    const M = this.M || (this.M = model(S)), [, L1, L2] = S.lines, g = u - M.gu, { T, z } = M.cam(u), { cl, crow } = this;
    this.isl.forEach((G, n) => G.position.copy(ISL[n].p).y += bob(SID[n], u) + M.dip(SID[n], u));
    this.drift(u, g > 0 ? 8 * (1 - Math.exp(-g * 1.2)) + .5 * g : 0);
    const bend = g > 0 ? .42 * (1 - Math.exp(-g * 10)) * Math.exp(-g * 1.3) + .07 * Math.sin(g * 9) * Math.exp(-g * .9) + .035 * (1 - Math.exp(-g)) * (1 + Math.sin(u * 3.1)) : 0;   // the gust, and the breeze that stays
    this.trees.forEach((t, i) => t.quaternion.setFromAxisAngle(BK, bend * (.75 + .5 * h2(i, 1))));
    // the hot-air balloon: it sinks when he lands on it, the burner answers, it carries him up to the last island
    const puff = bump((u - 2.66) / .95); this.hb.position.copy(M.hbAt(u)); this.hb.rotation.z = -.3 * clamp(g, 0, 1); this.flame.visible = puff > 0; this.flame.scale.set(.6 + puff, .2 + 2.3 * puff, .6 + puff);
    // Clawd: anticipation, arc, squash; he braces in the gust, sinks a little under the crow, tilts up to think and nods
    const F = M.feet(u), nod = L2.t0 + L2.words[3][1]; let sy = 1 - .1 * thud(u - CROW1) - .08 * bump(g / .5) - .05 * pulse(L2, u, .16) - .07 * bump((u - nod) / .3);
    for (const [t0, t1] of HOPS) sy += -.22 * bump((u - t0 + .2) / .24) + .14 * bump((u - t0) / (t1 - t0)) - .26 * thud(u - t1);
    const sx = 1 / Math.sqrt(sy), pitch = -.2 * ss(L2.t0, L2.t0 + .35, u) * (1 - ss(nod - .12, nod, u)) + .24 * bump((u - nod) / .38);
    cl.position.copy(F.p); cl.scale.set(sx, sy, sx); cl.rotation.set(pitch, Math.PI / 4 + .4 * (ss(.5, .8, u) - ss(4.05, 4.5, u)), (F.e >= 0 ? -.12 * Math.cos(Math.PI * F.e) : 0) - (g > 0 ? .2 * (1 - Math.exp(-g * 14)) * Math.exp(-g * 2.4) : 0));
    this.arm.rotation.z = 0; this.arm.scale.x = 1;
    // the crow rides in on the gust, lands on his head and talks: the beak opens on every word, the head bobs
    const tc = (u - CROW0) / (CROW1 - CROW0); crow.visible = tc > 0;
    if (tc > 0) { const e = 1 - Math.pow(1 - clamp(tc), 2), tk = pulse(L1, u, .2), end = L1.t0 + L1.dur, wv = tc < 1 ? .2 + .8 * Math.sin(u * 44) : .5, fold = ss(CROW1, CROW1 + .22, u) * (1 - .6 * bump((u - nod - .04) / .3));   // the wings fold back along the body; a flick for balance when he nods
      crow.position.set(.1 - 5.4 * (1 - e), 10 * s + 3.6 * Math.pow(1 - e, 1.5) + .05 * tk, .05); crow.scale.set(1.35 / sx, 1.35 / sy, 1.35 / sx); crow.rotation.set(-.35 * (1 - e), .55, 0);
      this.wings.forEach((w, i) => { const k = i ? 1 : -1; w.rotation.set(0, k * 1.42 * fold, k * (wv * (1 - fold) - .3 * fold)); w.scale.x = 1 - .35 * fold; }); this.jaw.rotation.x = .7 * tk;
      this.head.rotation.set(.32 * ss(L1.t0 - .1, L1.t0 + .2, u) * (1 - ss(end, end + .3, u)) + .22 * tk, 0, .3 * ss(L2.t0 - .1, L2.t0 + .2, u)); }
    // the red balloon: ahead of him, then gone with the gust; the string trails behind it
    const B = M.bal(u), mov = ss(.7, 1.2, u) * (1 - ss(3.9, 4.2, u)), lean = .1 * Math.sin(u * 1.6 + 1) - .32 * mov - (g > 0 ? 1.0 * Math.exp(-g * 1.1) : 0); this.rb.position.copy(B); this.rb.scale.setScalar(1); this.rb.rotation.z = -lean * .25;
    let p = B.clone().addScaledVector(UP, -.64); this.str.forEach((m, i) => { const a = lean * (i + 1) / 2, q = p.clone().addScaledVector(RT, Math.sin(a) * .5).addScaledVector(UP, -Math.cos(a) * .5); m.visible = true; seg(m, p, q); p = q; });
    // leaves: triangles that cross the frame with the gust
    const d = this.dm; for (let i = 0; i < 70; i++) { const k = (g - h2(i, 1) * 1.1) / (.75 + h2(i, 2) * .7);
      if (k <= 0 || k >= 1) d.scale.setScalar(0); else { d.position.copy(s2w(T, z, -120 + 1320 * k, 300 + 1300 * h2(i, 3) - 420 * k + 90 * Math.sin(k * 9 + i), 6)); d.rotation.set(g * 9 + i, g * 7 + i * 2, g * 5); d.scale.setScalar(.2 + .22 * h2(i, 4)); }
      d.updateMatrix(); this.leaves.setMatrixAt(i, d.matrix); } this.leaves.instanceMatrix.needsUpdate = true;
    this.render(T, z, clamp((u - M.out) / (S.dur - M.out)));
  },
  // the finale: the archipelago at rest, seen from further away, and Clawd under the red balloon in front of it
  glide(g) {
    const t = g.k * 10.88, T = W(9.5, 1.5, 0), z = .7, { cl } = this, at = (x, y, dz) => s2w(T, z, x, y, dz);
    [[215, 1560, 0], [900, 1210, -5], [140, 800, -7], [840, 1800, 3]].forEach(([x, y, dz], n) => this.isl[[3, 0, 1, 2][n]].position.copy(at(x, y, dz)).y += bob(n, t));
    this.drift(t, 0); this.trees.forEach(tr => tr.quaternion.identity()); this.hb.position.copy(at(905, 330, -8)).y += .15 * Math.sin(t * .7); this.hb.rotation.z = 0; this.flame.visible = false; this.crow.visible = false;
    const d = this.dm; d.scale.setScalar(0); d.updateMatrix(); for (let i = 0; i < 70; i++) this.leaves.setMatrixAt(i, d.matrix); this.leaves.instanceMatrix.needsUpdate = true;
    const k = g.w / (16 * s * PPU * z), q = new THREE.Quaternion().setFromAxisAngle(CN, -g.rot).multiply(new THREE.Quaternion().setFromAxisAngle(UP, Math.PI / 4));
    cl.quaternion.copy(q); cl.scale.setScalar(k); cl.position.copy(at(g.x, g.y, 9)).sub(V(0, 5 * s * k, 0).applyQuaternion(q)); this.arm.rotation.z = 1.0; this.arm.scale.x = 3;   // one arm up, holding the string
    const bs = g.br / (.5 * PPU * z), B = at(g.bx, g.by, 9); this.rb.position.copy(B); this.rb.scale.setScalar(bs); this.rb.rotation.z = -g.rot * .5;
    cl.updateMatrixWorld(true); const hand = this.arm.localToWorld(V(1.85 * s, 0, 0)); seg(this.str[0], B.clone().addScaledVector(UP, -.64 * bs), hand); this.str[1].visible = this.str[2].visible = false;
    this.render(T, z, 0); cl.rotation.set(0, Math.PI / 4, 0);
  },
  sfx: {
    lp_hop: { prompt: 'one soft hollow wooden knock, a small wooden toy block landing on a wooden board, cartoon, no music, no speech', dur: .5 },
    lp_bounce: { prompt: 'something landing on a big inflated fabric balloon, soft rubbery boing with a low thump, cartoon, no music, no speech', dur: .8 },
    lp_burner: { prompt: 'one short burst of a hot-air balloon gas burner, roaring flame puff that fades, no music, no speech', dur: 1.2 },
    lp_gust: { prompt: 'a sudden strong gust of wind rushing past with rustling leaves and creaking trees, then fading, no music, no speech', dur: 3 },
    lp_crow: { prompt: 'a crow flapping its wings a few times and landing on a wooden surface with a small thud, no cawing, no music, no speech', dur: 1.2 },
    lp_nod: { prompt: 'one small decided wooden click, like a wooden block nodding, cartoon, no music, no speech', dur: .5 },
    lp_wire: { prompt: 'thin bright glassy lines lighting up one after another, a soft rising shimmer of fine chimes, no music, no speech', dur: 1.4 } },
  amb: { prompt: 'high open sky above the clouds, soft steady breeze, a few distant birds, calm and airy, no music, no speech', gain: -24 },
  cues(S) { const r = v => +v.toFixed(2), nod = S.lines[2].t0 + S.lines[2].words[3][1]; return [['lp_hop', HOPS[0][1], -6], ['lp_hop', HOPS[1][1], -6], ['lp_bounce', HOPS[2][1], -5], ['lp_burner', 2.68, -6], ['lp_hop', HOPS[3][1], -4], ['lp_gust', r(S.marks.gust - .1), -2], ['lp_crow', r(CROW1 - .6), -5], ['lp_nod', r(nod), -8], ['lp_wire', r(S.marks.out - .1), -6]]; }
});
})();
