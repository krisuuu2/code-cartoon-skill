// balloon/sc_lake.js: scene 11 of THE BALLOON, ALPINE LAKE. The fragment shader of styles8/s10_alpine.js, grown into a scene and made cheap enough for this GPU (20 s per frame -> about 0.25 s):
// the height field (eroded noise) is baked once into two float textures (the whole valley, and a fine one around Clawd's rock), so the 300-step terrain march,
// the reflection march and the sun shadows read one texel per step instead of six octaves of noise. Only the normals are still computed from the noise itself.
// Everything is a pure function of u: pose(u, S) -> uniforms, shot(P) accumulates the jittered passes in strips (one long draw call would reset this GPU).
(() => {
const FOC = 1.5, A = FILM.ANCHOR, DB = 22, BR = A.r * DB / (FW * FOC) * .97, CS = .5, FEET = [.35, .16, 1.2], PASSES = 8, STRIPS = 6;
const AREA = [-56, -20, 112, 128], ROCK = [-2.65, -1.8, 6, 6];   // what the two height textures cover: x0, z0, width, depth
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], norm = a => mul(a, 1 / Math.hypot(...a)), mix3 = (a, b, k) => add(mul(a, 1 - k), mul(b, k));
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }, bump = x => x > 0 && x < 1 ? Math.sin(Math.PI * x) : 0;
const camOf = (ro, ta) => { const f = norm(sub(ta, ro)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f); return { ro, f, r, u }; };
const unproj = (c, x, y, d) => add(c.ro, mul(add(add(mul(c.f, FOC), mul(c.r, (x - FW / 2) / FW)), mul(c.u, (FH / 2 - y) / FW)), d / FOC));   // the point that is drawn at screen (x, y), d units in front of the camera
const proj = (c, p) => { const v = sub(p, c.ro), z = dot(v, c.f); return [FW / 2 + FW * FOC * dot(v, c.r) / z, FH / 2 - FW * FOC * dot(v, c.u) / z]; };
const strand = (c, a, m, b) => [0, .25, .5, .75, 1].map(t => { const [x, y] = proj(c, add(add(mul(a, (1 - t) * (1 - t)), mul(m, 2 * t * (1 - t))), mul(b, t * t))); return new THREE.Vector2(x, FH - y); });   // the string: a quadratic curve as five screen points
const rotOf = (pitch, yaw, roll) => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ')), o2w = (p, P) => add(new THREE.Vector3(...p).multiplyScalar(CS).applyMatrix4(P.R).toArray(), P.cl);   // Clawd's own space -> world
const camAt = (push, tilt) => { const ro = [-.2 + .0373 * push, 1, -7.4 + push]; return camOf(ro, add(ro, [.5, tilt * 13.41, 13.4])); };   // the camera of the still, a little higher; tilt = the tangent of its pitch

async function gpu(el) {
  const r3 = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true }); r3.setPixelRatio(1); r3.setSize(FW, FH, false); r3.domElement.style.cssText = 'position:absolute;left:0;top:0'; el.append(r3.domElement);
  const gl = r3.getContext(); if (!gl.getExtension('EXT_float_blend')) throw new Error('EXT_float_blend missing: cannot accumulate into a float target');
  const rt = new THREE.WebGLRenderTarget(FW, FH, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false }), geo = new THREE.PlaneGeometry(2, 2), cam = new THREE.Camera();
  const hA = new THREE.WebGLRenderTarget(2048, 2048, { type: THREE.HalfFloatType, depthBuffer: false, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter });
  const hB = new THREE.WebGLRenderTarget(1024, 1024, { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const mk = (fs, o) => { const m = new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: 'in vec3 position; void main() { gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: fs, depthTest: false, depthWrite: false, ...o }), s = new THREE.Scene(), q = new THREE.Mesh(geo, m); q.frustumCulled = false; s.add(q); return [m, s]; };
  const f = x => ({ value: x }), v3 = () => f(new THREE.Vector3());
  const [bm, bs] = mk(BAKE, { uniforms: { uZ: f(0), uRect: f(new THREE.Vector4()), uN: f(1), uOct: f(7) } });
  const [pm, ps] = mk(FRAG, { uniforms: { uZ: f(0), uSeed: f(0), uInv: f(1), uT: f(0), uWind: f(0), uArm: f(0), uCs: f(CS), uRo: v3(), uFw: v3(), uRt: v3(), uUp: v3(), uCl: v3(), uM: f(new THREE.Matrix3()), uBal: f(new THREE.Vector4()), uGl: f(new THREE.Vector2()), uStr: f([]), tA: f(hA.texture), tB: f(hB.texture) },
    transparent: true, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor });
  const [tm, ts] = mk(`precision highp float; precision highp sampler2D; uniform sampler2D tC; uniform float uG; out vec4 o;
    void main() { vec3 c = texelFetch(tC, ivec2(gl_FragCoord.xy), 0).rgb; c = clamp(c * (2.51 * c + .03) / (c * (2.43 * c + .59) + .14), 0., 1.); c = pow(c, vec3(1. / 2.2));
      vec2 q = gl_FragCoord.xy / vec2(1080., 1920.) - .5; c *= 1. - dot(q, q) * .3; c += (fract(sin(dot(gl_FragCoord.xy + uG, vec2(12.9898, 78.233))) * 43758.5453) - .5) * .016; o = vec4(c, 1.); }`, { uniforms: { tC: f(rt.texture), uG: f(0) } });
  r3.setRenderTarget(hA); await r3.compileAsync(bs, cam); r3.setRenderTarget(rt); await r3.compileAsync(ps, cam); r3.setRenderTarget(null); await r3.compileAsync(ts, cam);   // the compile takes many seconds on Windows: off the main thread
  for (const [t, rect, oct] of [[hA, AREA, 7], [hB, ROCK, 10]]) { bm.uniforms.uRect.value.set(...rect); bm.uniforms.uN.value = t.width; bm.uniforms.uOct.value = oct; r3.setRenderTarget(t); r3.render(bs, cam); }   // bake the height field, once
  return { U: pm.uniforms, render(passes, grain) {
    r3.autoClear = false; rt.scissorTest = false; r3.setRenderTarget(rt); r3.setClearColor(0, 0); r3.clear(); pm.uniforms.uInv.value = 1 / passes; rt.scissorTest = true;
    for (let i = 0; i < passes; i++) for (let s = 0; s < STRIPS; s++) { pm.uniforms.uSeed.value = i; rt.scissor.set(0, s * FH / STRIPS, FW, FH / STRIPS); r3.setRenderTarget(rt); r3.render(ps, cam); gl.flush(); }
    tm.uniforms.uG.value = grain; r3.setRenderTarget(null); r3.render(ts, cam); } };
}

FILM.add({ id: 'lake',
  async init(el) { this.gl = await gpu(el); },
  shot(P, passes = PASSES) {
    const U = this.gl.U, c = P.cam; U.uRo.value.set(...c.ro); U.uFw.value.set(...c.f); U.uRt.value.set(...c.r); U.uUp.value.set(...c.u); U.uCl.value.set(...P.cl); U.uM.value.setFromMatrix4(P.R).transpose();
    U.uBal.value.set(...P.bal); U.uGl.value.set(...P.gl); U.uStr.value = P.str; U.uT.value = P.T; U.uWind.value = P.wind; U.uArm.value = P.arm; this.gl.render(passes, Math.round(P.T * 30) % 97);
  },
  pose(u, S) {
    const D = S.marks.drift, L = S.lines[0], W = L.words, g0 = L.t0 + W[W.length - 3][1], gk = (u - g0) / (L.t0 + L.dur - g0);   // the glint crosses the balloon on "there it was"
    const rise = ss(D + .1, S.dur, u), low = ss(0, D - .4, u) * (1 - rise), P = { T: u, arm: 0, cam: camAt(.5 * u / (S.dur + .6), .0926) };   // a very slow push-in
    P.wind = ss(D - .1, D + 2.2, u); P.gl = [-.9 + 1.8 * clamp(gk), .7 * bump(gk)];
    // the balloon: on the anchor at u = 0, it sinks and drifts a little while the world is quiet; the first breath of wind lifts it back onto the anchor
    const b = unproj(P.cam, A.x - 26 * low + 2 * Math.sin(u * .8), A.y + 64 * low + 3 * Math.sin(u * 1.3), DB), k0 = sub(b, [0, BR * 1.15, 0]), sw = BR * (.3 + .5 * bump(rise));
    P.bal = [...b, BR]; P.str = strand(P.cam, k0, add(k0, [sw * Math.sin(u * 1.1 + 1), -BR * 2.2, 0]), add(k0, [sw * Math.sin(u * 1.1) - BR * .9 * bump(rise), -BR * 4.3, 0]));
    // Clawd: on his rock, turned toward the balloon, head back; he leans back a little more as it rises
    P.R = rotOf(-.2 - .06 * rise, Math.PI + .24 + .03 * low, 0); P.cl = add(FEET, new THREE.Vector3(0, 1.1 * CS, 0).applyMatrix4(P.R).toArray());
    return P;
  },
  draw(u, S) { this.shot(this.pose(u, S)); },
  // the finale: the lake and the mountains at rest, seen with the camera tilted up, and he hangs from the balloon by one raised arm
  glide(g) {
    const c = camAt(0, .272), d = FW * FOC * 3.2 * CS / g.w, P = { cam: c, T: 20 + g.k * 4, wind: 0, arm: 1.1, gl: [0, 0], R: rotOf(0, Math.PI - .22, -g.rot), cl: unproj(c, g.x, g.y, d) };
    const b = unproj(c, g.bx, g.by, d), r = g.br * d / (FW * FOC), k0 = sub(b, [0, r * 1.15, 0]), hand = o2w([1.52, .86, 0], P); P.bal = [...b, r]; P.str = strand(c, k0, mix3(k0, hand, .5), hand);
    this.shot(P);
  },
  sfx: {
    lake_lap: { prompt: 'small calm waves lapping softly against a rock on a still mountain lake, distant and gentle, no music, no speech', dur: 2.5 },
    lake_bird: { prompt: 'one single bird call echoing from far away across a quiet alpine valley, no music, no speech', dur: 1.6 },
    lake_wind: { prompt: 'one soft breath of wind rising over open water and fading, gentle airy gust, no music, no speech', dur: 3 },
    lake_ripple: { prompt: 'a light breeze ruffling the surface of a calm lake, fine soft water shimmer, no music, no speech', dur: 2 }
  },
  amb: { prompt: 'very still mountain air beside an alpine lake, almost silent, faint distant water lapping, no music, no speech', gain: -28 },
  cues(S) { const D = S.marks.drift, L = S.lines[0]; return [['lake_lap', .35, -9], ['lake_bird', L.t0 + 1.62, -12], ['lake_lap', L.t0 + L.dur - .4, -12], ['lake_wind', D - .15, -5], ['lake_ripple', D + .9, -9]]; }
});

// the ground, shared by the bake and the picture. H(p, oct): water is everything under y = 0; oct may be fractional (the last octave fades in, so the level of detail has no seams)
const GROUND = `precision highp float; precision highp int; precision highp sampler2D;
uniform int uZ;   // always 0: loops that start at a uniform are not unrolled by the HLSL compiler, which keeps the compile time sane
const mat2 M2 = mat2(.8, -.6, .6, .8); const vec2 SLAB = vec2(.35, 1.2);
float hash(vec2 p) { p = fract(p * vec2(.3183099, .3678794) + vec2(.71, .113)) * 50.; return fract(p.x * p.y * (p.x + p.y)); }
vec3 noised(vec2 x) { vec2 p = floor(x), w = fract(x), u = w * w * w * (w * (w * 6. - 15.) + 10.), du = 30. * w * w * (w * (w - 2.) + 1.); float a = hash(p), b = hash(p + vec2(1., 0.)), c = hash(p + vec2(0., 1.)), d = hash(p + vec2(1., 1.)), k1 = b - a, k2 = c - a, k4 = a - b - c + d; return vec3(a + k1 * u.x + k2 * u.y + k4 * u.x * u.y, du * vec2(k1 + k4 * u.y, k2 + k4 * u.x)); }
float fbm(vec2 p) { float a = 0., b = .5; for (int i = uZ; i < 5; i++) { a += b * noised(p).x; b *= .5; p = M2 * p * 2.03; } return a; }
float slab(vec2 p, vec2 d) {   // the rock Clawd stands on: a pitted, cracked top, a broken ledge half-way down, steep sides into the water
  float w = fbm(p * 1.1), r = length(d) + .5 * w, g = noised(p * 5.3 + w * 3.).x, h = .13 + .06 * fbm(p * 2.3 + 5.) + .03 * g;
  h -= (.07 + .05 * g) * smoothstep(.98, 1.05, r + .12 * g) + .035 * smoothstep(.05, 0., abs(noised(M2 * p * 2.6 + 9.).x - .5));
  return h - 2.5 * smoothstep(1.2, 1.65, r);
}
float H(vec2 p, float oct) {
  vec2 q = (p + vec2(13., 7.)) * .115, d = vec2(0.); float a = 0., b = 1.;
  for (int i = uZ; i < 11; i++) { float w = min(oct - float(i), 1.); if (w <= 0.) break; vec3 n = noised(q) * w; d += n.yz; a += b * n.x / (1. + dot(d, d)); b *= .5; q = M2 * q * 2.; }
  float far = smoothstep(9., 30., p.y), h = a * (3.1 + 7.2 * far) - 1.35 + 2.0 * far;
  vec2 bw = (p - vec2(0., 1.)) * vec2(.1, .068), sd = (p - SLAB) * vec2(.72, 1.2); h -= 2.9 * exp(-dot(bw, bw));                                  // the basin of the lake
  return dot(sd, sd) > 3.4 ? h : max(h, slab(p, sd));
}`;
const BAKE = GROUND + `
uniform vec4 uRect; uniform float uN, uOct; out vec4 o;
void main() { o = vec4(H(uRect.xy + gl_FragCoord.xy / uN * uRect.zw, uOct), 0., 0., 1.); }`;

const FRAG = GROUND + `
uniform float uSeed, uT, uInv, uWind, uArm, uCs;
uniform vec3 uRo, uFw, uRt, uUp, uCl; uniform mat3 uM;   // uM: world -> Clawd
uniform vec4 uBal; uniform vec2 uGl, uStr[5];
uniform sampler2D tA, tB; out vec4 o;
const vec2 RES = vec2(1080., 1920.); const vec3 SUN = vec3(-.7197, .4598, -.5198); const vec4 AR = vec4(${AREA}), BR = vec4(${ROCK});
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float sbox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.) - r; }
float body(vec3 p) {   // CLAWD_SDF of styles8/core.js, with one arm that can be raised to hold the string
  vec3 q = vec3(abs(p.x), p.y, p.z), a = p - vec3(1.1, 0., 0.); a.xy = rot(uArm) * a.xy; float al = .25 + .3 * min(uArm, 1.);
  float d = sbox(p - vec3(0., .2, 0.), vec3(1.2, .8, .5), .09); d = min(d, sbox(p + vec3(.8, 0., 0.), vec3(.8, .2, .3), .08)); d = min(d, sbox(a - vec3(al, 0., 0.), vec3(al, .2, .3), .08));
  d = min(d, sbox(q - vec3(.5, -.8, 0.), vec3(.1, .3, .3), .05)); return min(d, sbox(q - vec3(.9, -.8, 0.), vec3(.1, .3, .3), .05));
}
float eyes(vec3 p) { return sbox(vec3(abs(p.x) - .7, p.y - .4, p.z - .5), vec3(.1, .2, .03), .02); }
float Ht(vec2 p) { vec2 q = (p - BR.xy) / BR.zw; if (q == clamp(q, .01, .99)) return textureLod(tB, q, 0.).r; return textureLod(tA, (p - AR.xy) / AR.zw, 0.).r; }   // the baked ground: the fine texture near the rock, the coarse one elsewhere
float castT(vec3 ro, vec3 rd, float t, float tmax) { for (int i = uZ; i < 400; i++) { vec3 p = ro + rd * t; float h = p.y - Ht(p.xz); if (h < .001 * t || t > tmax) break; if (rd.y > 0. && p.y > 15.) return tmax + 1.; t += .2 * h; } return t; }
float sph(vec3 ro, vec3 rd, vec4 s) { vec3 oc = ro - s.xyz; float b = dot(oc, rd), h = b * b - dot(oc, oc) + s.w * s.w; return h < 0. ? -1. : -b - sqrt(h); }
vec3 toC(vec3 p) { return uM * (p - uCl) / uCs; }
float sdC(vec3 p) { vec3 q = toC(p); return min(body(q), eyes(q)) * uCs; }
float castC(vec3 ro, vec3 rd) { vec3 oc = ro - uCl; float b = dot(oc, rd), c = dot(oc, oc) - 4.6 * uCs * uCs, h = b * b - c; if (h < 0.) return -1.; h = sqrt(h); float t = max(-b - h, 0.), te = -b + h; for (int i = uZ; i < 70; i++) { float d = sdC(ro + rd * t); if (d < .0012) return t; t += d; if (t > te) break; } return -1.; }
float shadowC(vec3 p) { vec3 oc = p - uCl; float b = dot(oc, SUN), c = dot(oc, oc) - 4.6 * uCs * uCs; if (b * b - c < 0.) return 1.; float r = 1., t = .03; for (int i = uZ; i < 28; i++) { float d = sdC(p + SUN * t); r = min(r, 9. * d / t); t += clamp(d, .02, .3); if (r < .01 || t > 4.) break; } return clamp(r, 0., 1.); }
float shadowT(vec3 p) { float r = 1., t = .08; for (int i = uZ; i < 44; i++) { vec3 q = p + SUN * t; float h = q.y - Ht(q.xz); r = min(r, 9. * h / t); t += clamp(h, .06, 1.4); if (r < .01 || t > 30.) break; } return clamp(r, 0., 1.); }
vec3 sky(vec3 rd) {
  float y = max(rd.y, 0.); vec3 c = mix(vec3(.56, .73, .93), vec3(.10, .27, .66), pow(y, .5));
  float s = max(dot(rd, SUN), 0.); c += vec3(1., .82, .55) * (pow(s, 5.) * .12 + pow(s, 90.) * .5);
  if (rd.y > .015) { vec2 q = rd.xz / rd.y * 1.1 + vec2(3. + uT * .03, 1.); float d = smoothstep(.56, .8, fbm(q)), d2 = smoothstep(.56, .8, fbm(q + SUN.xz * .22)); c = mix(c, mix(vec3(.55, .62, .74), vec3(1.), clamp(.55 + (d - d2) * 1.6, 0., 1.)), d * smoothstep(.015, .16, rd.y) * .9); }
  return c;
}
vec3 fog(vec3 c, float t) { return mix(c, vec3(.50, .65, .86), 1. - exp(-t * .0072)); }
vec3 shadeT(vec3 p, float t, vec3 rd) {
  p.y = max(p.y, Ht(p.xz)); float e = .001 * t + .0006, oc = clamp(log2(8. / e), 5., 10.);   // no octaves finer than the pixel: they would only flicker
  vec3 n = normalize(vec3(H(p.xz - vec2(e, 0.), oc) - H(p.xz + vec2(e, 0.), oc), 2. * e, H(p.xz - vec2(0., e), oc) - H(p.xz + vec2(0., e), oc)));
  vec3 k1 = noised(p.xz * 3.1), k2 = noised(M2 * p.xz * 9.7); float nz = k1.x, nz2 = fbm(p.xz * .55 + 4.), big = noised(p.xz * .23 + 9.).x;
  float cav = clamp(.5 + (p.y - textureLod(tA, (p.xz - AR.xy) / AR.zw, 5.).r) * .5, 0., 1.);   // gullies lie below the smoothed mountain, ridges above it
  vec3 rock = mix(vec3(.07, .06, .055), vec3(.15, .125, .1), nz) * (.8 + .4 * noised(vec2(p.y * 5. + nz * 3., p.x * .9 + p.z * .7)).x) * (.72 + .56 * noised(vec2((p.x + p.z) * 3.2, p.y * .7)).x);   // strata and gullies
  rock *= mix(vec3(1.25, 1.04, .82), vec3(.78, .9, 1.1), big) * (.5 + cav) * (1. + exp(-t * .06) * (noised(p.xz * 23.).x - .5) * .7);                    // warm and cool beds, dark gullies, pale ridges, grain up close
  vec3 alb = mix(rock, mix(vec3(.07, .12, .03), vec3(.17, .2, .06), nz2), smoothstep(.56, .78, n.y) * smoothstep(3.4, 1.9, p.y));
  alb = mix(alb, vec3(.022, .055, .03), smoothstep(.5, .72, n.y) * smoothstep(.42, .54, nz2) * smoothstep(2.6, 1.3, p.y) * smoothstep(.1, .35, p.y));     // forest
  float snow = smoothstep(4.3, 5.4, p.y + nz * .9) * smoothstep(.5, .72, n.y + nz * .1); alb = mix(alb, vec3(.86, .89, .96), snow);
  vec2 bm = (k1.yz * .11 + k2.yz * .07 * exp(-t * .02)) * (1. - .7 * snow); n = normalize(n + vec3(bm.x, 0., bm.y));                                        // broken rock is not smooth: small facets catch the light
  vec2 sd = (p.xz - SLAB) * vec2(.72, 1.2);
  if (dot(sd, sd) < 3.4) alb = mix(rock * 1.3, vec3(.21, .17, .05), .75 * smoothstep(.52, .68, fbm(p.xz * 7. + 2.)) * smoothstep(.1, .14, p.y) * smoothstep(.8, .95, n.y));   // Clawd's rock: bare stone with lichen on top
  float wet = smoothstep(0., .13, p.y); alb *= mix(.4, 1., wet);                                                                                             // the shore is wet
  float sh = shadowT(p + n * .02) * shadowC(p + n * .01), dif = max(dot(n, SUN), 0.) * sh;
  vec3 c = alb * (dif * vec3(1., .93, .8) * 3.6 + (.5 + .5 * n.y) * vec3(.26, .38, .62) * (.26 + .3 * cav) + max(dot(n, normalize(-SUN * vec3(1., 0., 1.))), 0.) * vec3(.3, .26, .2) * .16);
  return c + snow * sh * pow(max(dot(reflect(rd, n), SUN), 0.), 14.) * .35 + (1. - wet) * vec3(.5, .65, .86) * pow(1. - max(dot(n, -rd), 0.), 3.) * .1;
}
vec3 shadeC(vec3 p, vec3 rd) {
  vec2 e = vec2(.0015, 0.); vec3 n = normalize(vec3(sdC(p + e.xyy) - sdC(p - e.xyy), sdC(p + e.yxy) - sdC(p - e.yxy), sdC(p + e.yyx) - sdC(p - e.yyx))), r = reflect(rd, n);
  bool eye = eyes(toC(p)) * uCs < .003; vec3 alb = eye ? vec3(.012) : vec3(.70, .15, .028) * (.82 + .3 * noised(p.xy * 7. + p.z * 3.).x);          // painted steel, a little weathered
  float sh = shadowC(p + n * .01), fr = .04 + .96 * pow(1. - max(dot(n, -rd), 0.), 5.);
  vec3 c = alb * (max(dot(n, SUN), 0.) * sh * vec3(1., .93, .8) * 3.3 + (.5 + .5 * n.y) * vec3(.26, .38, .62) * .7 + max(-n.y, 0.) * vec3(.08, .18, .2));
  return c + sky(vec3(r.x, abs(r.y), r.z)) * fr * (eye ? .9 : .45) + vec3(1., .9, .75) * pow(max(dot(r, SUN), 0.), 60.) * sh * (eye ? 3. : .7);
}
vec3 balC(vec3 n, vec3 rd) {   // the balloon: thin glossy red rubber
  vec3 r = reflect(rd, n); float nv = max(dot(n, -rd), 0.), fr = .04 + .96 * pow(1. - nv, 5.), nl = dot(n, SUN), rs = max(dot(r, SUN), 0.);
  vec3 c = vec3(.62, .04, .018) * (pow(clamp(nl * .6 + .4, 0., 1.), 1.6) * vec3(1., .93, .8) * 3.1 + (.5 + .5 * n.y) * vec3(.3, .36, .5) * .6 + max(-n.y, 0.) * vec3(.08, .18, .2));   // the light wraps around: rubber is translucent
  c += vec3(.75, .05, .02) * (pow(max(-nl, 0.), 2.) * .5 + pow(1. - nv, 2.) * .25);                                                    // the sun glows through the far side and the rim
  c += mix(sky(vec3(r.x, abs(r.y), r.z)), vec3(.1, .13, .15), smoothstep(.2, -.1, r.y) * .85) * fr * .9 + vec3(1., .95, .85) * (pow(rs, 500.) * 14. + pow(rs, 60.) * .7 + pow(rs, 12.) * .2);
  float gd = 1. - dot(n, normalize((uRt * .8 + uUp * .6) * uGl.x - uFw * .75));
  return c + vec3(1., .96, .88) * uGl.y * (exp(-gd * 28.) + 5. * exp(-gd * 500.));          // the glint that crosses it: a second, soft highlight that slides over the rubber
}
vec3 water(vec3 p, vec3 rd, float t) {
  float fz = 34. - 46. * uWind, gust = smoothstep(fz, fz + 6., p.z) * step(.001, uWind), amp = .016 / (1. + t * .05) * (1. + gust);   // the breath of wind comes down the lake from the far shore
  vec2 g = (noised(p.xz * vec2(1.5, 6.) + vec2(uT * .6, uT * .4)).yz * vec2(.4, 1.) + noised(M2 * p.xz * vec2(4., 12.) - uT * .8).yz * .3) * amp;
  if (gust > 0.) g += noised(p.xz * vec2(9., 34.) + vec2(uT * 1.3, uT * 2.6)).yz * vec2(.3, 1.) * .02 * gust * smoothstep(.25, .7, noised(p.xz * vec2(.1, .22) + vec2(uT * .15, uT * .5)).x) / (1. + t * .02);
  vec3 n = normalize(vec3(-g.x, 1., -g.y)), r = reflect(rd, n); r.y = abs(r.y); float fr = .02 + .98 * pow(1. - max(dot(n, -rd), 0.), 5.);
  vec3 q = p + vec3(0., .01, 0.), rc = sky(r); float tt = castT(q, r, .15, 110.), tc = castC(q, r), tb = sph(q, r, uBal), best = tt < 110. ? tt : 1e9;
  if (best < 1e8) rc = fog(shadeT(q + r * tt, tt, r), tt);
  if (tc > 0. && tc < best) { best = tc; rc = shadeC(q + r * tc, r); }
  if (tb > 0. && tb < best) rc = balC(normalize(q + r * tb - uBal.xyz), r);
  float depth = -Ht(p.xz), sh = .35 + .65 * shadowC(q) * shadowT(q); vec3 deep = mix(vec3(.07, .22, .2), vec3(.008, .045, .065), smoothstep(0., .7, depth)) * sh;   // turquoise shallows, dark middle
  return mix(deep, rc, fr) + vec3(1., .9, .7) * pow(max(dot(r, SUN), 0.), 300.) * 2.;
}
vec3 render(vec3 ro, vec3 rd) {
  vec4 kn = vec4(uBal.xyz - vec3(0., uBal.w * 1.04, 0.), uBal.w * .14);
  float tw = rd.y < 0. ? -ro.y / rd.y : 1e9, tm = min(tw, 120.), tt = castT(ro, rd, .3, tm), tc = castC(ro, rd), tb = sph(ro, rd, uBal), tk = sph(ro, rd, kn);
  float best = tt < tm ? tt : tw; int id = tt < tm ? 1 : tw < 1e8 ? 2 : 0;
  if (tc > 0. && tc < best) { best = tc; id = 3; }
  if (tb > 0. && tb < best) { best = tb; id = 4; }
  if (tk > 0. && tk < best) { best = tk; id = 5; }
  vec3 p = ro + rd * best;
  if (id == 0) return sky(rd);
  if (id == 1) return fog(shadeT(p, best, rd), best);
  if (id == 2) return fog(water(p, rd, best), best);
  if (id == 3) return fog(shadeC(p, rd), best);
  return id == 4 ? balC(normalize(p - uBal.xyz), rd) : balC(normalize(p - kn.xyz), rd) * .6;
}
void main() {
  vec2 fc = gl_FragCoord.xy + fract(vec2(.7548777, .5698403) * (uSeed + 1.)) - .5, uv = (fc - .5 * RES) / RES.x;
  vec3 c = render(uRo, normalize(uFw * 1.5 + uRt * uv.x + uUp * uv.y)) * .82;
  float ds = 1e9; for (int i = uZ; i < 4; i++) { vec2 a = uStr[i], ba = uStr[i + 1] - a, pa = fc - a; ds = min(ds, length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0., 1.))); }
  c = mix(mix(c, c * .5, smoothstep(3.2, 1.6, ds) * .5), vec3(.8, .76, .68), smoothstep(1.7, .6, ds) * .9);                                                    // the string: thin pale cotton in the sun
  o = vec4(c * uInv, 1.);
}`;
})();
