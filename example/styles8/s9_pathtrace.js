// styles8/s9_pathtrace.js: style 9, STUDIO PHOTO (realistic). A path tracer written in one fragment shader: every pixel shoots 512 random light paths (128 passes x 4)
// that bounce up to 7 times between a ceramic Clawd, a paper sweep, a glass ball, a brass ball and three softboxes. Nothing is faked: the soft shadows, the orange light
// bleeding onto the paper, the refraction in the glass and the depth of field (a thin lens) all fall out of the same loop.
S8.push({ name: 'STUDIO PHOTO', tech: 'GLSL path tracer · 512 rays/px', init(stage) { this.draw = accumGL(stage, this.FRAG, 128); }, FRAG: `precision highp float; precision highp int;
uniform float uSeed, uT, uInv; out vec4 o;
const vec2 RES = vec2(1080., 1920.); const int SPP = 4; const float YAW = -.4, EXPO = .62;
uint st;
float rnd() { st = st * 747796405u + 2891336453u; uint w = ((st >> ((st >> 28u) + 4u)) ^ st) * 277803737u; return float((w >> 22u) ^ w) / 4294967296.; }
vec3 ball() { float z = rnd() * 2. - 1., a = 6.2832 * rnd(), r = sqrt(1. - z * z); return vec3(r * cos(a), r * sin(a), z); }
${CLAWD_SDF}
float sd(vec3 p) { return min(body(p), eyes(p)); }
vec3 toO(vec3 p) { p.xz = rot(YAW) * p.xz; return p; }
vec3 fromO(vec3 p) { p.xz = rot(-YAW) * p.xz; return p; }
// the nearest hit: its distance, normal and material (0 paper, 1 ceramic, 2 eye, 3 glass, 4 teal lacquer, 5 brass; -1 = the ray left the scene)
float isect(vec3 ro, vec3 rd, out vec3 n, out int m) {
  float t = 1e9; m = -1; n = vec3(0.);
  if (rd.y < 0.) { float a = (-1.1 - ro.y) / rd.y; if (a > 1e-3) { t = a; n = vec3(0., 1., 0.); m = 0; } }
  if (rd.z < 0.) { float a = (-6. - ro.z) / rd.z; if (a > 1e-3 && a < t) { t = a; n = vec3(0., 0., 1.); m = 0; } }
  for (int i = 0; i < 3; i++) { vec4 s = i == 0 ? vec4(1.42, -.6, 1.25, .5) : i == 1 ? vec4(-1.5, -.72, 1.2, .38) : vec4(-.92, -.87, 2.15, .23); vec3 oc = ro - s.xyz; float b = dot(oc, rd), c = dot(oc, oc) - s.w * s.w, h = b * b - c;
    if (h > 0.) { h = sqrt(h); float a = -b - h; if (a < 1e-3) a = -b + h; if (a > 1e-3 && a < t) { t = a; n = (ro + rd * a - s.xyz) / s.w; m = 3 + i; } } }
  vec3 oo = toO(ro), od = toO(rd), inv = 1. / od, t0 = (vec3(-1.72, -1.12, -.62) - oo) * inv, t1 = (vec3(1.72, 1.02, .62) - oo) * inv, lo = min(t0, t1), hi = max(t0, t1);
  float tn = max(max(lo.x, lo.y), max(lo.z, 0.)), tf = min(min(hi.x, hi.y), min(hi.z, t));
  if (tn < tf) { float a = tn; for (int i = 0; i < 80; i++) { vec3 p = oo + od * a; float d = sd(p); if (d < 6e-4) { vec2 e = vec2(.001, 0.); n = fromO(normalize(vec3(sd(p + e.xyy) - sd(p - e.xyy), sd(p + e.yxy) - sd(p - e.yxy), sd(p + e.yyx) - sd(p - e.yyx)))); m = eyes(p) < .002 ? 2 : 1; t = a; break; } a += d; if (a > tf) break; } }
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
vec3 trace(vec3 ro, vec3 rd) {
  vec3 col = vec3(0.), thr = vec3(1.);
  for (int b = 0; b < 7; b++) {
    vec3 n; int m; float t = isect(ro, rd, n, m); if (m < 0) { col += thr * env(rd); break; }
    vec3 p = ro + rd * t;
    if (m == 3) { float ci = dot(rd, n), eta = ci < 0. ? 1. / 1.5 : 1.5; vec3 nn = ci < 0. ? n : -n, rf = refract(rd, nn, eta); float c = ci < 0. ? -ci : dot(rf, n), F = rf == vec3(0.) ? 1. : .04 + .96 * pow(1. - clamp(c, 0., 1.), 5.);
      if (rnd() < F) { rd = reflect(rd, nn); ro = p + nn * .002; } else { rd = rf; ro = p - nn * .002; } continue; }
    if (m == 5) { rd = normalize(reflect(rd, n) + .05 * ball()); if (dot(rd, n) <= 0.) break; thr *= vec3(1., .74, .32); ro = p + n * .002; continue; }
    vec3 alb = m == 0 ? vec3(.74, .70, .64) : m == 1 ? vec3(.80, .17, .035) : m == 2 ? vec3(.012) : vec3(.04, .33, .37);
    float F = m == 0 ? 0. : .04 + .96 * pow(1. - max(dot(-rd, n), 0.), 5.);
    if (rnd() < F) { rd = normalize(reflect(rd, n) + (m == 1 ? .09 : .03) * ball()); if (dot(rd, n) <= 0.) break; } else { rd = normalize(n + ball() * .999); thr *= alb; }
    ro = p + n * .002;
  }
  return col;
}
void main() {
  st = uint(gl_FragCoord.x) * 1973u + uint(gl_FragCoord.y) * 9277u + uint(uSeed) * 26699u + 1u; rnd();
  vec3 ro0 = vec3(1.0, 1.25, 9.2), ta = vec3(0., .2, 0.), f = normalize(ta - ro0), r = normalize(cross(f, vec3(0., 1., 0.))), u = cross(r, f), acc = vec3(0.);
  for (int s = 0; s < SPP; s++) {
    vec2 uv = (gl_FragCoord.xy + vec2(rnd(), rnd()) - .5 - .5 * RES) / RES.x;
    vec3 rd = normalize(f * 2.3 + r * uv.x + u * uv.y), fp = ro0 + rd * (8.85 / dot(rd, f));   // the plane of focus runs through Clawd's face
    float a = 6.2832 * rnd(), q = .1 * sqrt(rnd()); vec3 ro = ro0 + (r * cos(a) + u * sin(a)) * q;
    acc += min(trace(ro, normalize(fp - ro)), vec3(14.));
  }
  o = vec4(acc / float(SPP) * uInv * EXPO, 1.);
}` });
