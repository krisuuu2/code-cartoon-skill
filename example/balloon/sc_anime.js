// balloon/sc_anime.js: scene 12 of THE BALLOON, ANIME CEL (the summer hill of styles8/s11_anime.js). three.js with a two-tone toon ramp, hard shadows and
// ink lines made of inverted hulls; 30,000 grass blades that sway and scroll in the vertex shader (the hill is a treadmill: Clawd stays on the crest and the
// grass runs under him); the sky is painted in 2D on a canvas behind the transparent WebGL canvas, and the lens (petals, speed lines, impact frames, the
// sparkle, the string) on a canvas in front of it. Two shots: A, the hill (he looks up, runs, takes off on two impact frames), and B, the sky (slow motion,
// the catch). Shot B and the finale are the same picture, rig(g): that is why the last frame of this scene is exactly FILM.glidePose(0).
(() => {
const A = FILM.ANCHOR, s = .13, PX = 300 / (16 * s), FOC = FH / 2 / Math.tan(17 * Math.PI / 180), VRUN = 7, KGL = 10.88, HIP = 2 * s + .06, INK = '#2B1A3F';
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), ZA = V(0, 0, 1), lerp = (a, b, k) => a + (b - a) * k, mod = (a, n) => ((a % n) + n) % n;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }, eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, bump = x => x > 0 && x < 1 ? Math.sin(Math.PI * x) : 0;
const Iss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return (b - a) * (t * t * t - t * t * t * t / 2) + Math.max(0, x - b); };   // the integral of ss(a, b, .): distance from a speed curve
const CATCH = { x: 470, y: 900, rot: -.2, w: 400 };   // where he is when his hand closes on the string
const VERT = `
attribute float aPh; uniform float uT, uScroll, uWind; uniform vec3 uSh, uShC; varying vec3 vC;
const float A = .66;
void main() {
  vec4 o = instanceMatrix[3];                                                    // the root of the blade on the hill (a sphere of radius 9 around (0, -9, 0))
  float ph = atan(o.x, o.y + 9.), d = mod(ph - uScroll + A, 2. * A) - A - ph, c = cos(d), sn = sin(d);   // the treadmill: every root turns around the hill's axis and wraps
#ifdef DAISY
  o.y += 9.; o.xy = vec2(o.x * c + o.y * sn, -o.x * sn + o.y * c); o.y -= 9.;
  vec4 mv = modelViewMatrix * vec4(o.xyz, 1.); mv.xy += position.xy * length(instanceMatrix[0].xyz); vC = vec3(1.); gl_Position = projectionMatrix * mv;
#else
  vec4 p = instanceMatrix * vec4(position, 1.);
  float k = position.y * position.y * length(instanceMatrix[1].xyz), wave = .5 + .5 * sin(uT * 2.1 - o.x * .9 + o.z * .5 + sin(o.z * 1.3));   // waves of wind running over the grass
  p.x += k * (uWind * (.25 + .85 * wave) + .1 * sin(uT * 5.3 + aPh)); p.y -= k * uWind * .3 * wave;
  p.y += 9.; p.xy = vec2(p.x * c + p.y * sn, -p.x * sn + p.y * c); p.y -= 9.;
  float rx = o.x * c + (o.y + 9.) * sn, sh = uSh.z * step(length(vec2(rx - uSh.x, o.z - uSh.y) / vec2(1.35, .85)), 1.);     // his shadow on the grass
  vC = mix(color * instanceColor, uShC * color, sh);
  gl_Position = projectionMatrix * modelViewMatrix * p;
#endif
}`, FRAG = `varying vec3 vC; void main() { gl_FragColor = vec4(vC, 1.);
#include <colorspace_fragment>
}`;

FILM.add({ id: 'anime',
  init(el) {
    // 1. the painted sky, in layers: the big cumulus, the low clouds with the far island, the sea
    const R = rng(21), mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    function cloud(b, cx, base, w, h, n, seed) {   // a tower of puffs, flat at the bottom; shadow, mid and light tones are the same puffs shifted toward the sun
      const r = rng(seed), P = []; for (let i = 0; i < n; i++) { const v = Math.pow(r(), 1.25), u = r() - .5; P.push([cx + u * w * (1 - v * .72) + Math.sin(v * 7) * w * .06, base - v * h, w * (.085 + .1 * r()) * (1 - v * .35)]); }
      b.save(); b.beginPath(); b.rect(0, 0, b.canvas.width, base); b.clip();
      P.sort((p, q) => p[1] - q[1]).forEach(([x, y, rad]) => [['#7C9FDB', 0, 0, 1], ['#C6DAF7', -.13, -.2, .88], ['#FFFFFF', -.27, -.4, .66]].forEach(([col, ox, oy, k]) => { b.fillStyle = col; b.beginPath(); b.arc(x + ox * rad, y + oy * rad, rad * k, 0, 7); b.fill(); }));
      b.restore();
    }
    const BIG = mk(1300, 1200), LOW = mk(2600, 280), SEA = mk(FW, 800); cloud(BIG.getContext('2d'), 650, 1200, 600, 960, 170, 3);
    let c = LOW.getContext('2d'); [[250, 330, 150, 30, 5], [570, 210, 80, 16, 6], [1300, 300, 120, 24, 7], [1720, 240, 90, 18, 8], [2250, 360, 160, 30, 9]].forEach(([cx, w, h, n, sd]) => cloud(c, cx, 280, w, h, n, sd));
    c.fillStyle = '#74A9E8'; c.beginPath(); c.moveTo(100, 280); c.lineTo(100, 256); c.quadraticCurveTo(230, 206, 370, 250); c.quadraticCurveTo(440, 270, 500, 280); c.fill();
    c = SEA.getContext('2d'); let g = c.createLinearGradient(0, 0, 0, 730); g.addColorStop(0, '#64ADF0'); g.addColorStop(.1, '#2C74D6'); g.addColorStop(1, '#164898'); c.fillStyle = g; c.fillRect(0, 0, FW, 800);
    for (let i = 0; i < 300; i++) { const k = Math.pow(R(), 1.6), y = 5 + k * 420; c.fillStyle = `rgba(255,255,255,${.2 + R() * .55})`; c.fillRect(R() * FW, y, 8 + R() * 60 * (.2 + k), 2 + k * 3); }
    const bgc = cv(), b = bgc.getContext('2d'); el.append(bgc);
    this.sky = (hz, dx, bigX, bigS) => {   // the horizon at hz; the far layers slide by dx
      const g = b.createLinearGradient(0, hz - 1190, 0, hz); g.addColorStop(0, '#0E45AC'); g.addColorStop(.55, '#3A8BE8'); g.addColorStop(1, '#ABDCFA'); b.fillStyle = g; b.fillRect(0, 0, FW, FH);
      b.drawImage(BIG, bigX - 650 * bigS, hz - 1200 * bigS, 1300 * bigS, 1200 * bigS); b.drawImage(LOW, Math.round(dx) - 100, hz - 280); b.drawImage(SEA, 0, hz); if (hz + 800 < FH) { b.fillStyle = '#164898'; b.fillRect(0, hz + 800, FW, FH - hz - 800); } };

    // 2. three.js: toon ramp, hard shadows, hull outlines
    const r3 = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); r3.setPixelRatio(1); r3.setSize(FW, FH, false); r3.setClearColor(0, 0); r3.domElement.style.cssText = 'position:absolute;left:0;top:0'; el.append(r3.domElement);
    r3.shadowMap.enabled = true; r3.shadowMap.type = THREE.BasicShadowMap;   // hard edges on purpose
    const sc = new THREE.Scene(), ramp = new THREE.DataTexture(new Uint8Array([120, 120, 255, 255]), 4, 1, THREE.RedFormat); ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
    const toon = col => new THREE.MeshToonMaterial({ color: col, gradientMap: ramp }), flat = (col, o = {}) => new THREE.MeshBasicMaterial({ color: col, ...o }), LINE = flat(INK, { side: THREE.BackSide });
    const rr = (w, h, r) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; };
    const rbox = (w, h, d, bv) => { const geo = new THREE.ExtrudeGeometry(rr(w - 2 * bv, h - 2 * bv, Math.min(w, h) * .12), { depth: d - 2 * bv, bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 5, curveSegments: 8 }); geo.center(); return geo; };
    // Clawd: rounded blocks, each with its ink hull, each in its own group so that legs and the right arm can move
    const cl = new THREE.Group(), T = .022, TOON = toon('#FF7A3A'); cl.rotation.order = 'YXZ'; sc.add(cl);
    const part = (w, h, d, bv, x, y, to = cl) => { const geo = rbox(w, h, d, bv), m = new THREE.Mesh(geo, TOON), hull = new THREE.Mesh(geo, LINE), G = new THREE.Group(); m.castShadow = m.receiveShadow = true; hull.scale.set(1 + 2 * T / w, 1 + 2 * T / h, 1 + 2 * T / d); G.position.set(x, y, 0); G.add(m, hull); to.add(G); return G; };
    part(12 * s, 8 * s, .62, .045, 0, 6 * s); part(14 * s, 2 * s, .44, .045, -s, 5 * s);
    const arm = new THREE.Group(), hand = new THREE.Object3D(); arm.position.set(5.6 * s, 5 * s, 0); cl.add(arm); part(2.4 * s, 2 * s, .44, .045, 1.2 * s, 0, arm); hand.position.set(2.2 * s, 0, 0); arm.add(hand);
    const legs = [3, 5, 10, 12].map(c => { const G = part(s, HIP, .3, .025, (c - 7.5) * s, HIP); G.children.forEach(m => m.position.y = -HIP / 2); return G; });   // hinged at the hip
    const put = (geo, col, x, y, z, o = {}) => { const m = new THREE.Mesh(geo, flat(col, o)); m.position.set(x, y, z); cl.add(m); return m; }, Z = .314;
    [-1, 1].forEach(k => { const x = k * 3.5 * s, y = 7 * s;   // big eyes: a dark plate, an iris, two highlights; a blush under each
      put(new THREE.ShapeGeometry(rr(s * 1.25, s * 2.2, .045)), '#1A1638', x, y, Z); put(new THREE.ShapeGeometry(rr(s * .95, s * 1.0, .04)), '#3F56C4', x, y - s * .5, Z + .002);
      put(new THREE.CircleGeometry(.032, 16), '#FFFFFF', x - .03, y + s * .62, Z + .004); put(new THREE.CircleGeometry(.014, 12), '#FFFFFF', x + .035, y - s * .55, Z + .004);
      put(new THREE.CircleGeometry(.075, 20), '#FF8296', k * .63, y - s * 1.75, Z, { transparent: true, opacity: .6 }).scale.set(1.45, .62, 1); });
    const mouth = put(new THREE.CircleGeometry(.055, 20, Math.PI, Math.PI), '#7A2430', 0, 5.2 * s, Z);
    // the hill and its grass
    const land = new THREE.Group(); sc.add(land); const hill = new THREE.Mesh(new THREE.SphereGeometry(9, 96, 48), toon('#3FA24A')); hill.position.y = -9; hill.receiveShadow = true; land.add(hill);
    const U = { uT: { value: 0 }, uScroll: { value: 0 }, uWind: { value: .2 }, uSh: { value: V(.5, -.5, 1) }, uShC: { value: new THREE.Color('#1F7A43') } };
    const bgeo = new THREE.BufferGeometry(), N = 30000; bgeo.setAttribute('position', new THREE.Float32BufferAttribute([-.5, 0, 0, .5, 0, 0, -.32, .5, .08, .32, .5, .08, 0, 1, .3], 3)); bgeo.setAttribute('color', new THREE.Float32BufferAttribute([.5, .5, .5, .5, .5, .5, .82, .82, .82, .82, .82, .82, 1.12, 1.12, 1.12], 3)); bgeo.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]);
    const phs = new Float32Array(N), blades = new THREE.InstancedMesh(bgeo, new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, vertexColors: true, side: THREE.DoubleSide }), N), d = new THREE.Object3D(), col = new THREE.Color(), GR = ['#3FA84A', '#58C257', '#7BD45F', '#2F9146', '#58C257'];
    for (let i = 0; i < N; i++) { const x = (R() - .5) * 11.6, z = -3.2 + R() * 10.6, y = Math.sqrt(Math.max(0, 81 - x * x - z * z)) - 9;
      d.position.set(x, y - .02, z); d.rotation.set(0, R() * 6.28, 0); d.rotateOnWorldAxis(ZA, -.28 - R() * .3); d.scale.set(.035 + R() * .035, .16 + R() * R() * .36, 1); d.updateMatrix(); blades.setMatrixAt(i, d.matrix);
      blades.setColorAt(i, col.set(GR[R() * GR.length | 0])); phs[i] = R() * 6.28; }
    bgeo.setAttribute('aPh', new THREE.InstancedBufferAttribute(phs, 1)); blades.frustumCulled = false; land.add(blades);
    const dots = new THREE.InstancedMesh(new THREE.CircleGeometry(.03, 12), new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, defines: { DAISY: 1 } }), 260);   // daisies, always facing the camera
    d.rotation.set(0, 0, 0); for (let i = 0; i < 260; i++) { const x = (R() - .5) * 9, z = -2.5 + R() * 6.5, y = Math.sqrt(81 - x * x - z * z) - 9; d.position.set(x, y + .16 + R() * .14, z); d.scale.setScalar(.5 + R() * .6); d.updateMatrix(); dots.setMatrixAt(i, d.matrix); }
    dots.frustumCulled = false; land.add(dots);
    // the balloon: a unit sphere with its hull, a knot and a cel highlight; scaled and turned to the camera every frame
    const bal = new THREE.Group(), sph = new THREE.SphereGeometry(1, 40, 24), kn = new THREE.ConeGeometry(.17, .22, 12); sc.add(bal); bal.add(new THREE.Mesh(sph, toon('#EE3F2A')), new THREE.Mesh(sph, LINE), new THREE.Mesh(kn, toon('#C9432A')), new THREE.Mesh(kn, LINE));
    bal.children[1].scale.setScalar(1.09); bal.children[2].position.y = bal.children[3].position.y = -1.06; bal.children[3].scale.setScalar(1.45);
    [[-.4, .42, .2, 1.5], [-.14, .68, .07, 1]].forEach(([x, y, r, k]) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 16), flat('#FFE3D6')); m.position.set(x, y, 1.02); m.scale.set(1, k, 1); m.rotation.z = .6; bal.add(m); });
    const pc = new THREE.PerspectiveCamera(34, FW / FH, .1, 200), oc = new THREE.OrthographicCamera(-540 / PX, 540 / PX, 960 / PX, -960 / PX, .1, 100); oc.position.set(0, 0, 30);
    const sun = new THREE.DirectionalLight(0xFFF6E6, 2.3); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.002; Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 20 }); sc.add(new THREE.HemisphereLight(0xCFE0FF, 0x86B46E, 1.15), sun, sun.target);

    // 3. the lens: a warm leak from the sun's corner and two ghosts (fixed), and the canvas of everything that moves in 2D
    const lens = cv(), lx = lens.getContext('2d'); el.append(lens);
    g = lx.createRadialGradient(-60, 60, 0, -60, 60, 1250); g.addColorStop(0, 'rgba(255,246,214,.85)'); g.addColorStop(.3, 'rgba(255,240,200,.3)'); g.addColorStop(1, 'rgba(255,240,200,0)'); lx.fillStyle = g; lx.fillRect(0, 0, FW, FH);
    [[330, 420, 54, '120,200,255', .13], [520, 610, 84, '255,200,150', .08]].forEach(([a, c, r, rgb, al]) => { lx.fillStyle = `rgba(${rgb},${al})`; lx.beginPath(); lx.arc(a, c, r, 0, 7); lx.fill(); });
    const ov = cv(); el.append(ov);
    Object.assign(this, { r3, sc, pc, oc, sun, cl, arm, hand, legs, mouth, land, bal, U, bgc, lens, x: ov.getContext('2d'), q1: new THREE.Quaternion(), q2: new THREE.Quaternion(), eu: new THREE.Euler() });
  },
  // --- 2D helpers -------------------------------------------------------------------------------------------------------------------------
  petal(px, py, rot, rx, ry, i, al = .92) { const x = this.x; x.save(); x.translate(px, py); x.rotate(rot); x.fillStyle = `rgba(255,${225 + (i * 7) % 30},${235 + (i * 3) % 20},${al})`; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 7); x.fill(); x.restore(); },
  string(a, m, e) { const x = this.x; x.lineCap = 'round'; [[8, INK], [3.5, '#FFF6E6']].forEach(([w, c]) => { x.lineWidth = w; x.strokeStyle = c; x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo(m[0], m[1], e[0], e[1]); x.stroke(); }); },
  burst(cx, cy, n, r0, seed) { const x = this.x; x.fillStyle = '#0E0B1A'; for (let i = 0; i < n; i++) { const a = (i + h2(i, seed)) / n * TAU, w = .008 + .03 * h2(i, seed + 3), r = r0 * (.7 + .9 * h2(i, seed + 5)); x.beginPath(); x.moveTo(cx + Math.cos(a - w) * 2600, cy + Math.sin(a - w) * 2600); x.lineTo(cx + Math.cos(a + w) * 2600, cy + Math.sin(a + w) * 2600); x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); x.fill(); } },   // black speed lines toward one point
  star(cx, cy, r, rot, col) { const x = this.x; x.fillStyle = col; x.beginPath(); for (let i = 0; i < 8; i++) { const a = rot + i * TAU / 8, q = i % 2 ? r * .16 : r; x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } x.fill(); },

  // --- shot A: the hill ---------------------------------------------------------------------------------------------------------------------
  shotA(u, S, f) {
    const { cl, pc, x, U } = this, lp = S.marks.leap, e1 = lp - .42, e2 = lp - .17, dist = VRUN * (Iss(2.35, 2.9, u) - Iss(e1, e2, u)), spd = ss(2.35, 2.9, u) * (1 - ss(e1, e2, u)), ph = dist * 2.3, air = u >= lp ? 1 : 0;
    // Clawd: he looks up, crouches, runs (the legs scissor, the body bounces and leans), plants his feet, crouches deep and goes
    const cr = .26 * ss(1.95, 2.2, u) * (1 - ss(2.3, 2.45, u)) + .36 * ss(lp - .32, lp - .1, u) * (1 - air), sy = 1 - cr + .05 * Math.sin(ph * 2) * spd + .3 * air, sx = 1 / Math.sqrt(sy);
    cl.position.set(air * (.3 + 4 * (u - lp)), .16 + .1 * Math.abs(Math.sin(ph)) * spd + air * (1 + 20 * (u - lp)), 0); cl.scale.set(sx, sy, sx);
    cl.rotation.set(-.26 * (1 - ss(1.75, 2.1, u)) - .16 * ss(lp - .3, lp - .08, u), .3 + .14 * (1 - ss(1.75, 2.1, u)) + .12 * spd, -.15 * spd - .3 * air);
    this.legs.forEach((L, i) => { const a = ph + i * Math.PI; L.rotation.z = .55 * Math.sin(a) * spd; L.position.y = HIP + .06 * Math.max(0, Math.cos(a)) * spd; });
    this.arm.rotation.z = .25 * Math.sin(ph) * spd + 1.1 * air; this.arm.scale.x = 1; this.mouth.scale.setScalar(1 + .7 * ss(lp - .3, lp - .1, u));
    U.uT.value = u; U.uScroll.value = dist / 9; U.uWind.value = .2 + .5 * bump((u - .2) / 1.4); U.uSh.value.set(.5, -.5, 1 - air);
    // the camera: wide at first, then low and close beside him for the run; it tilts up when he crouches
    const k1 = eio(clamp((u - 1.9) / 1.2)), k2 = ss(lp - .4, lp, u);
    pc.position.set(lerp(-2.6, -1.9, k1), lerp(1.1, .75, k1), lerp(10.6, 9.4, k1)); pc.lookAt(.55, lerp(1.55, 1.3, k1) + .5 * k2 + .6 * air, 0); pc.updateMatrixWorld();
    const fw = pc.getWorldDirection(V()), px = v => { v.project(pc); return [(v.x + 1) * 540, (1 - v.y) * 960]; }, hz = px(V(fw.x, 0, fw.z).multiplyScalar(1e5).add(pc.position))[1];
    this.sky(hz, -9 * dist, 830 - 5 * dist, 1);
    // the balloon: on the anchor, then the wind takes it up and ahead of him
    const bx = A.x + 95 * ss(.8, 2.6, u) + 10 * Math.sin(u * 1.1) * ss(.5, 1.5, u), by = A.y - 150 * ss(.8, 2.8, u) + 8 * Math.sin(u * 1.7) * ss(.5, 1.5, u), br = A.r * (1 - .2 * ss(.8, 3, u));
    const dir = V(bx / 540 - 1, 1 - by / 960, .5).unproject(pc).sub(pc.position); this.bal.position.copy(dir.multiplyScalar(11 / dir.dot(fw)).add(pc.position)); this.bal.scale.setScalar(br * 11 / FOC); this.bal.quaternion.copy(pc.quaternion);
    this.sun.position.set(-4, 7, 5); this.sun.target.position.set(0, 0, 0); this.land.visible = true; this.r3.render(this.sc, pc);
    x.clearRect(0, 0, FW, FH); const kn = [bx, by + br * 1.17], len = 215 * br / 64, tr = 40 * ss(.8, 1.6, u), [cx, cy] = px(V(0, .8, 0));
    if (f === 0) {   // impact frame 1: white, black speed lines, his silhouette; only the balloon keeps its colour
      x.fillStyle = '#fff'; x.fillRect(0, 0, FW, FH); this.burst(cx, cy + 150, 80, 300, 1);
      x.save(); x.translate(cx + 70, cy - 170); x.rotate(-.3); x.transform(1, 0, -.25, 1, 0, 0); const c = 44, rc = ([a, r, w, h], p) => x.fillRect((a - 8) * c - p, (r - 5) * c * 1.35 - p, w * c + 2 * p, h * c * 1.35 + 2 * p);
      x.fillStyle = '#0E0B1A'; CLAWD.body.forEach(q => rc(q, 4)); x.fillStyle = '#fff'; CLAWD.eyes.forEach(q => rc(q, 0)); x.restore();
      x.fillStyle = FILM.RED; x.beginPath(); x.arc(bx, by, br, 0, 7); x.fill(); x.lineWidth = 8; x.strokeStyle = '#0E0B1A'; x.stroke(); this.string(kn, [kn[0] - tr, kn[1] + len * .5], [kn[0] - tr * 1.6, kn[1] + len]); return; }
    this.string(kn, [kn[0] + 14 * Math.sin(u * 2.3) - tr, kn[1] + len * .5], [kn[0] + 22 * Math.sin(u * 2.3 + .8) - tr * 1.6, kn[1] + len]);
    if (f === 1) { const [ax, ay] = px(cl.position.clone().add(V(0, 1, 0))); this.burst(ax, ay, 46, 480, 2); return; }   // impact frame 2: the picture inverted (CSS), thinner lines
    for (let i = 0; i < 22; i++) { const k = h2(i, 5), st = 1 + 3.5 * spd, py = 160 + mod(h2(i, 2) * 1500 + 30 * u + 40 * Math.sin(u * 1.3 + i), 1500); this.petal(mod(h2(i, 1) * 1280 + 70 * u - (140 + 260 * k) * dist, FW + 200) - 100, py, (u * (1 + k) * 2 + i) * (1 - spd), (9 + 9 * k) * st, (4 + 4 * h2(i, 3)) * (1 - .35 * spd), i, Math.abs(py - cy) < 260 ? .92 * (1 - spd) : .92); }   // petals: drifting, then streaming past
    if (spd > 0) for (let i = 0; i < 18; i++) { const y = 120 + 1740 * h2(i, 7), len = 260 + 520 * h2(i, 8); if (Math.abs(y - cy) < 250) continue;   // speed lines, never across his face
      x.fillStyle = `rgba(255,255,255,${(.25 + .4 * h2(i, 4)) * spd})`; x.fillRect(mod(h2(i, 9) * 3000 - 2700 * u * (1 + .5 * h2(i, 3)), FW + len + 500) - len - 250, y, len, 3 + 4 * h2(i, 6)); }
  },

  // --- shot B and the finale: the sky -------------------------------------------------------------------------------------------------------
  place(g, X) {   // Clawd's body centre at screen (g.x, g.y), g.w pixels wide, tilted by g.rot; returns where his hand is on screen
    const { cl } = this, k = g.w / 300, q = this.q1.setFromAxisAngle(ZA, -g.rot).multiply(this.q2.setFromEuler(this.eu.set(X.pitch, .28, 0, 'YXZ')));
    cl.quaternion.copy(q); cl.scale.setScalar(k); cl.position.set((g.x - 540) / PX, (960 - g.y) / PX, 0).sub(V(0, 5 * s * k, 0).applyQuaternion(q));
    this.arm.rotation.z = 1.05 * X.arm; this.arm.scale.x = 1 + (1.9 + X.stretch) * X.arm; this.legs.forEach(L => { L.rotation.z = g.rot * .8; L.position.y = HIP; }); this.mouth.scale.setScalar(X.mouth);
    cl.updateMatrixWorld(true); const v = this.hand.getWorldPosition(V()); return [540 + v.x * PX, 960 - v.y * PX];
  },
  rig(g, tt, X) {
    X = { arm: 1, stretch: 0, pitch: -.14, mouth: 1, hz: 1560, streak: 0, spark: -1, ...X }; const { x } = this, hand = this.place(g, X);
    this.bgc.style.filter = this.r3.domElement.style.filter = ''; this.lens.style.display = ''; this.sky(X.hz, -6 * tt, 760 - 3 * tt, 1.4);
    this.bal.position.set((g.bx - 540) / PX, (960 - g.by) / PX, 0); this.bal.scale.setScalar(g.br / PX); this.bal.quaternion.identity();
    this.sun.position.copy(this.cl.position).add(V(-4, 7, 5)); this.sun.target.position.copy(this.cl.position); this.land.visible = false; this.r3.render(this.sc, this.oc);
    x.clearRect(0, 0, FW, FH);
    for (let i = 0; i < 26; i++) { const k = h2(i, 3), len = 300 + 500 * k, y = mod(h2(i, 1) * 2500 + 5200 * (tt + 9) * (.6 + k), FH + len) - len, xs = h2(i, 2) * 1300; if (X.streak <= 0) break;   // the air rushing down past him
      x.strokeStyle = `rgba(255,255,255,${.55 * X.streak * (.4 + .6 * h2(i, 4))})`; x.lineWidth = 3 + 5 * h2(i, 5); x.beginPath(); x.moveTo(xs, y); x.lineTo(xs - len * .2, y + len); x.stroke(); }
    const kn = [g.bx, g.by + g.br * 1.17], end = X.end ? X.end(kn) : hand, sl = X.end ? 0 : 12; this.string(kn, [(kn[0] + end[0]) / 2 + sl, (kn[1] + end[1]) / 2 + sl], end);
    for (let i = 0; i < 18; i++) { const k = h2(i, 5); this.petal(mod(h2(i, 1) * 1200 + (40 + 50 * k) * tt, FW + 120) - 60, mod(h2(i, 2) * 2000 + (25 + 30 * k) * tt + 30 * Math.sin(tt * .9 + i), FH + 100) - 50, tt * (1 + k) + i, 9 + 9 * k, 4 + 4 * h2(i, 3), i); }
    if (X.spark >= 0 && X.spark < 1) { const t = X.spark, [hx, hy] = hand;   // the catch: a flash, a four-pointed star, a ring, and a shimmer that holds
      x.fillStyle = `rgba(255,255,255,${.6 * Math.exp(-t * 16)})`; x.fillRect(0, 0, FW, FH);
      x.strokeStyle = `rgba(255,255,255,${Math.max(0, .85 - t * 2.4)})`; x.lineWidth = 7 * (1 - t); x.beginPath(); x.arc(hx, hy, 50 + 430 * t, 0, 7); x.stroke();
      const r = 210 * Math.min(1, t / .07) * Math.exp(-t * 3.2); this.star(hx, hy, r, t * .9, '#FFFFFF'); this.star(hx, hy, r * .5, t * .9 + TAU / 16, '#FFE9A8');
      for (let i = 0; i < 9; i++) { const a = i * 2.4 + 1, d = 70 + 280 * Math.pow(t, .6) * (.6 + .4 * h2(i, 2)), tw = .5 + .5 * Math.sin(t * 26 + i * 2); this.star(hx + Math.cos(a) * d, hy + Math.sin(a) * d * .9, 30 * (1 - t) * tw + 4 * (1 - t), i, i % 2 ? '#FFE9A8' : '#FFFFFF'); } }
  },
  draw(u, S) {
    const lp = S.marks.leap, w = u - lp, f = Math.floor(w * 30 + 1e-3);
    if (f < 2) { this.bgc.style.filter = this.r3.domElement.style.filter = f === 1 ? 'invert(1)' : ''; this.lens.style.display = f === 0 ? 'none' : ''; return this.shotA(u, S, f); }
    // slow motion: he rises fast and slows near the top, one arm stretches, the hand closes on the end of the string 1.4 s into the leap; a hold; then he starts to fall into the finale's first pose
    const C = CATCH, Zc = C.w / 300, hc = this.hc || (this.hc = this.place(C, { arm: 1, stretch: .5, pitch: -.3, mouth: 1 })), brc = 64 * Zc, knc = [hc[0] + 12, hc[1] - 190 * Zc];   // the balloon is where the string's end meets his hand
    const t = clamp((w - .067) / 1.333), e = 1 - Math.pow(1 - t, 2.6), dt = Math.min(0, w - 1.4), tug = w > 1.4 ? 16 * Math.exp(-(w - 1.4) * 6) * Math.sin((w - 1.4) * 19) : 0, sK = eio(clamp((w - 1.85) / .5));
    const P = { x: lerp(250, C.x, e), y: lerp(2400, C.y, e) - 10 * ss(1.4, 1.9, w), rot: lerp(-.55, C.rot, e), w: lerp(540, C.w, e), bx: knc[0] + 34 * dt, by: knc[1] - brc * 1.17 - 50 * dt + tug, br: brc }, G = FILM.glidePose(Math.min(0, (u - S.dur) / KGL)), g = {};
    for (const k in P) g[k] = lerp(P[k], G[k], sK);
    this.rig(g, u - S.dur, { arm: ss(.35, 1.2, w), stretch: .5 * ss(1.15, 1.4, w) * (1 - ss(1.55, 2, w)), pitch: lerp(-.3, -.14, sK), mouth: 1.7 - .7 * ss(1.4, 1.6, w), hz: 1560 - 520 * (1 - e), streak: 1 - e, spark: w - 1.4,
      end: w < 1.4 ? kn => [kn[0] - 12 + 16 * Math.sin((w - 1.4) * 5), kn[1] + 190 * Zc] : null });
  },
  glide(g) { this.rig(g, g.k * KGL); },
  sfx: {
    an_gust: { prompt: 'a soft warm summer gust of wind passing through tall grass on a hill, gentle rustle rising and falling, no music, no speech', dur: 2 },
    an_crouch: { prompt: 'a quick rustle of grass as someone crouches low, short and soft, no music, no speech', dur: .5 },
    an_steps: { prompt: 'fast light running footsteps through tall grass, quick steady rhythm, cartoon, no music, no speech', dur: 2.8 },
    an_impact: { prompt: 'anime take-off impact, one sharp deep boom with a burst of air and a fast rising whoosh, no music, no speech', dur: 1.2 },
    an_rise: { prompt: 'air rushing past quickly then fading away into near silence, slow motion feeling, no music, no speech', dur: 1.5 },
    an_catch: { prompt: 'a bright magical sparkle, one clear high chime followed by a long held glittering shimmer, no music, no speech', dur: 2.6 } },
  amb: { prompt: 'summer afternoon on a hill above the sea, loud cicadas, soft sea wind and distant waves, no music, no speech', gain: -22 },
  cues(S) { const lp = +S.marks.leap.toFixed(2); return [['an_gust', .25, -6], ['an_crouch', 1.95, -8], ['an_steps', 2.38, -5], ['an_crouch', +(lp - .32).toFixed(2), -6], ['an_impact', lp, -1], ['an_rise', +(lp + .1).toFixed(2), -6], ['an_catch', +(lp + 1.4).toFixed(2), -2]]; }
});
})();
