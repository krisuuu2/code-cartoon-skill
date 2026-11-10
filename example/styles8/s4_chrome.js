// styles8/s4_chrome.js: style 4, LIQUID CHROME (inflated Y2K metal). Raw WebGL, no library: one fragment shader raymarches a signed distance field.
// Clawd is a smooth union of rounded boxes that melts into a puddle; the "studio" is a procedural environment with a hard horizon, which is what makes chrome read as chrome.
S8.push({ name: 'LIQUID CHROME', tech: 'raw WebGL · GLSL raymarching', init(stage) {
  const c = cv(); stage.append(c); const g = c.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
  const sh = (type, src) => { const s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s)); return s; };
  const p = g.createProgram(); g.attachShader(p, sh(g.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}')); g.attachShader(p, sh(g.FRAGMENT_SHADER, this.FRAG)); g.bindAttribLocation(p, 0, 'a'); g.linkProgram(p); g.useProgram(p);
  g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer()); g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW); g.enableVertexAttribArray(0); g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
  this.g = g; this.uT = g.getUniformLocation(p, 'uT');
}, draw(t = 0) { this.g.uniform1f(this.uT, t); this.g.drawArrays(this.g.TRIANGLES, 0, 3); }, FRAG: `
precision highp float;
uniform float uT;
const vec2 RES = vec2(1080., 1920.);
const float FLOOR = -1.02;
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float sbox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.) - r; }
float smin(float a, float b, float k) { float h = clamp(.5 + .5 * (b - a) / k, 0., 1.); return mix(b, a, h) - k * h * (1. - h); }
vec3 obj(vec3 p) { p.y -= .12; p.xz *= rot(.5); p.xy *= rot(-.05); return p; }
float eyes(vec3 p) { return sbox(vec3(abs(p.x) - .7, p.y - .44, p.z - .5), vec3(.1, .2, .07), .05); }
float body(vec3 pw) {
  vec3 p = obj(pw), q = vec3(abs(p.x), p.y, p.z);
  float d = sbox(p - vec3(0., .2, 0.), vec3(1.2, .8, .5), .45);
  d = smin(d, sbox(p, vec3(1.62, .2, .3), .2), .22);
  d = smin(d, sbox(q - vec3(.5, -.8, 0.), vec3(.11, .32, .2), .1), .12);
  d = smin(d, sbox(q - vec3(.9, -.8, 0.), vec3(.11, .32, .2), .1), .12);
  d = smin(d, length(p - vec3(1.58, -.44, .04)) - .13, .24);                        // a drop leaving the arm
  d = smin(d, length(p - vec3(-1.6, -.38, 0.)) - .1, .2);
  d += .028 * sin(p.x * 3.4 + uT * 2.) * sin(p.y * 4.6 - uT) * sin(p.z * 3. + 1.);    // the surface is never quite still
  d = smin(d, (length((q - vec3(.7, -1.13, 0.)) * vec3(.62, 2.4, 1.)) - .27) / 2.4, .16);                 // the feet melt into two small pools
  d = min(d, length(pw - vec3(1.62, -.62 - .1 * sin(uT * 2.), 1.0)) - .075);
  d = min(d, length(pw - vec3(-1.25, 2.35, -.4)) - .27); d = min(d, length(pw - vec3(1.35, 2.95, -.9)) - .19); d = min(d, length(pw - vec3(.35, 3.55, .1)) - .11); d = min(d, length(pw - vec3(-.55, 3.05, .5)) - .07);
  return d;
}
float sd(vec3 p) { return min(body(p), eyes(obj(p))); }
vec3 nrm(vec3 p) { vec2 e = vec2(.002, 0.); return normalize(vec3(sd(p + e.xyy) - sd(p - e.xyy), sd(p + e.yxy) - sd(p - e.yxy), sd(p + e.yyx) - sd(p - e.yyx))); }
float march(vec3 ro, vec3 rd) { float t = 0.; for (int i = 0; i < 120; i++) { float d = sd(ro + rd * t); if (d < .0015) return t; t += d * .85; if (t > 30.) break; } return -1.; }
vec3 env(vec3 d) {   // the studio: white at the horizon, hot pink, violet above; black just under the horizon, then blue to cyan
  float y = d.y;
  vec3 up = mix(vec3(1., .96, 1.), vec3(1., .3, .72), smoothstep(0., .22, y)); up = mix(up, vec3(.2, .05, .52), smoothstep(.18, .62, y)); up = mix(up, vec3(.02, .0, .08), smoothstep(.6, 1., y));
  vec3 dn = mix(vec3(.14, .03, .28), vec3(.04, .16, .62), smoothstep(0., -.3, y)); dn = mix(dn, vec3(.35, .9, 1.), smoothstep(-.3, -1., y));
  vec3 c = mix(dn, up, smoothstep(-.008, .008, y));
  c += vec3(2.6) * smoothstep(.93, .975, dot(d, normalize(vec3(-.4, .8, .45))));          // key softbox
  c += vec3(1.6, 1.3, 1.1) * smoothstep(.985, .996, dot(d, normalize(vec3(.75, .3, .6))));
  return c;
}
vec3 shade(vec3 p, vec3 rd) {
  vec3 n = nrm(p), r = reflect(rd, n);
  if (eyes(obj(p)) < .004) return vec3(.012, .008, .02) + vec3(.9) * pow(max(dot(r, normalize(vec3(-.4, .8, .45))), 0.), 50.);
  float nv = max(dot(n, -rd), 0.), fr = pow(1. - nv, 3.);
  vec3 c = env(r), ir = .5 + .5 * cos(6.2832 * (vec3(0., .33, .67) + nv * .9 + n.y * .35 + .1));     // a thin-film tint
  c = mix(c, c * ir * 2., .3) + fr * vec3(.5, .35, .8);
  return c * (.5 + .5 * clamp(sd(p + n * .3) / .3, 0., 1.));
}
vec3 back(vec3 rd, vec2 uv) { return mix(vec3(.05, .02, .09), vec3(.012, .006, .03), smoothstep(0., .5, rd.y)) + vec3(.9, .25, .6) * exp(-max(rd.y, 0.) * 13.) * .32 + vec3(.5, .12, .45) * exp(-length(uv - vec2(0., .08)) * 3.2) * .3; }
vec3 scene(vec2 fc) {
  vec2 uv = (fc - .5 * RES) / RES.x;
  vec3 ro = vec3(0., .6, 9.6), rd = normalize(vec3(uv.x, uv.y - .17, -2.3)); rd.yz *= rot(.075);
  float t = march(ro, rd), tf = rd.y < 0. ? (FLOOR - .02 - ro.y) / rd.y : -1.;
  vec3 bg = back(rd, uv);
  if (t > 0. && (tf < 0. || t < tf)) return shade(ro + rd * t, rd);
  if (tf < 0.) return bg;
  vec3 pf = ro + rd * tf, r = reflect(rd, vec3(0., 1., 0.)); float t2 = march(pf + vec3(0., .01, 0.), r);   // the glossy floor
  float fd = exp(-max(t2, 0.) * .45); vec3 rc = t2 > 0. ? mix(env(r) * .2, shade(pf + r * t2, r) * .7, fd) : env(r) * .2;
  vec3 c = vec3(.02, .012, .04) + rc * (.3 + .7 * pow(1. - max(-rd.y, 0.), 4.));
  c *= .3 + .7 * smoothstep(0., 1.1, sd(pf)); c += vec3(.55, .12, .45) * .1 * exp(-length(pf.xz) * .3);
  return mix(c, bg, smoothstep(7., 24., tf));
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 c = vec3(0.); for (int i = 0; i < 4; i++) c += scene(gl_FragCoord.xy + vec2(mod(float(i), 2.), floor(float(i) / 2.)) * .5 - .25);
  c = 1. - exp(-c * .25 * 1.5); c += (hash(gl_FragCoord.xy) - .5) / 128.;
  gl_FragColor = vec4(c, 1.);
}` });
