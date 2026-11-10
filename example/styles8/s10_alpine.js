// styles8/s10_alpine.js: style 10, ALPINE LAKE (realistic, outdoors). One fragment shader, no mesh and no texture: the mountains are a noise function with
// fake erosion (each octave is damped by the slope so far), marched as a height field; snow, rock, grass and forest are chosen from height and slope;
// the sun casts soft shadows, the air turns distance blue, and the lake reflects all of it through a Fresnel term and a rippled normal. Six jittered passes for anti-aliasing.
S8.push({ name: 'ALPINE LAKE', tech: 'GLSL terrain · fbm + atmosphere', init(stage) { this.draw = accumGL(stage, this.FRAG, 6); }, FRAG: `precision highp float; precision highp int;
uniform float uSeed, uT, uInv; out vec4 o;
const vec2 RES = vec2(1080., 1920.);
const vec3 SUN = vec3(-.7197, .4598, -.5198), CP = vec3(.35, .71, 1.2); const float CS = .6; const mat2 M2 = mat2(.8, -.6, .6, .8);
${CLAWD_SDF}
float hash(vec2 p) { p = fract(p * vec2(.3183099, .3678794) + vec2(.71, .113)) * 50.; return fract(p.x * p.y * (p.x + p.y)); }
vec3 noised(vec2 x) { vec2 p = floor(x), w = fract(x), u = w * w * w * (w * (w * 6. - 15.) + 10.), du = 30. * w * w * (w * (w - 2.) + 1.); float a = hash(p), b = hash(p + vec2(1., 0.)), c = hash(p + vec2(0., 1.)), d = hash(p + vec2(1., 1.)), k1 = b - a, k2 = c - a, k4 = a - b - c + d; return vec3(a + k1 * u.x + k2 * u.y + k4 * u.x * u.y, du * vec2(k1 + k4 * u.y, k2 + k4 * u.x)); }
float fbm(vec2 p) { float a = 0., b = .5; for (int i = 0; i < 5; i++) { a += b * noised(p).x; b *= .5; p = M2 * p * 2.03; } return a; }
float H(vec2 p, int oct) {   // the ground; water is everything under y = 0
  vec2 q = (p + vec2(13., 7.)) * .115, d = vec2(0.); float a = 0., b = 1.;
  for (int i = 0; i < 11; i++) { if (i >= oct) break; vec3 n = noised(q); d += n.yz; a += b * n.x / (1. + dot(d, d)); b *= .5; q = M2 * q * 2.; }
  float far = smoothstep(9., 30., p.y), h = a * (3.1 + 7.2 * far) - 1.35 + 2.0 * far;
  vec2 bw = (p - vec2(0., 1.)) * vec2(.1, .068); h -= 2.9 * exp(-dot(bw, bw));                                  // the basin of the lake
  return max(h, .05 + .05 * fbm(p * 2.3) - 2.5 * smoothstep(1.0, 1.55, length((p - CP.xz) * vec2(.72, 1.2)) + .5 * fbm(p * 1.1)));                      // the slab Clawd stands on
}
float castT(vec3 ro, vec3 rd, float t, float tmax) { for (int i = 0; i < 300; i++) { vec3 p = ro + rd * t; float h = p.y - H(p.xz, 6); if (h < .001 * t || t > tmax) break; t += .27 * h; } return t; }
vec3 toC(vec3 p) { p = (p - CP) / CS; p.xz = rot(3.5) * p.xz; return p; }
float sdC(vec3 p) { vec3 q = toC(p); return min(body(q), eyes(q)) * CS; }
float castC(vec3 ro, vec3 rd) { vec3 oc = ro - CP; float b = dot(oc, rd), c = dot(oc, oc) - 2. * CS * CS * 2., h = b * b - c; if (h < 0.) return -1.; h = sqrt(h); float t = max(-b - h, 0.), te = -b + h; for (int i = 0; i < 70; i++) { float d = sdC(ro + rd * t); if (d < .0012) return t; t += d; if (t > te) break; } return -1.; }
float shadowC(vec3 p) { vec3 oc = p - CP; float b = dot(oc, SUN), c = dot(oc, oc) - 2. * CS * CS * 2.; if (b * b - c < 0.) return 1.; float r = 1., t = .03; for (int i = 0; i < 28; i++) { float d = sdC(p + SUN * t); r = min(r, 9. * d / t); t += clamp(d, .02, .3); if (r < .01 || t > 4.) break; } return clamp(r, 0., 1.); }
float shadowT(vec3 p) { float r = 1., t = .08; for (int i = 0; i < 44; i++) { vec3 q = p + SUN * t; float h = q.y - H(q.xz, 5); r = min(r, 9. * h / t); t += clamp(h, .06, 1.4); if (r < .01 || t > 30.) break; } return clamp(r, 0., 1.); }
vec3 sky(vec3 rd) {
  float y = max(rd.y, 0.); vec3 c = mix(vec3(.56, .73, .93), vec3(.10, .27, .66), pow(y, .5));
  float s = max(dot(rd, SUN), 0.); c += vec3(1., .82, .55) * (pow(s, 5.) * .12 + pow(s, 90.) * .5);
  if (rd.y > .015) { vec2 q = rd.xz / rd.y * 1.1 + vec2(3. + uT * .02, 1.); float d = smoothstep(.56, .8, fbm(q)), d2 = smoothstep(.56, .8, fbm(q + SUN.xz * .22)); c = mix(c, mix(vec3(.55, .62, .74), vec3(1.), clamp(.55 + (d - d2) * 1.6, 0., 1.)), d * smoothstep(.015, .16, rd.y) * .9); }
  return c;
}
vec3 fog(vec3 c, float t) { return mix(c, vec3(.50, .65, .86), 1. - exp(-t * .0072)); }
vec3 shadeT(vec3 p, float t, vec3 rd) {
  float e = .0018 * t + .0008; vec3 n = normalize(vec3(H(p.xz - vec2(e, 0.), 10) - H(p.xz + vec2(e, 0.), 10), 2. * e, H(p.xz - vec2(0., e), 10) - H(p.xz + vec2(0., e), 10)));
  float nz = noised(p.xz * 3.1).x, nz2 = fbm(p.xz * .55 + 4.);
  vec3 rock = mix(vec3(.07, .06, .055), vec3(.15, .125, .1), nz) * (.86 + .28 * noised(vec2(p.y * 5. + nz * 3., p.x * .9 + p.z * .7)).x) * (.72 + .56 * noised(vec2((p.x + p.z) * 3.2, p.y * .7)).x);   // strata and gullies   // strata
  vec3 alb = mix(rock, mix(vec3(.07, .12, .03), vec3(.17, .2, .06), nz2), smoothstep(.56, .78, n.y) * smoothstep(3.4, 1.9, p.y));
  alb = mix(alb, vec3(.022, .055, .03), smoothstep(.5, .72, n.y) * smoothstep(.42, .54, nz2) * smoothstep(2.6, 1.3, p.y) * smoothstep(.1, .35, p.y));     // forest
  float snow = smoothstep(4.3, 5.4, p.y + nz * .9) * smoothstep(.5, .72, n.y + nz * .1); alb = mix(alb, vec3(.86, .89, .96), snow);
  if (length((p.xz - CP.xz) * vec2(.72, 1.2)) < 1.7) alb = rock * .8; alb *= mix(.4, 1., smoothstep(.0, .13, p.y));                                                                                                              // the shore is wet
  float sh = shadowT(p + n * .02) * shadowC(p + n * .01), dif = max(dot(n, SUN), 0.) * sh;
  vec3 c = alb * (dif * vec3(1., .93, .8) * 3.3 + (.5 + .5 * n.y) * vec3(.26, .38, .62) * .5 + max(dot(n, normalize(-SUN * vec3(1., 0., 1.))), 0.) * vec3(.3, .26, .2) * .16);
  return c + snow * sh * pow(max(dot(reflect(rd, n), SUN), 0.), 14.) * .35;
}
vec3 shadeC(vec3 p, vec3 rd) {
  vec2 e = vec2(.0015, 0.); vec3 n = normalize(vec3(sdC(p + e.xyy) - sdC(p - e.xyy), sdC(p + e.yxy) - sdC(p - e.yxy), sdC(p + e.yyx) - sdC(p - e.yyx))), r = reflect(rd, n);
  bool eye = eyes(toC(p)) * CS < .003; vec3 alb = eye ? vec3(.012) : vec3(.70, .15, .028) * (.82 + .3 * noised(p.xy * 7. + p.z * 3.).x);          // painted steel, a little weathered
  float sh = shadowC(p + n * .01), fr = .04 + .96 * pow(1. - max(dot(n, -rd), 0.), 5.);
  vec3 c = alb * (max(dot(n, SUN), 0.) * sh * vec3(1., .93, .8) * 3.3 + (.5 + .5 * n.y) * vec3(.26, .38, .62) * .7 + max(-n.y, 0.) * vec3(.08, .18, .2));
  return c + sky(vec3(r.x, abs(r.y), r.z)) * fr * (eye ? .9 : .45) + vec3(1., .9, .75) * pow(max(dot(r, SUN), 0.), 60.) * sh * (eye ? 3. : .7);
}
vec3 water(vec3 p, vec3 rd, float t) {
  float amp = .016 / (1. + t * .05); vec2 g = (noised(p.xz * vec2(1.5, 6.) + vec2(uT * .3, uT * .2)).yz * vec2(.4, 1.) + noised(M2 * p.xz * vec2(4., 12.) - uT * .4).yz * .3) * amp;
  vec3 n = normalize(vec3(-g.x, 1., -g.y)), r = reflect(rd, n); r.y = abs(r.y); float fr = .02 + .98 * pow(1. - max(dot(n, -rd), 0.), 5.);
  vec3 q = p + vec3(0., .01, 0.), rc = sky(r); float tt = castT(q, r, .15, 110.), tc = castC(q, r);
  if (tc > 0. && tc < tt) rc = shadeC(q + r * tc, r); else if (tt < 110.) rc = fog(shadeT(q + r * tt, tt, r), tt);
  float depth = -H(p.xz, 5), sh = .35 + .65 * shadowC(q) * shadowT(q); vec3 deep = mix(vec3(.07, .22, .2), vec3(.008, .045, .065), smoothstep(0., .7, depth)) * sh;   // turquoise shallows, dark middle
  return mix(deep, rc, fr) + vec3(1., .9, .7) * pow(max(dot(r, SUN), 0.), 300.) * 2.;
}
vec3 render(vec3 ro, vec3 rd) {
  float tt = castT(ro, rd, .3, 120.), tw = rd.y < 0. ? -ro.y / rd.y : 1e9, tc = castC(ro, rd);
  if (tc > 0. && tc < min(tt, tw)) return fog(shadeC(ro + rd * tc, rd), tc);
  if (tw < tt) return fog(water(ro + rd * tw, rd, tw), tw);
  return tt < 120. ? fog(shadeT(ro + rd * tt, tt, rd), tt) : sky(rd);
}
void main() {
  vec2 j = fract(vec2(.7548777, .5698403) * (uSeed + 1.)) - .5, uv = (gl_FragCoord.xy + j - .5 * RES) / RES.x;
  vec3 ro = vec3(-.2, .78, -7.4), ta = vec3(.3, 2.15, 6.), f = normalize(ta - ro), r = normalize(cross(f, vec3(0., 1., 0.))), u = cross(r, f);
  o = vec4(render(ro, normalize(f * 1.5 + r * uv.x + u * uv.y)) * uInv * .82, 1.);
}` });
