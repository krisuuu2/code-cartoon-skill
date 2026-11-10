// styles8/s5_lowpoly.js: style 5, LOW-POLY DIORAMA (a floating island in isometric view). three.js: flat-shaded meshes with jittered vertices,
// an orthographic camera, one warm sun with a soft shadow map, a hemisphere light that tints the shadows.
S8.push({ name: 'LOW-POLY DIORAMA', tech: 'three.js · flat shading', init(stage) {
  const r3 = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); r3.setPixelRatio(1); r3.setSize(FW, FH, false); r3.domElement.style.cssText = 'position:absolute;left:0;top:0'; stage.append(r3.domElement);
  r3.shadowMap.enabled = true; r3.shadowMap.type = THREE.PCFSoftShadowMap;
  const sc = new THREE.Scene(), root = new THREE.Group(); sc.add(root);
  const bg = document.createElement('canvas'); bg.width = 270; bg.height = 480; const b = bg.getContext('2d'), gr = b.createLinearGradient(0, 0, 0, 480);
  gr.addColorStop(0, '#6FCBC8'); gr.addColorStop(.5, '#C4E9D8'); gr.addColorStop(1, '#FFE0BC'); b.fillStyle = gr; b.fillRect(0, 0, 270, 480); b.fillStyle = 'rgba(255,250,225,.5)'; b.beginPath(); b.arc(205, 92, 44, 0, 7); b.fill(); b.fillStyle = '#FFF6D8'; b.beginPath(); b.arc(205, 92, 30, 0, 7); b.fill();
  const tex = new THREE.CanvasTexture(bg); tex.colorSpace = THREE.SRGBColorSpace; sc.background = tex;
  const jit = (geo, k) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), s = Math.round(x * 40) + Math.round(y * 40) * 3.7 + Math.round(z * 40) * 9.1; p.setXYZ(i, x + (h2(s, 1) - .5) * k, y + (h2(s, 2) - .5) * k * .5, z + (h2(s, 3) - .5) * k); } geo.computeVertexNormals(); return geo; };   // by position, so shared corners stay shared
  const add = (geo, col, x, y, z, o = {}) => { const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: col, flatShading: true, transparent: !!o.op, opacity: o.op ?? 1 })); m.position.set(x, y, z); if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.s) m.scale.set(...(o.s.length ? o.s : [o.s, o.s, o.s])); m.castShadow = !o.op; m.receiveShadow = !o.ns; (o.to || root).add(m); return m; };
  const Cy = (a, b, h, n) => new THREE.CylinderGeometry(a, b, h, n), Co = (r, h, n) => new THREE.ConeGeometry(r, h, n), Ico = (r, d = 0) => new THREE.IcosahedronGeometry(r, d), Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  // the island: grass, earth, a hanging rock
  add(jit(Cy(3.3, 2.95, .7, 11), .16), '#8BCB6E', 0, 0, 0); add(jit(Cy(2.95, 1.9, 1.2, 11), .3), '#C98F62', 0, -.95, 0); add(jit(Co(1.9, 2.9, 9), .35), '#A0705A', 0, -3, 0, { rx: Math.PI });
  [[-3.3, -2.4, 1.2, .36], [2.7, -3.3, .4, .28], [-1.2, -4.9, 1.6, .2], [3.5, -2.2, -1.4, .18]].forEach(([x, y, z, r]) => add(jit(Ico(r), .12), '#A0705A', x, y, z));
  const G = .35;   // the grass level
  [[.2, -2.3, 1.15], [1.25, -1.9, .9], [-.65, -1.55, 1.3], [-2.1, -1.5, .8]].forEach(([x, z, s], i) => { add(Cy(.08, .11, .5, 5), '#7A5236', x, G + .2 * s, z, { s }); ['#2F8F6B', '#3BA57B', '#55C08D'].forEach((c, k) => add(jit(Co(.6 - k * .13, .85 - k * .08, 6), .08), c, x, G + (.75 + k * .42) * s, z, { s, ry: i + k })); });
  [[-1.5, 2.0, .62, '#F28C5E'], [-2.5, .9, .46, '#F6B04E']].forEach(([x, z, r, c]) => { add(Cy(.07, .1, .7, 5), '#7A5236', x, G + .3, z); add(jit(Ico(r), .14), c, x, G + .6 + r * .7, z); });
  const hs = new THREE.Group(); hs.position.set(-1.75, G, -.75); hs.rotation.y = Math.PI / 4 + .25; root.add(hs);   // the house
  add(Bx(.95, .7, .85), '#FFF4E0', 0, .35, 0, { to: hs }); add(Co(.92, .62, 4), '#E8674A', 0, 1.0, 0, { to: hs, ry: Math.PI / 4 }); add(Bx(.2, .36, .04), '#7A5236', -.15, .18, .44, { to: hs }); add(Bx(.2, .2, .04), '#8FD9F2', .22, .42, .44, { to: hs }); add(Bx(.14, .4, .14), '#D9C7B0', .25, 1.05, -.1, { to: hs });
  [[-.75, .55], [-.25, .95], [.1, 1.5]].forEach(([x, z], i) => add(Cy(.17, .17, .04, 6), '#EAD9B8', x, G + .02, z, { ry: i }));   // stepping stones
  [[1.9, 1.9, .2], [2.5, 1.1, .14], [-.4, 2.7, .17], [.9, -1.0, .13]].forEach(([x, z, r]) => add(jit(Ico(r), .06), '#B9B4C7', x, G + r * .5, z));
  [[.3, 2.6, .22], [-2.7, -.3, .26], [2.9, .3, .2], [1.6, -2.6, .2]].forEach(([x, z, r]) => add(jit(Ico(r), .06), '#55C08D', x, G + r * .6, z));
  add(Cy(.72, .72, .06, 9), '#5CC3E8', 2.3, G + .02, -.5); add(Bx(.6, 3.0, .1), '#A9E6F7', 3.14, -1.12, -.69, { ry: 1.785, op: .92 });   // the pond and its waterfall
  [[3.2, -2.7, -.7, .26], [3.45, -2.9, -.4, .18], [3.0, -2.95, -1.0, .2]].forEach(([x, y, z, r]) => add(Ico(r, 1), '#FFFFFF', x, y, z));
  // Clawd, in voxels, facing the camera
  const cl = new THREE.Group(), s = .185; cl.position.set(1.05, G, 1.05); cl.rotation.y = Math.PI / 4; root.add(cl); this.cl = cl;
  CLAWD.body.forEach(([c, r, w, h], i) => add(Bx(w * s, h * s, i === 0 ? .8 : i === 1 ? .56 : .4), '#F0793A', (c - 8 + w / 2) * s, (10 - r - h / 2) * s, 0, { to: cl }));
  CLAWD.eyes.forEach(([c, r, w, h]) => add(Bx(w * s, h * s, .04), '#2B1B14', (c - 8 + w / 2) * s, (10 - r - h / 2) * s, .4, { to: cl }));
  const cloud = (x, y, z, k) => [[0, 0, 0, .5], [.5, -.05, .1, .38], [-.5, -.08, -.05, .34], [.1, .22, 0, .3]].forEach(([a, bb, c, r]) => add(Ico(r * k, 1), '#FFFFFF', x + a * k, y + bb * k, z + c * k, { s: [1, .8, 1], ns: 1 }));
  cloud(-3.6, 3.3, -1.2, 1.5); cloud(3.2, 4.6, -2.6, 1.2); cloud(-2.9, -3.6, 2.6, 1.3); cloud(.6, 6.2, -3.2, .9); cloud(4.2, -.6, 2.6, .8); cloud(2.4, -6.0, 1.6, 1.25);
  const bl = new THREE.Group(); bl.position.set(-2.9, 5.0, .7); root.add(bl); this.bl = bl;   // the balloon
  add(Ico(.85, 1), '#E8674A', 0, 0, 0, { to: bl, s: [1, 1.18, 1] }); add(Cy(.87, .87, .22, 12), '#FFF4E0', 0, .05, 0, { to: bl }); add(Bx(.3, .24, .3), '#7A5236', 0, -1.45, 0, { to: bl });
  [[-.13, -.13], [.13, -.13], [-.13, .13], [.13, .13]].forEach(([x, z]) => add(Cy(.012, .012, .55, 4), '#5B4636', x, -1.1, z, { to: bl }));
  sc.add(new THREE.HemisphereLight(0xffffff, 0xFFCFA0, 1.7)); const sun = new THREE.DirectionalLight(0xFFF2DC, 2.4); sun.position.set(1, 11, 9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 3; sun.shadow.bias = -.0006;
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 9, bottom: -9, near: 1, far: 40 }); sc.add(sun);
  const vh = 15, a = FW / FH, cam = new THREE.OrthographicCamera(-vh * a / 2, vh * a / 2, vh / 2, -vh / 2, .1, 100); cam.position.set(12, 10.5, 12); cam.lookAt(0, 1.0, 0);
  Object.assign(this, { r3, sc, cam, root });
}, draw(t = 0) { this.root.position.y = Math.sin(t * .8) * .08; this.bl.position.y = 5 + Math.sin(t * .6 + 1) * .15; this.r3.render(this.sc, this.cam); } });
