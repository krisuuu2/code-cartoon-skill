// styles8/s11_anime.js: style 11, ANIME CEL (a summer hill, the big-cloud sky). three.js used the opposite way from style 5: a two-tone toon ramp instead of smooth light,
// hard shadow edges, an ink line made of inverted hulls, 30,000 instanced grass blades with flat colours, and a sky that is painted in 2D (cel clouds: three stacked tones per puff).
S8.push({ name: 'ANIME CEL', tech: 'three.js toon ramp · hull outlines', init(stage) {
  const R = rng(21), HZ = 1190, bg = document.createElement('canvas'); bg.width = FW; bg.height = FH; const b = bg.getContext('2d');
  let g = b.createLinearGradient(0, 0, 0, HZ); g.addColorStop(0, '#0E45AC'); g.addColorStop(.55, '#3A8BE8'); g.addColorStop(1, '#ABDCFA'); b.fillStyle = g; b.fillRect(0, 0, FW, HZ);
  function cloud(cx, base, w, h, n, seed) {   // a tower of puffs, flat at the bottom; shadow, mid and light tones are the same puffs shifted toward the sun
    const r = rng(seed), P = []; for (let i = 0; i < n; i++) { const v = Math.pow(r(), 1.25), u = r() - .5; P.push([cx + u * w * (1 - v * .72) + Math.sin(v * 7) * w * .06, base - v * h, w * (.085 + .1 * r()) * (1 - v * .35)]); }
    b.save(); b.beginPath(); b.rect(0, 0, FW, base); b.clip();
    P.sort((p, q) => p[1] - q[1]).forEach(([x, y, rad]) => [['#7C9FDB', 0, 0, 1], ['#C6DAF7', -.13, -.2, .88], ['#FFFFFF', -.27, -.4, .66]].forEach(([col, ox, oy, k]) => { b.fillStyle = col; b.beginPath(); b.arc(x + ox * rad, y + oy * rad, rad * k, 0, 7); b.fill(); }));   // top puffs first, so every lower puff keeps its own shadow edge
    b.restore();
  }
  cloud(150, HZ, 330, 150, 30, 5); cloud(470, HZ, 210, 80, 16, 6); cloud(820, HZ, 600, 960, 170, 3);
  g = b.createLinearGradient(0, HZ, 0, FH); g.addColorStop(0, '#64ADF0'); g.addColorStop(.1, '#2C74D6'); g.addColorStop(1, '#164898'); b.fillStyle = g; b.fillRect(0, HZ, FW, FH - HZ);
  b.fillStyle = '#74A9E8'; b.beginPath(); b.moveTo(0, HZ + 1); b.lineTo(0, HZ - 24); b.quadraticCurveTo(130, HZ - 74, 270, HZ - 30); b.quadraticCurveTo(340, HZ - 10, 400, HZ + 1); b.fill();
  for (let i = 0; i < 300; i++) { const k = Math.pow(R(), 1.6), y = HZ + 5 + k * 420; b.fillStyle = `rgba(255,255,255,${.2 + R() * .55})`; b.fillRect(R() * FW, y, 8 + R() * 60 * (.2 + k), 2 + k * 3); }

  const r3 = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); r3.setPixelRatio(1); r3.setSize(FW, FH, false); r3.domElement.style.cssText = 'position:absolute;left:0;top:0'; stage.append(r3.domElement);
  r3.shadowMap.enabled = true; r3.shadowMap.type = THREE.BasicShadowMap;   // hard edges on purpose
  const sc = new THREE.Scene(), tex = new THREE.CanvasTexture(bg); tex.colorSpace = THREE.SRGBColorSpace; sc.background = tex;
  const ramp = new THREE.DataTexture(new Uint8Array([120, 120, 255, 255]), 4, 1, THREE.RedFormat); ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
  const toon = col => new THREE.MeshToonMaterial({ color: col, gradientMap: ramp }), flat = (col, o = {}) => new THREE.MeshBasicMaterial({ color: col, ...o }), LINE = flat('#2B1A3F', { side: THREE.BackSide });
  const rr = (w, h, r) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; };
  const rbox = (w, h, d, bv) => { const geo = new THREE.ExtrudeGeometry(rr(w - 2 * bv, h - 2 * bv, Math.min(w, h) * .12), { depth: d - 2 * bv, bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 5, curveSegments: 8 }); geo.center(); return geo; };
  // Clawd: rounded blocks, each with its ink hull
  const cl = new THREE.Group(), s = .13, T = .022; cl.position.set(0, .16, 0); cl.rotation.y = .25; sc.add(cl);
  CLAWD.body.forEach(([c, r, w, h], i) => { const d = i === 0 ? .62 : i === 1 ? .44 : .3, W = w * s, Hh = h * s + (i > 1 ? .06 : 0), geo = rbox(W, Hh, d, i > 1 ? .025 : .045), m = new THREE.Mesh(geo, toon('#FF7A3A')), hull = new THREE.Mesh(geo, LINE);
    m.position.set((c - 8 + w / 2) * s, (10 - r - h / 2) * s + (i > 1 ? .03 : 0), 0); m.castShadow = m.receiveShadow = true; hull.position.copy(m.position); hull.scale.set(1 + 2 * T / W, 1 + 2 * T / Hh, 1 + 2 * T / d); cl.add(m, hull); });
  const put = (geo, col, x, y, z, o = {}) => { const m = new THREE.Mesh(geo, flat(col, o)); m.position.set(x, y, z); cl.add(m); return m; }, Z = .314;
  [-1, 1].forEach(k => { const x = k * 3.5 * s, y = 7 * s;   // big eyes: a dark plate, an iris, two highlights; a blush under each
    put(new THREE.ShapeGeometry(rr(s * 1.25, s * 2.2, .045)), '#1A1638', x, y, Z); put(new THREE.ShapeGeometry(rr(s * .95, s * 1.0, .04)), '#3F56C4', x, y - s * .5, Z + .002);
    put(new THREE.CircleGeometry(.032, 16), '#FFFFFF', x - .03, y + s * .62, Z + .004); put(new THREE.CircleGeometry(.014, 12), '#FFFFFF', x + .035, y - s * .55, Z + .004);
    put(new THREE.CircleGeometry(.075, 20), '#FF8296', k * .63, y - s * 1.75, Z, { transparent: true, opacity: .6 }).scale.set(1.45, .62, 1); });
  put(new THREE.CircleGeometry(.055, 20, Math.PI, Math.PI), '#7A2430', 0, 5.2 * s, Z);
  // the hill and its grass
  const hill = new THREE.Mesh(new THREE.SphereGeometry(9, 96, 48), toon('#3FA24A')); hill.position.y = -9; hill.receiveShadow = true; sc.add(hill);
  const bgeo = new THREE.BufferGeometry(); bgeo.setAttribute('position', new THREE.Float32BufferAttribute([-.5, 0, 0, .5, 0, 0, -.32, .5, .08, .32, .5, .08, 0, 1, .3], 3)); bgeo.setAttribute('color', new THREE.Float32BufferAttribute([.5, .5, .5, .5, .5, .5, .82, .82, .82, .82, .82, .82, 1.12, 1.12, 1.12], 3)); bgeo.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]);
  const N = 30000, blades = new THREE.InstancedMesh(bgeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }), N), d = new THREE.Object3D(), col = new THREE.Color(), zAx = new THREE.Vector3(0, 0, 1), GR = ['#3FA84A', '#58C257', '#7BD45F', '#2F9146', '#58C257'];
  for (let i = 0; i < N; i++) { const x = (R() - .5) * 11, z = -3.2 + R() * 10.6, y = Math.sqrt(Math.max(0, 81 - x * x - z * z)) - 9, sh = ((x - .5) / 1.35) ** 2 + ((z + .5) / .85) ** 2 < 1;   // sh: under Clawd's shadow
    d.position.set(x, y - .02, z); d.rotation.set(0, R() * 6.28, 0); d.rotateOnWorldAxis(zAx, -.28 - R() * .3); d.scale.set(.035 + R() * .035, .16 + R() * R() * .36, 1); d.updateMatrix(); blades.setMatrixAt(i, d.matrix);
    blades.setColorAt(i, col.set(sh ? '#1F7A43' : GR[R() * GR.length | 0])); }
  sc.add(blades);
  const cam = new THREE.PerspectiveCamera(34, FW / FH, .1, 100); cam.position.set(-2.6, 1.0, 8.2); cam.lookAt(.1, 1.95, 0);
  const dots = new THREE.InstancedMesh(new THREE.CircleGeometry(.03, 12), flat('#FFFFFF'), 260);   // daisies, always facing the camera
  for (let i = 0; i < 260; i++) { const x = (R() - .5) * 9, z = -2.5 + R() * 6.5, y = Math.sqrt(81 - x * x - z * z) - 9; d.position.set(x, y + .16 + R() * .14, z); d.quaternion.copy(cam.quaternion); d.scale.setScalar(.5 + R() * .6); d.updateMatrix(); dots.setMatrixAt(i, d.matrix); }
  sc.add(dots);
  sc.add(new THREE.HemisphereLight(0xCFE0FF, 0x86B46E, 1.15)); const sun = new THREE.DirectionalLight(0xFFF6E6, 2.3); sun.position.set(-4, 7, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.002; Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 20 }); sc.add(sun);
  // the lens: a warm leak from the sun's corner, two ghosts, petals on the wind, and the subtitle
  const ov = cv(), x = ov.getContext('2d'); stage.append(ov);
  g = x.createRadialGradient(-60, 60, 0, -60, 60, 1250); g.addColorStop(0, 'rgba(255,246,214,.85)'); g.addColorStop(.3, 'rgba(255,240,200,.3)'); g.addColorStop(1, 'rgba(255,240,200,0)'); x.fillStyle = g; x.fillRect(0, 0, FW, FH);
  [[330, 420, 54, '120,200,255', .13], [520, 610, 84, '255,200,150', .08]].forEach(([a, c, r, rgb, al]) => { x.fillStyle = `rgba(${rgb},${al})`; x.beginPath(); x.arc(a, c, r, 0, 7); x.fill(); });
  for (let i = 0; i < 20; i++) { const px = 60 + R() * 960, py = 500 + R() * 1150; if (px > 180 && px < 840 && py > 1120 && py < 1520) continue; x.save(); x.translate(px, py); x.rotate(R() * 6.28); x.fillStyle = `rgba(255,${225 + R() * 30 | 0},${235 + R() * 20 | 0},.92)`; x.beginPath(); x.ellipse(0, 0, 9 + R() * 9, 4 + R() * 4, 0, 0, 7); x.fill(); x.restore(); }
  x.font = '500 50px Jost'; x.textAlign = 'center'; x.lineJoin = 'round'; x.lineWidth = 9; x.strokeStyle = '#161226'; x.strokeText('“So this is what the sky looks like.”', 540, 1772); x.fillStyle = '#fff'; x.fillText('“So this is what the sky looks like.”', 540, 1772);
  Object.assign(this, { r3, sc, cam });
}, draw() { this.r3.render(this.sc, this.cam); } });
