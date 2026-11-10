// balloon/sc_studio.js: scene 10 of THE BALLOON, STUDIO PHOTO. The path tracer of styles8/s9_pathtrace.js, grown into a scene: a ceramic Clawd on a paper sweep
// with a glass ball, a brass ball and the red balloon. Before the flash the picture is a camera's live preview (one ray per pixel, direct light only, no bounces);
// on the flash the same shader starts following real light paths and the photo develops: 1, 2, 4 ... 512 rays per pixel, and the counter in the viewfinder shows
// the true number of rays in that frame. Everything is a pure function of u: pose(u, S) -> uniforms, shot(P) accumulates the passes, overlay(P) draws the viewfinder.
(() => {
const FOC = 2.3, A = FILM.ANCHOR, DB = 10.6, BR = A.r * DB / (FW * FOC), INK = '#141413', PAPER = '#E9E6DF', LOCK = '#0B8A3E', MAXR = 512;
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], norm = a => mul(a, 1 / Math.hypot(...a)), mix3 = (a, b, k) => add(mul(a, 1 - k), mul(b, k)), mix = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }, bump = x => x > 0 && x < 1 ? Math.sin(Math.PI * x) : 0;
const camOf = (ro, ta) => { const f = norm(sub(ta, ro)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f); return { ro, f, r, u }; };
const unproj = (c, x, y, d) => add(c.ro, mul(add(add(mul(c.f, FOC), mul(c.r, (x - FW / 2) / FW)), mul(c.u, (FH / 2 - y) / FW)), d / FOC));   // the point that is drawn at screen (x, y), d units in front of the camera
const proj = (c, p) => { const v = sub(p, c.ro), z = dot(v, c.f); return [FW / 2 + FW * FOC * dot(v, c.r) / z, FH / 2 - FW * FOC * dot(v, c.u) / z]; };
const pulse = (L, u, w = .2) => L.words.reduce((m, [, a]) => Math.max(m, bump((u - L.t0 - a) / w)), 0);   // one bump per spoken word
const RO0 = [1, 1.5, 12.2], TA0 = [0, .6, 0], C0 = camOf(RO0, TA0), GLASS = [1.42, -.6, 1.25], B0 = unproj(C0, A.x, A.y, DB), TOG = norm(sub(GLASS, RO0));
const rotOf = (yaw, tilt) => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, yaw, tilt, 'ZYX')), o2w = (p, P) => add(new THREE.Vector3(...p).applyMatrix4(rotOf(P.yaw, P.tilt)).toArray(), P.cl);

// accumGL of styles8/core.js with a pass count per frame and the scene's own uniforms; the shaders are compiled off the main thread
async function accum(stage, frag, uni) {
  const r3 = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true }); r3.setPixelRatio(1); r3.setSize(FW, FH, false); r3.domElement.style.cssText = 'position:absolute;left:0;top:0'; stage.append(r3.domElement);
  if (!r3.getContext().getExtension('EXT_float_blend')) throw new Error('EXT_float_blend missing: cannot accumulate into a float target');
  const rt = new THREE.WebGLRenderTarget(FW, FH, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false }), geo = new THREE.PlaneGeometry(2, 2), cam = new THREE.Camera();
  const mk = (fs, o) => { const m = new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: 'in vec3 position; void main() { gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: fs, depthTest: false, depthWrite: false, ...o }), s = new THREE.Scene(), q = new THREE.Mesh(geo, m); q.frustumCulled = false; s.add(q); return [m, s]; };
  const [pm, ps] = mk(frag, { uniforms: { uSeed: { value: 0 }, uInv: { value: 1 }, uZ: { value: 0 }, ...uni }, transparent: true, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor });
  const [, sc] = mk(`precision highp float; precision highp sampler2D; uniform sampler2D tA; out vec4 o;
    void main() { vec3 c = texelFetch(tA, ivec2(gl_FragCoord.xy), 0).rgb; c = clamp(c * (2.51 * c + .03) / (c * (2.43 * c + .59) + .14), 0., 1.); c = pow(c, vec3(1. / 2.2));
      vec2 q = gl_FragCoord.xy / vec2(1080., 1920.) - .5; c *= 1. - dot(q, q) * .3; c += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - .5) * .016; o = vec4(c, 1.); }`, { uniforms: { tA: { value: rt.texture } } });
  r3.setRenderTarget(rt); await r3.compileAsync(ps, cam); r3.setRenderTarget(null); await r3.compileAsync(sc, cam);
  return { U: pm.uniforms, render(passes, seed) { r3.autoClear = false; r3.setRenderTarget(rt); r3.setClearColor(0, 0); r3.clear(); pm.uniforms.uInv.value = 1 / passes; for (let i = 0; i < passes; i++) { pm.uniforms.uSeed.value = seed + i; r3.render(ps, cam); } r3.setRenderTarget(null); r3.render(sc, cam); } };
}

FILM.add({ id: 'studio',
  async init(el) {
    const v3 = () => ({ value: new THREE.Vector3() }), f = x => ({ value: x });
    this.gl = await accum(el, FRAG, { uMode: f(0), uFoc: f(10), uAp: f(.2), uArm: f(0), uEye: f(0), uSr: f(.008), uSpp: f(1), uRo: v3(), uFw: v3(), uRt: v3(), uUp: v3(), uCl: v3(), uSa: v3(), uSb: v3(), uM: { value: new THREE.Matrix3() }, uSph: { value: [0, 1, 2, 3, 4].map(() => new THREE.Vector4()) } });
    // the viewfinder: frame corners, focus brackets, the exposure readout and the ray counter
    el.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 ${FW} ${FH}" width="${FW}" height="${FH}" style="position:absolute;left:0;top:0;font:700 30px 'JetBrains Mono',monospace" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="square">
      <g class="fr"><path d="M56 126V56h70M954 56h70v70M1024 1794v70h-70M126 1864H56v-70"/><path stroke-width="2" d="M540 944v32M524 960h32${[...Array(13)].map((_, i) => `M${396 + i * 24} ${i % 3 ? 1820 : 1812}V1832`).join('')}"/><path class="rdy" fill="${INK}" stroke="none" d="M612 108l-22 30h16l-8 24 24-32h-16z"/>
        <g fill="${INK}" stroke="${PAPER}" stroke-width="7" stroke-linejoin="round" paint-order="stroke" xml:space="preserve"><text x="92" y="140">f/2.8  1/125  ISO 100</text><text class="md" x="92" y="182" font-size="21" letter-spacing="2"></text><text x="92" y="1836" font-size="21" letter-spacing="2">AF-S  RAW</text><text x="988" y="1836" font-size="21" letter-spacing="2" text-anchor="end">50 mm</text><path d="M540 1800l-9 -12h18z"/></g></g>
      <path class="br" stroke-width="4"/><circle class="dot" r="7" stroke="none"/><text class="cn" x="988" y="140" text-anchor="end" fill="${INK}" stroke="${PAPER}" stroke-width="7" stroke-linejoin="round" paint-order="stroke" xml:space="preserve"></text></svg><div class="wh" style="position:absolute;left:0;top:0;width:${FW}px;height:${FH}px;background:#fff;opacity:0"></div>`);
    this.q = Object.fromEntries(['svg', '.fr', '.rdy', '.md', '.br', '.dot', '.cn', '.wh'].map(s => [s.replace('.', ''), el.querySelector(s)]));
  },
  shot(P) {
    const U = this.gl.U, c = P.cam; U.uRo.value.set(...c.ro); U.uFw.value.set(...c.f); U.uRt.value.set(...c.r); U.uUp.value.set(...c.u); U.uCl.value.set(...P.cl); U.uSa.value.set(...P.sa); U.uSb.value.set(...P.sb);
    U.uM.value.setFromMatrix4(rotOf(P.yaw, P.tilt)).transpose(); P.sph.forEach((s, i) => U.uSph.value[i].set(...s));
    U.uMode.value = P.mode; U.uSpp.value = P.spp; U.uFoc.value = P.foc; U.uAp.value = P.ap; U.uArm.value = P.arm; U.uEye.value = P.eye; U.uSr.value = P.sr; this.gl.render(P.passes, P.seed);
  },
  overlay(V) {
    const q = this.q; q.svg.style.display = V ? 'block' : 'none'; q.wh.style.opacity = V ? V.white : 0; if (!V) return;
    const [x, y] = V.at, w = 175 * V.s, h = 140 * V.s, l = 46, col = V.lock ? LOCK : INK;
    q.br.setAttribute('d', `M${x - w} ${y - h + l}V${y - h}h${l}M${x + w - l} ${y - h}h${l}v${l}M${x + w} ${y + h - l}v${l}h${-l}M${x - w + l} ${y + h}h${-l}v${-l}`); q.br.setAttribute('stroke', col); q.br.style.opacity = V.brackets;
    q.dot.setAttribute('cx', x + w + 30); q.dot.setAttribute('cy', y - h + 8); q.dot.setAttribute('fill', LOCK); q.dot.style.opacity = V.lock ? V.brackets : 0;
    q.fr.style.opacity = V.frame; q.rdy.style.opacity = V.ready; q.cn.style.opacity = V.count; q.md.textContent = V.rays ? 'PATH TRACING · 7 BOUNCES' : 'LIVE PREVIEW · DIRECT LIGHT ONLY'; q.cn.textContent = 'RAYS/PX ' + (V.rays ? String(V.rays).padStart(3, '0') : '---');
  },
  pose(u, S) {
    const [L0, L1] = S.lines, mk = S.marks.flash, fl = mk + .5, out = S.marks.out, dev0 = fl + 1 / 30, dev1 = dev0 + 1.65, live = u < dev0 - 1e-3;   // flash at fl; the photo develops from dev0 to dev1
    // the camera: hand-held while the photographer talks, locked off for the exposure, then a slow dolly, and at the end it eases toward the glass ball
    const hand = ss(L0.t0 - .2, L0.t0 + .3, u) * (1 - ss(L0.t0 + L0.dur - .1, L0.t0 + L0.dur + .35, u)), dol = ss(dev1, out + .4, u), toG = ss(out, out + 1.6, u);
    const ro = add(add(RO0, mul(C0.f, .8 * dol)), mul(TOG, .9 * toG)), ta = mix3(add(TA0, [hand * (.16 * Math.sin(u * 2.6) + .05 * Math.sin(u * 6.3)), hand * .1 * Math.sin(u * 3.4 + 1), 0]), GLASS, .4 * toG), c = camOf(ro, ta);
    // Clawd: while he answers he shuffles from foot to foot and glances away; he is perfectly still from the mark on
    const t1 = u - L1.t0, e1 = ss(0, .3, t1) * (1 - ss(mk - .35, mk - .03, u)), P = { cam: c, arm: 0, ap: .2, sr: .008 };
    P.cl = [.09 * Math.sin(t1 * 2.4) * e1, .04 * pulse(L1, u, .24) * e1, 0]; P.yaw = .4 + .07 * Math.sin(t1 * 2.4 + 1) * e1; P.tilt = .025 * Math.sin(t1 * 4.8) * e1;
    P.eye = -.16 * (ss(.9, 1.3, t1) - ss(2.3, 2.7, t1)) + .14 * (ss(2.9, 3.2, t1) - ss(3.6, 3.95, t1));
    if (live) Object.assign(P, { mode: 0, passes: 1, spp: 1, rays: 0, seed: Math.round(Math.min(u, mk) * 30) });
    else { const n = clamp(Math.floor(2 ** (9 * (u - dev0) / 1.65) + 1e-6), 1, MAXR), spp = n < 8 ? 1 : 4, passes = Math.round(n / spp); Object.assign(P, { mode: 1, passes, spp, rays: passes * spp, seed: u < dev1 + .02 ? 0 : Math.round(u * 30) * 131 }); }   // the same seeds while it develops, so the grain only ever clears
    const face = o2w([0, .35, .5], P), dG = dot(sub(GLASS, ro), c.f), dF = dot(sub(face, ro), c.f);
    P.foc = mix(mix(dG, dF, ss(dev1 + .3, dev1 + 2.4, u)), (dG + DB) / 2, ss(out, out + 1.3, u));                 // the focus pull: glass ball -> his face
    const b = mix3(B0, unproj(c, A.x, A.y + 3 * Math.sin(u * 2.1), DB), ss(dev1 + 1, S.dur, u));                 // the balloon hangs in the set, then drifts back onto the anchor
    P.sph = [[...GLASS, .5], [-1.5, -.72, 1.2, .38], [-.92, -.87, 2.15, .23], [...b, BR], [b[0], b[1] - BR * 1.05, b[2], BR * .13]];
    P.sa = sub(b, [0, BR * 1.12, 0]); P.sb = add(P.sa, [.05 * Math.sin(u * 1.1), -.95, .03 * Math.cos(u * .9)]);
    const tl = L0.t0 + L0.dur + .12, k = clamp((u - tl) / .14);
    P.vf = { at: proj(c, face), s: u < tl ? 1.22 + .07 * Math.sin(u * 11) * hand + .12 * pulse(L0, u) : 1 + .22 * (1 - k) * (1 - k), lock: u >= tl, brackets: u < fl - 1e-3 ? 1 : 0, ready: u >= mk - 1e-3 ? 1 : .15,
      white: u < fl - 1e-3 ? 0 : Math.exp(-Math.max(0, u - dev0 + 1e-3) * 13), rays: P.rays, frame: 1 - ss(dev1 + .3, dev1 + 1, u), count: 1 - ss(out - .4, out, u) };
    return P;
  },
  draw(u, S) { const P = this.pose(u, S); this.shot(P); this.overlay(P.vf); },
  // the finale: the paper sweep seen from far away, the three balls on the floor, and he hangs from the balloon by one raised arm (128 rays per pixel)
  glide(g) {
    const d = FW * FOC * 3.2 / g.w, c = camOf([0, 4.9, d], [0, 4.9, 0]), P = { cam: c, yaw: -.22, tilt: -g.rot, arm: 1.1, eye: 0, mode: 1, passes: 32, spp: 4, seed: Math.round(g.k * 997) * 131, foc: d, ap: .1, sr: .022 };
    P.cl = unproj(c, g.x, g.y, d); const b = unproj(c, g.bx, g.by, d), r = g.br * d / (FW * FOC);
    P.sph = [[2.9, -.3, 6.5, .8], [-3.6, -.55, 3, .55], [-2.6, -.7, 7.5, .4], [...b, r], [b[0], b[1] - r * 1.05, b[2], r * .13]]; P.sa = sub(b, [0, r * 1.12, 0]); P.sb = o2w([1.52, .86, 0], P);
    this.shot(P); this.overlay(null);
  },
  sfx: {
    cam_hunt: { prompt: 'camera lens autofocus motor hunting back and forth, quiet servo whirr, no music, no speech', dur: 1.6 },
    cam_beep: { prompt: 'camera autofocus confirmation, two short high electronic beeps, no music, no speech', dur: .5 },
    clawd_shuffle: { prompt: 'small ceramic figurine shuffling on paper, two soft scrapes and a light tap, no music, no speech', dur: .9 },
    flash_charge: { prompt: 'camera flash capacitor charging, thin electronic whine rising in pitch, no music, no speech', dur: 1.2 },
    flash_pop: { prompt: 'camera shutter click with a loud studio flash pop, no music, no speech', dur: .9 },
    photo_develop: { prompt: 'fine static grain hissing and clearing into silence, like noise settling, soft and airy, no music, no speech', dur: 1.8 },
    lens_glide: { prompt: 'smooth quiet camera lens focus ring turning, soft mechanical glide, no music, no speech', dur: 1.5 }
  },
  amb: { prompt: 'quiet photo studio room tone, faint hum of studio lights and ventilation, no music, no speech', gain: -26 },
  cues(S) { const [a, b] = S.lines, m = S.marks.flash, o = S.marks.out; return [['cam_hunt', a.t0 + .1, -8], ['cam_beep', a.t0 + a.dur + .12, -4], ['clawd_shuffle', b.t0 + .3, -8], ['clawd_shuffle', b.t0 + 2.3, -9], ['flash_charge', m - .65, -8], ['flash_pop', m + .47], ['photo_develop', m + .55, -6], ['lens_glide', m + 2.5, -10], ['lens_glide', o, -10]]; }
});

const FRAG = `precision highp float; precision highp int;
uniform float uSeed, uInv, uMode, uFoc, uAp, uArm, uEye, uSr;
uniform int uSpp, uZ;   // uZ is always 0: loops that start at a uniform are not unrolled by the HLSL compiler, which keeps the compile time sane
uniform vec3 uRo, uFw, uRt, uUp, uCl, uSa, uSb;
uniform mat3 uM;         // world -> Clawd
uniform vec4 uSph[5];    // glass ball, teal ball, brass ball, balloon, its knot
out vec4 o;
const vec2 RES = vec2(1080., 1920.); const float EXPO = .62, RC = 2.6;
uint st;
float rnd() { st = st * 747796405u + 2891336453u; uint w = ((st >> ((st >> 28u) + 4u)) ^ st) * 277803737u; return float((w >> 22u) ^ w) / 4294967296.; }
vec3 ball() { float z = rnd() * 2. - 1., a = 6.2832 * rnd(), r = sqrt(1. - z * z); return vec3(r * cos(a), r * sin(a), z); }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float sbox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.) - r; }
float body(vec3 p) {   // CLAWD_SDF of styles8/core.js, with one arm that can be raised to hold the string
  vec3 q = vec3(abs(p.x), p.y, p.z), a = p - vec3(1.1, 0., 0.); a.xy = rot(uArm) * a.xy; float al = .25 + .3 * min(uArm, 1.);
  float d = sbox(p - vec3(0., .2, 0.), vec3(1.2, .8, .5), .09); d = min(d, sbox(p + vec3(.8, 0., 0.), vec3(.8, .2, .3), .08)); d = min(d, sbox(a - vec3(al, 0., 0.), vec3(al, .2, .3), .08));
  d = min(d, sbox(q - vec3(.5, -.8, 0.), vec3(.1, .3, .3), .05)); return min(d, sbox(q - vec3(.9, -.8, 0.), vec3(.1, .3, .3), .05));
}
float eyes(vec3 p) { return sbox(vec3(abs(p.x - uEye) - .7, p.y - .4, p.z - .5), vec3(.1, .2, .03), .02); }
float sd(vec3 p) { return min(body(p), eyes(p)); }
// the nearest hit: its distance, normal and material (0 paper, 1 ceramic, 2 eye, 3 glass, 4 teal lacquer, 5 brass, 6 balloon, 7 string; -1 = the ray left the set)
float isect(vec3 ro, vec3 rd, out vec3 n, out int m) {
  float t = 1e9; m = -1; n = vec3(0.);
  if (rd.y < 0.) { float a = (-1.1 - ro.y) / rd.y; if (a > 1e-3 && ro.z + rd.z * a > RC - 6.) { t = a; n = vec3(0., 1., 0.); m = 0; } }
  if (rd.z < 0.) { float a = (-6. - ro.z) / rd.z; if (a > 1e-3 && a < t && ro.y + rd.y * a > RC - 1.1) { t = a; n = vec3(0., 0., 1.); m = 0; } }
  { vec2 oc = ro.yz - vec2(RC - 1.1, RC - 6.), d = rd.yz; float A = dot(d, d), B = dot(oc, d), h = B * B - A * (dot(oc, oc) - RC * RC);   // the sweep: the paper curves up from the floor to the wall
    if (h > 0. && A > 1e-9) { float a = (-B + sqrt(h)) / A; vec2 q = oc + d * a; if (a > 1e-3 && a < t && q.x < 0. && q.y < 0.) { t = a; n = vec3(0., -q / RC); m = 0; } } }
  for (int i = uZ; i < 5; i++) { vec4 s = uSph[i]; vec3 oc = ro - s.xyz; float b = dot(oc, rd), h = b * b - dot(oc, oc) + s.w * s.w;
    if (h > 0.) { h = sqrt(h); float a = -b - h; if (a < 1e-3) a = -b + h; if (a > 1e-3 && a < t) { t = a; n = (ro + rd * a - s.xyz) / s.w; m = i < 3 ? 3 + i : 6; } } }
  { vec3 ba = uSb - uSa, oa = ro - uSa; float baba = dot(ba, ba), bard = dot(ba, rd), baoa = dot(ba, oa), a = baba - bard * bard, b = baba * dot(rd, oa) - baoa * bard, h = b * b - a * (baba * dot(oa, oa) - baoa * baoa - uSr * uSr * baba);   // the string: a thin cylinder
    if (h > 0. && a > 1e-9) { float x = (-b - sqrt(h)) / a, y = baoa + x * bard; if (x > 1e-3 && x < t && y > 0. && y < baba) { t = x; n = (oa + rd * x - ba * y / baba) / uSr; m = 7; } } }
  vec3 oo = uM * (ro - uCl), od = uM * rd, inv = 1. / od, t0 = (vec3(-1.72, -1.12, -.62) - oo) * inv, t1 = (vec3(1.86, 1.3, .62) - oo) * inv, lo = min(t0, t1), hi = max(t0, t1);
  float tn = max(max(lo.x, lo.y), max(lo.z, 0.)), tf = min(min(hi.x, hi.y), min(hi.z, t));
  if (tn < tf) { float a = tn; for (int i = uZ; i < 80; i++) { vec3 p = oo + od * a; float d = sd(p); if (d < 6e-4) { vec3 g = vec3(0.); for (int j = uZ; j < 4; j++) { vec3 e = .5773 * (2. * vec3(((j + 3) >> 1) & 1, (j >> 1) & 1, j & 1) - 1.); g += e * sd(p + .001 * e); }
      n = normalize(g) * uM; m = eyes(p) < .002 ? 2 : 1; t = a; break; } a += d; if (a > tf) break; } }
  return t;
}
float softbox(vec3 d, vec3 n, float su, float sv) { float k = dot(d, n); if (k <= 0.) return 0.; vec3 u = normalize(cross(n, vec3(0., 1., 0.))), v = cross(u, n), p = d / k; return step(abs(dot(p, u)), su) * step(abs(dot(p, v)), sv); }
vec3 env(vec3 d) {   // the studio: a dim room, a big key softbox, a cool fill, a warm strip behind
  vec3 c = vec3(.13, .14, .17) * (.55 + .45 * d.y);
  c += softbox(d, normalize(vec3(-.62, .66, .42)), .3, .24) * vec3(1., .97, .92) * 34.;
  c += softbox(d, normalize(vec3(.9, .22, .38)), .3, .55) * vec3(.88, .94, 1.) * 1.3;
  c += softbox(d, normalize(vec3(.42, .5, -.76)), .07, .5) * vec3(1., .88, .76) * 11.;
  return c;
}
vec3 albedo(int m) { return m == 0 ? vec3(.74, .70, .64) : m == 1 ? vec3(.80, .17, .035) : m == 2 ? vec3(.012) : m == 3 ? vec3(.6, .68, .72) : m == 4 ? vec3(.04, .33, .37) : m == 5 ? vec3(.78, .56, .18) : m == 6 ? vec3(.68, .03, .02) : vec3(.16, .15, .14); }
vec3 trace(vec3 ro, vec3 rd) {   // the real thing: follow the light for up to seven bounces
  vec3 col = vec3(0.), thr = vec3(1.);
  for (int b = uZ; b < 7; b++) {
    vec3 n; int m; float t = isect(ro, rd, n, m); if (m < 0) { col += thr * env(rd); break; }
    vec3 p = ro + rd * t;
    if (m == 3) { float ci = dot(rd, n), eta = ci < 0. ? 1. / 1.5 : 1.5; vec3 nn = ci < 0. ? n : -n, rf = refract(rd, nn, eta); float c = ci < 0. ? -ci : dot(rf, n), F = rf == vec3(0.) ? 1. : .04 + .96 * pow(1. - clamp(c, 0., 1.), 5.);
      if (rnd() < F) { rd = reflect(rd, nn); ro = p + nn * .002; } else { rd = rf; ro = p - nn * .002; } continue; }
    if (m == 5) { rd = normalize(reflect(rd, n) + .05 * ball()); if (dot(rd, n) <= 0.) break; thr *= vec3(1., .74, .32); ro = p + n * .002; continue; }
    float F = m == 0 || m == 7 ? 0. : .04 + .96 * pow(1. - max(dot(-rd, n), 0.), 5.);
    if (rnd() < F) { rd = normalize(reflect(rd, n) + (m == 1 ? .09 : .03) * ball()); if (dot(rd, n) <= 0.) break; } else { rd = normalize(n + ball() * .999); thr *= albedo(m); }
    ro = p + n * .002;
  }
  return col;
}
vec3 preview(vec3 ro, vec3 rd) {   // the live preview: flat colour, the key light only, one hard shadow ray, nothing bounces and nothing refracts
  vec3 n; int m; float t = isect(ro, rd, n, m); if (m < 0) return vec3(.3);
  vec3 kn = normalize(vec3(-.62, .66, .42)), ku = normalize(cross(kn, vec3(0., 1., 0.))), kv = cross(ku, kn), L = normalize(kn + ku * (rnd() * 2. - 1.) * .3 + kv * (rnd() * 2. - 1.) * .24), n2; int m2;
  float nl = dot(n, L), sh = 0.; if (nl > 0.) { isect(ro + rd * t + n * .004, L, n2, m2); if (m2 < 0) sh = nl; }
  return albedo(m) * (.4 + 1.25 * sh);
}
void main() {
  st = uint(gl_FragCoord.x) * 1973u + uint(gl_FragCoord.y) * 9277u + uint(uSeed) * 26699u + 1u; rnd();
  vec3 acc = vec3(0.);
  for (int s = uZ; s < uSpp; s++) {
    if (uMode < .5) { vec2 uv = (gl_FragCoord.xy - .5 * RES) / RES.x; acc += preview(uRo, normalize(uFw * 2.3 + uRt * uv.x + uUp * uv.y)); continue; }
    vec2 uv = (gl_FragCoord.xy + vec2(rnd(), rnd()) - .5 - .5 * RES) / RES.x;
    vec3 rd = normalize(uFw * 2.3 + uRt * uv.x + uUp * uv.y), fp = uRo + rd * (uFoc / dot(rd, uFw));   // a thin lens: the plane of focus is uFoc in front of the camera
    float a = 6.2832 * rnd(), q = uAp * sqrt(rnd()); vec3 ro = uRo + (uRt * cos(a) + uUp * sin(a)) * q;
    acc += min(trace(ro, normalize(fp - ro)), vec3(14.));
  }
  o = vec4(acc / float(uSpp) * uInv * EXPO, 1.);
}`;
})();
