// balloon/sc_chrome.js: scene 4 of THE BALLOON, LIQUID CHROME. Raw WebGL, one fragment shader that raymarches a signed distance field (the shader of styles8/s4_chrome.js,
// grown into a scene). Clawd is a smooth union of rounded boxes that is blended with a flat puddle, so he can melt, pour between the iron bars and re-form.
// The witch exists only in the environment function, which means she can only ever be seen as a reflection in him. The balloon is the one thing that is not chrome.
// Everything is a pure function of u: pose(u, S) computes the uniforms, render(P) draws them in six strips (one long draw call would reset this GPU).
(() => {
const FOC = 2.3, FLOOR = -1.02, A = FILM.ANCHOR, DB = 12.8, BR = A.r * DB / (FW * FOC), HOME = 2.3;
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], norm = a => mul(a, 1 / Math.hypot(...a)), mix3 = (a, b, k) => add(mul(a, 1 - k), mul(b, k));
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }, bump = x => x > 0 && x < 1 ? Math.sin(Math.PI * x) : 0, eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const camOf = (ro, ta) => { const f = norm(sub(ta, ro)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f); return { ro, f, r, u }; };
const unproj = (c, x, y, d) => add(c.ro, mul(add(add(mul(c.f, FOC), mul(c.r, (x - FW / 2) / FW)), mul(c.u, (FH / 2 - y) / FW)), d / FOC));   // the point that is drawn at screen (x, y), d units in front of the camera
const proj = (c, p) => { const v = sub(p, c.ro), z = dot(v, c.f); return [FW / 2 + FW * FOC * dot(v, c.r) / z, FH / 2 - FW * FOC * dot(v, c.u) / z]; };
const pulse = (L, u, w = .2) => L.words.reduce((m, [, a]) => Math.max(m, bump((u - L.t0 - a) / w)), 0);   // one bump per spoken word
// Clawd's own space -> world (the inverse of obj() in the shader)
const o2w = ([x, y, z], P) => { x *= P.scl[0]; z *= P.scl[0]; y = (y + 1.14) * P.scl[1] - 1.14; let c = Math.cos(P.yaw), s = Math.sin(P.yaw); [x, z] = [x * c + z * s, -x * s + z * c]; c = Math.cos(P.tilt); s = Math.sin(P.tilt); [x, y] = [x * c + y * s, -x * s + y * c]; return add([x, y, z], P.pos); };
const OFF = [0, -99, 0, 0];
// the string: a quadratic curve from a to b through m, as five screen points in GL coordinates
const strand = (c, a, m, b) => [0, .25, .5, .75, 1].map(t => { const [x, y] = proj(c, add(add(mul(a, (1 - t) * (1 - t)), mul(m, 2 * t * (1 - t))), mul(b, t * t))); return [x, FH - y]; });

FILM.add({ id: 'chrome',
  async init(el) {
    const c = cv(); el.append(c); const g = c.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false }), par = g.getExtension('KHR_parallel_shader_compile');
    const sh = (type, src) => { const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); return s; }, vs = sh(g.VERTEX_SHADER, '#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'), fs = sh(g.FRAGMENT_SHADER, FRAG);
    const p = g.createProgram(); g.attachShader(p, vs); g.attachShader(p, fs); g.bindAttribLocation(p, 0, 'a'); g.linkProgram(p);
    while (par && !g.getProgramParameter(p, par.COMPLETION_STATUS_KHR)) await new Promise(r => setTimeout(r, 100));   // the compile takes many seconds on Windows: wait for it without blocking the page
    if (!g.getProgramParameter(p, g.LINK_STATUS)) throw new Error('chrome shader: ' + g.getShaderInfoLog(fs) + g.getProgramInfoLog(p)); g.useProgram(p);
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer()); g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW); g.enableVertexAttribArray(0); g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0); g.enable(g.SCISSOR_TEST);
    this.g = g; this.loc = n => g.getUniformLocation(p, n);
  },
  render(P) {
    const g = this.g, c = P.cam, one = { uT: P.T, uYaw: P.yaw, uTilt: P.tilt, uMelt: P.melt, uRip: P.rip, uArm: P.arm, uBars: P.bars, uPool: P.pool, uGlow: P.glow, uRo: c.ro, uFw: c.f, uRt: c.r, uUp: c.u, uPos: P.pos, uPc: P.pc, uPr: P.pr, uWd: P.wd, uScl: P.scl, uFade: P.fade, uBal: P.bal, uWit: P.wit, uSpl: P.spl };
    g.uniform1i(this.loc('uZ'), 0); for (const k in one) { const v = one[k], l = this.loc(k); typeof v === 'number' ? g.uniform1f(l, v) : v.length === 2 ? g.uniform2fv(l, v) : v.length === 3 ? g.uniform3fv(l, v) : g.uniform4fv(l, v); }
    g.uniform4fv(this.loc('uD'), P.D.flat()); g.uniform2fv(this.loc('uStr'), P.str.flat());
    for (let i = 0; i < 6; i++) { g.scissor(0, i * FH / 6, FW, FH / 6); g.drawArrays(g.TRIANGLES, 0, 3); g.flush(); }
  },
  pose(u, S) {
    const [L0, L1] = S.lines, out = S.marks.out, P = { T: u, tilt: 0, arm: 0, bars: 1, pool: 1, fade: [14, 42], glow: 2 };
    // 0 - 2.4 s: he sags, melts into a puddle, the puddle pours between the bars, and he rises out of it on the camera's side
    const sag = ss(.4, .85, u) * (1 - ss(1.8, 2.1, u)), pk = clamp((u - 1.05) / .75), re = bump((u - 2.1) / .34), z = -2.4 + (HOME + 2.4) * eio(pk);
    const t1 = u - L1.t0, talk = pulse(L1, u), chk = t1 > 0 && t1 < .95 ? Math.sin(t1 * 38) * bump(t1 / .95) : 0, shout = pulse(L0, u);   // his line starts with a chuckle
    P.melt = ss(.55, 1.05, u) - ss(1.8, 2.2, u); P.pos = [0, .12, z]; P.pc = [0, FLOOR + .05, z]; P.pr = [1.75 - .3 * bump(pk), .2, 1.15 + 1.5 * bump(pk)];
    P.scl = [1 + .22 * sag - .05 * re + .03 * talk - .015 * chk, 1 - .45 * sag + .13 * re - .05 * talk + .03 * chk];
    P.yaw = .35 - .45 * ss(1, 2.2, u) + .4 * ss(L0.t0 + .1, L0.t0 + .9, u) - .24 * ss(L1.t0 - .1, L1.t0 + .6, u);   // he turns a little toward the witch, then back
    // the witch stands beside the camera, exactly where the mirror of his turned face looks
    const fin = { pos: [0, .12, HOME], yaw: .3, tilt: 0, scl: [1, 1] }, ro0 = [0, 1.5, 16], v = norm(sub(ro0, o2w([0, .25, .5], fin))), n = [Math.sin(.3), 0, Math.cos(.3)];
    P.wd = norm(sub(mul(n, 2 * dot(n, v)), v));
    P.wit = [.1 * Math.sin(u * 2.3) + .07 * shout, .13 * shout, ss(L0.t0 - .25, L0.t0 + .2, u) * (1 - ss(L0.t0 + L0.dur + .05, L0.t0 + L0.dur + .6, u)), .15];
    P.rip = .028 + .03 * P.melt + .03 * talk + .02 * Math.abs(chk) - .012 * P.wit[2];   // a calmer mirror while she looks into it
    // the camera pushes in slowly; at the end it tilts up until the balloon is back on the anchor
    const ro = [0, 1.5, 16 - .5 * u / 11.8], c0 = camOf(ro0, [0, .8, 0]), b0 = unproj(c0, A.x, A.y, DB);
    const bw = add(b0, [.06 * Math.sin(u * .9), 1.1 * ss(.3, 2.8, u) + .04 * Math.sin(u * 1.7) * ss(.3, 2, u), 0]);       // the balloon drifts up and waits there
    let lo = .8, hi = 3; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; proj(camOf(ro, [0, m, 0]), bw)[1] < A.y ? lo = m : hi = m; }   // the tilt that puts it on the anchor
    P.cam = camOf(ro, [0, .8 + (lo - .8) * ss(out, S.dur - .03, u), 0]);
    const b = mix3(bw, unproj(P.cam, A.x, A.y + 3 * Math.sin(u * 2.2), DB), ss(out + .1, S.dur, u)); P.bal = [...b, BR];
    const k0 = sub(b, [0, BR * 1.15, 0]); P.str = strand(P.cam, k0, add(k0, [.12 * Math.sin(u * 1.3 + 1), -.75, 0]), add(k0, [.1 * Math.sin(u * 1.3), -1.5, 0]));
    // droplets: four orbit him while he speaks; at the end one grows on his arm, falls and splashes
    const drop = out - .45, fall = u - out, y0 = o2w([1.58, -.56, .04], { ...P, scl: [1, 1] }), us = out + Math.sqrt((y0[1] - .13 - FLOOR) / 10), ts = u - us;
    P.D = [0, 1, 2, 3].map(i => {
      if (ts > 0) { const a = i * TAU / 4 + .6, y = 3.2 * ts - 9 * ts * ts; return y < 0 ? OFF : [y0[0] + Math.cos(a) * 1.5 * ts, FLOOR + .04 + y, y0[2] + Math.sin(a) * 1.5 * ts, .075 * (1 - ts / .6)]; }
      const e = ss(L1.t0 + .15 + i * .12, L1.t0 + .85 + i * .12, u) * (1 - ss(drop - .5 + i * .08, drop + i * .08, u)), a = i * TAU / 4 + 1.5 * t1;
      return e <= 0 ? OFF : [P.pos[0] + Math.cos(a) * 2.35 * e, .55 + .55 * Math.sin(i * 2.4 + u * 1.2) * e, P.pos[2] + Math.sin(a) * 2.35 * e, (.15 + .04 * (i % 2)) * ss(0, .25, e)];
    });
    const gr = ss(drop, out, u); P.D.push(gr <= 0 || ts > 0 ? OFF : [y0[0], y0[1] + .12 * (1 - gr) - (fall > 0 ? 10 * fall * fall : 0), y0[2], .13 * gr], OFF);
    P.spl = ts > 0 ? [y0[0], y0[2], .12 + 1.5 * (1 - Math.exp(-ts * 4)), .08 * Math.exp(-ts * 4.5)] : [0, 0, 0, 0];
    return P;
  },
  draw(u, S) { this.render(this.pose(u, S)); },
  // the finale: the chrome world at rest, a few droplets floating, and he hangs from the balloon by one stretched arm
  glide(g) {
    const d = FW * FOC * 3.3 / g.w, c = camOf([0, 3.2, d], [0, 4.2, 0]), P = { T: g.k * 5, cam: c, tilt: g.rot, yaw: -.3, arm: 1.15, bars: 0, pool: 0, melt: 0, rip: .028, scl: [1, 1], fade: [40, 150], glow: 2, pc: [0, 0, 0], pr: [1, 1, 1], wd: [0, 0, 1], wit: [0, 0, 0, 1], spl: [0, 0, 0, 0] };
    P.pos = unproj(c, g.x, g.y, d); const b = unproj(c, g.bx, g.by, d), r = g.br * d / (FW * FOC), k0 = sub(b, [0, r * 1.15, 0]), hand = o2w([1.5, 1.08, 0], P); P.bal = [...b, r];
    P.str = strand(c, k0, mix3(k0, hand, .5), hand);
    P.D = [[-3.6, 7.6, -1, .34], [3.9, 9.2, -3, .26], [4.3, 2.6, 1.5, .2], [-4.4, 3.4, 2, .15], [-2.2, .3, 4, .12], [2.4, 11.5, -2, .16]].map(([x, y, z, w], i) => [x, y + .25 * Math.sin(g.k * 5 + i * 1.7), z, w]);
    this.render(P);
  },
  sfx: {
    chrome_melt: { prompt: 'thick liquid metal sagging and melting into a puddle, low gloopy mercury sound, no music, no speech', dur: 1.2 },
    chrome_pour: { prompt: 'heavy liquid metal pouring and flowing across a stone floor past iron bars, smooth metallic rush, no music, no speech', dur: 1.2 },
    chrome_form: { prompt: 'liquid metal blob rising up and snapping into shape with a resonant metallic bloop, no music, no speech', dur: 1 },
    chrome_drips: { prompt: 'three small droplets of liquid metal popping off a surface, bright metallic plinks, no music, no speech', dur: 1 },
    chrome_plink: { prompt: 'one single metallic droplet letting go, tiny high plink, no music, no speech', dur: .5 },
    chrome_splash: { prompt: 'one heavy drop of liquid metal splashing on a hard floor in a large empty hall, resonant ringing splash with a long echo, no music, no speech', dur: 1.8 }
  },
  amb: { prompt: 'low resonant drone of a large empty dark hall, faint metallic hum and distant air, no music, no speech', gain: -24 },
  cues(S) { const o = S.marks.out, a = S.lines[1].t0; return [['chrome_melt', .45, -3], ['chrome_pour', 1.05], ['chrome_form', 1.8], ['chrome_drips', a + .2, -5], ['chrome_drips', o - .9, -8], ['chrome_plink', o - .02, -2], ['chrome_splash', o + .2]]; }
});

const FRAG = `#version 300 es
precision highp float;
uniform int uZ;   // always 0: loops that start at a uniform are not unrolled by the HLSL compiler, which keeps the compile time sane
out vec4 o;
uniform float uT, uYaw, uTilt, uMelt, uRip, uArm, uBars, uPool, uGlow;
uniform vec3 uRo, uFw, uRt, uUp, uPos, uPc, uPr, uWd;
uniform vec2 uScl, uFade, uStr[5];
uniform vec4 uBal, uD[6], uWit, uSpl;
const vec2 RES = vec2(1080., 1920.);
const float FLOOR = -1.02;
#define KEY normalize(vec3(-.4, .8, .45))
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float sbox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.) - r; }
float smin(float a, float b, float k) { float h = clamp(.5 + .5 * (b - a) / k, 0., 1.); return mix(b, a, h) - k * h * (1. - h); }
vec3 obj(vec3 p) { p -= uPos; p.xy *= rot(uTilt); p.xz *= rot(uYaw); p.y = (p.y + 1.14) / uScl.y - 1.14; p.xz /= uScl.x; return p; }   // world -> Clawd; the squash is anchored at his feet
float eyes(vec3 p) { return sbox(vec3(abs(p.x) - .7, p.y - .44, p.z - .5), vec3(.1, .2, .07), .05); }
float eyeD(vec3 pw) { return (eyes(obj(pw)) + uMelt * .3) * min(uScl.x, uScl.y); }
float barD(vec3 p) { return length(vec2(mod(p.x, .95) - .475, p.z)) - .09; }
float chrome(vec3 pw) {
  float d = 1e9;
  if (uMelt < .999) {
    vec3 p = obj(pw), q = vec3(abs(p.x), p.y, p.z), a = p - vec3(1., 0., 0.); a.xy *= rot(-uArm); float al = .32 + .3 * min(uArm, 1.);
    d = sbox(p - vec3(0., .2, 0.), vec3(1.2, .8, .5), .45);
    d = smin(d, sbox(p + vec3(.8, 0., 0.), vec3(.82, .2, .3), .2), .22);
    d = smin(d, sbox(a - vec3(al - .02, 0., 0.), vec3(al, .2, .3), .2), .22);          // the arm that can be raised (and stretched) to hold the string
    d = smin(d, sbox(q - vec3(.5, -.8, 0.), vec3(.11, .32, .2), .1), .12);
    d = smin(d, sbox(q - vec3(.9, -.8, 0.), vec3(.11, .32, .2), .1), .12);
    d += uRip * sin(p.x * 3.4 + uT * 2.) * sin(p.y * 4.6 - uT) * sin(p.z * 3. + 1.);    // the surface is never quite still
    if (uPool > .5) d = smin(d, (length((q - vec3(.7, -1.13, 0.)) * vec3(.62, 2.4, 1.)) - .27) / 2.4, .16);   // the feet melt into two small pools
    d *= min(uScl.x, uScl.y);
  }
  if (uMelt > .001) {   // the puddle: a flat ellipsoid on the floor; the blend between the two fields is the melting
    vec3 pp = pw - uPc; float k0 = length(pp / uPr), k1 = length(pp / (uPr * uPr)), dp = k0 * (k0 - 1.) / max(k1, 1e-4) + .035 * sin(pw.x * 5. + uT * 5.) * sin(pw.z * 4. - uT * 7.);
    d = uMelt > .999 ? dp : mix(d, dp, uMelt);
  }
  if (uBars > .5) d = -smin(-d, barD(pw) - .1, .12);                                    // liquid flows around the bars
  for (int i = uZ; i < 6; i++) d = smin(d, length(pw - uD[i].xyz) - uD[i].w, .16);
  if (uSpl.w > 0.) d = smin(d, length(vec2(length(pw.xz - uSpl.xy) - uSpl.z, pw.y - FLOOR)) - uSpl.w, .08);   // the ring of the splash
  return d;
}
float sd(vec3 p) { return min(chrome(p), eyeD(p)); }
vec3 nrm(vec3 p) { vec3 n = vec3(0.); for (int i = uZ; i < 4; i++) { vec3 e = .5773 * (2. * vec3(((i + 3) >> 1) & 1, (i >> 1) & 1, i & 1) - 1.); n += e * sd(p + .002 * e); } return normalize(n); }
float march(vec3 ro, vec3 rd, float tm) { float t = 0.; for (int i = uZ; i < 110; i++) { float d = sd(ro + rd * t); if (d < .0015 + t * .0002) return t; t += d * .8; if (t > tm) break; } return -1.; }
float sph(vec3 ro, vec3 rd, vec4 s) { vec3 oc = ro - s.xyz; float b = dot(oc, rd), h = b * b - dot(oc, oc) + s.w * s.w; return h < 0. ? -1. : -b - sqrt(h); }
float bars(vec3 ro, vec3 rd, out vec3 n) {   // ten vertical iron bars in the plane z = 0, intersected exactly
  float t = -1., a = dot(rd.xz, rd.xz); if (uBars < .5) return t;
  for (int i = uZ; i < 10; i++) { vec2 o = ro.xz - vec2((float(i) - 4.5) * .95, 0.); float b = dot(o, rd.xz), h = b * b - a * (dot(o, o) - .0081);
    if (h > 0.) { float x = (-b - sqrt(h)) / a; if (x > 0. && (t < 0. || x < t)) { t = x; n = vec3(o.x + rd.x * x, 0., o.y + rd.z * x) / .09; } } }
  return t;
}
vec3 env(vec3 d) {   // the studio: white at the horizon, hot pink, violet above; black just under the horizon, then blue to cyan
  float y = d.y;
  vec3 up = mix(vec3(1., .96, 1.), vec3(1., .3, .72), smoothstep(0., .22, y)); up = mix(up, vec3(.2, .05, .52), smoothstep(.18, .62, y)); up = mix(up, vec3(.02, .0, .08), smoothstep(.6, 1., y));
  vec3 dn = mix(vec3(.14, .03, .28), vec3(.04, .16, .62), smoothstep(0., -.3, y)); dn = mix(dn, vec3(.35, .9, 1.), smoothstep(-.3, -1., y));
  vec3 c = mix(dn, up, smoothstep(-.008, .008, y));
  c += vec3(2.6) * smoothstep(.93, .975, dot(d, KEY));          // key softbox
  c += vec3(1.6, 1.3, 1.1) * smoothstep(.985, .996, dot(d, normalize(vec3(.75, .3, .6))));
  float k = dot(d, uWd);
  if (uWit.z > 0. && k > .2) {   // the witch: a warm figure with a pointed hat and two eye glints, painted on the room. She is never in front of the camera.
    vec3 wr = normalize(cross(vec3(0., 1., 0.), uWd)), wu = cross(uWd, wr); vec2 q = vec2(dot(d, wr), dot(d, wu)) / (k * uWit.w); q.y += .25 - uWit.y; q.x -= uWit.x * (q.y + 1.2);
    float e = .05, cl = smoothstep(e, 0., abs(q.x) - mix(.55, .17, clamp((q.y + 1.2) / 1.3, 0., 1.))) * step(-1.2, q.y) * step(q.y, .1), hd = smoothstep(e, 0., length(q - vec2(0., .22)) - .2);
    float br = smoothstep(e, 0., length((q - vec2(0., .42)) * vec2(1., 5.)) - .5), hy = clamp((q.y - .42) / .8, 0., 1.), ct = smoothstep(e, 0., abs(q.x - .25 * hy * hy) - .28 * (1. - hy)) * step(.42, q.y) * step(q.y, 1.2);
    float ey = smoothstep(.02, 0., length(vec2(abs(q.x) - .09, q.y - .24)) - .055);
    vec3 wc = vec3(1.9, .55, .1) * (.6 + .5 * clamp(q.y + 1.2, 0., 1.3)); wc = mix(wc, vec3(.5, .1, .03), hd); wc = mix(wc, vec3(2.6, .75, .12), max(br, ct)); wc = mix(wc, vec3(8., 7., 3.5), ey);
    c = mix(c, wc, max(max(cl, hd), max(br, ct)) * uWit.z) + vec3(1.1, .45, .1) * exp(-length(q * vec2(1., .6)) * 1.5) * .55 * uWit.z;
  }
  return c;
}
vec3 balC(vec3 rd, vec3 n) {   // the balloon: glossy red rubber, lit by the key softbox
  vec3 r = reflect(rd, n); float nv = max(dot(n, -rd), 0.), nl = max(dot(n, KEY), 0.);
  return vec3(3., .62, .3) * (.3 + 1.2 * nl + .5 * pow(1. - nv, 2.)) + env(r) * (.04 + .5 * pow(1. - nv, 4.)) * .5 + vec3(4.) * pow(max(dot(r, KEY), 0.), 120.);
}
vec3 barC(vec3 rd, vec3 n) { return vec3(.035, .028, .05) + env(reflect(rd, n)) * .1 + vec3(.75, .25, .7) * pow(1. - max(dot(n, -rd), 0.), 2.5) * .8; }   // iron: dull, with a violet rim
vec3 look(vec3 ro, vec3 rd) {   // what a mirror ray sees besides chrome: the room, the bars, the balloon
  vec3 c = env(rd), n; float tb = bars(ro, rd, n), ts = sph(ro, rd, uBal);
  if (tb > 0.) c = barC(rd, n);
  if (ts > 0. && (tb < 0. || ts < tb)) c = balC(rd, normalize(ro + rd * ts - uBal.xyz));
  return c;
}
vec3 shade(vec3 p, vec3 rd) {
  vec3 n = nrm(p), r = reflect(rd, n);
  if (eyeD(p) < .004) return vec3(.012, .008, .02) + vec3(.9) * pow(max(dot(r, KEY), 0.), 50.);
  float nv = max(dot(n, -rd), 0.), fr = pow(1. - nv, 3.);
  vec3 c = look(p + n * .02, r), ir = .5 + .5 * cos(6.2832 * (vec3(0., .33, .67) + nv * .9 + n.y * .35 + .1));     // a thin-film tint
  c = mix(c, c * ir * 2., .3) + fr * vec3(.5, .35, .8);
  return c * (.5 + .5 * clamp(sd(p + n * .3) / .3, 0., 1.));
}
vec3 back(vec3 rd) { return mix(vec3(.05, .02, .09), vec3(.012, .006, .03), smoothstep(0., .5, rd.y)) + uGlow * (vec3(.9, .25, .6) * exp(-max(rd.y, 0.) * 13.) * .32 + vec3(.5, .12, .45) * exp(-length(rd.xy * 2.3 - vec2(0., .08)) * 3.2) * .3); }
vec3 scene(vec2 fc) {
  vec2 uv = (fc - .5 * RES) / RES.x;
  vec3 ro = uRo, rd = normalize(uFw * 2.3 + uRt * uv.x + uUp * uv.y), bg = back(rd), n;
  float tf = rd.y < 0. ? (FLOOR - ro.y) / rd.y : -1., t = march(ro, rd, tf > 0. ? tf : 90.), tb = bars(ro, rd, n), ts = sph(ro, rd, uBal), tk = sph(ro, rd, vec4(uBal.xyz - vec3(0., uBal.w * 1.04, 0.), uBal.w * .14));
  float best = tf > 0. ? tf : 1e9; int id = tf > 0. ? 0 : -1;
  if (t > 0. && t < best) { best = t; id = 1; }
  if (tb > 0. && tb < best) { best = tb; id = 2; }
  if (ts > 0. && ts < best) { best = ts; id = 3; }
  if (tk > 0. && tk < best) { best = tk; id = 4; }
  vec3 p = ro + rd * best;
  if (id < 0) return bg;
  if (id == 1) return shade(p, rd);
  if (id == 2) return barC(rd, n);
  if (id == 3) return balC(rd, normalize(p - uBal.xyz));
  if (id == 4) return vec3(1.7, .32, .15);
  vec3 r = reflect(rd, vec3(0., 1., 0.)), q = p + vec3(0., .01, 0.), rc = env(r) * .3;                              // the glossy floor mirrors all of it
  float t2 = march(q, r, 18.), tb2 = bars(q, r, n), ts2 = sph(q, r, uBal), tn = 1e9;
  if (t2 > 0.) { tn = t2; rc = mix(env(r) * .3, shade(q + r * t2, r), exp(-t2 * .4)); }
  if (tb2 > 0. && tb2 < tn) { tn = tb2; rc = mix(env(r) * .3, barC(r, n), exp(-tb2 * .15)); }
  if (ts2 > 0. && ts2 < tn) rc = mix(env(r) * .3, balC(r, normalize(q + r * ts2 - uBal.xyz)) * .8, exp(-ts2 * .1));
  vec3 c = vec3(.02, .012, .04) + rc * (.4 + .6 * pow(1. - max(-rd.y, 0.), 4.));
  c *= .3 + .7 * smoothstep(0., 1.1, sd(p)); if (uBars > .5) c *= .4 + .6 * smoothstep(0., .5, barD(p));
  c += vec3(.55, .12, .45) * .2 * exp(-length(p.xz - uPos.xz) * .3);
  return mix(c, bg, smoothstep(uFade.x, uFade.y, tf));
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 c = vec3(0.); for (int i = uZ; i < 4; i++) c += scene(gl_FragCoord.xy + vec2(i & 1, i >> 1) * .5 - .25);   // four samples per pixel
  c = 1. - exp(-c * .25 * .5);
  float ds = 1e9; for (int i = uZ; i < 4; i++) { vec2 a = uStr[i], ba = uStr[i + 1] - a, pa = gl_FragCoord.xy - a; ds = min(ds, length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0., 1.))); }
  c = mix(c, vec3(.96, .8, .84), smoothstep(2.4, 1.1, ds) * .9);                                                    // the string
  o = vec4(c + (hash(gl_FragCoord.xy) - .5) / 128., 1.);
}`;
})();
