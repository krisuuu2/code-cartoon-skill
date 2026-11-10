// styles8/core.js: shared bits of the eight style frames (styles8.html). Each style pushes { name, tech, init(stage), draw(t) } and draws Clawd its own way.
const S8 = [], FW = 1080, FH = 1920, TAU = Math.PI * 2;
const FONTS = ['800 40px "Baloo 2"', '40px Bangers', '8px "Press Start 2P"', '700 22px "JetBrains Mono"', '900 40px Jost', '500 40px Jost', '40px Chango', '40px Limelight'];
// Clawd (the Claude Code mark) on its 16 x 10 grid: rects [col, row, w, h]
const CLAWD = { body: [[2, 0, 12, 8], [0, 4, 16, 2], [3, 8, 1, 2], [5, 8, 1, 2], [10, 8, 1, 2], [12, 8, 1, 2]], eyes: [[4, 2, 1, 2], [11, 2, 1, 2]] };
const hitR = (L, c, r) => L.some(([x, y, w, h]) => c >= x && c < x + w && r >= y && r < y + h);
const cv = (w = FW, h = FH) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.style.cssText = `position:absolute;left:0;top:0;width:${FW}px;height:${FH}px`; return c; };
function rng(seed) { return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const h2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return (h2(xi, yi) * (1 - u) + h2(xi + 1, yi) * u) * (1 - v) + (h2(xi, yi + 1) * (1 - u) + h2(xi + 1, yi + 1) * u) * v; }
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// A fullscreen GLSL ES 3 fragment shader, accumulated over N passes into a float target and then tone-mapped (ACES, gamma, a little vignette and grain).
// The shader declares `uniform float uSeed, uT, uInv; out vec4 o;` and adds linear radiance * uInv per pass: that is path tracing (many random passes) or plain anti-aliasing (a few jittered ones).
// Many short passes instead of one long one, because a single draw call over ~2 s resets the GPU driver on Windows.
function accumGL(stage, frag, passes) {
  const r3 = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true }); r3.setPixelRatio(1); r3.setSize(FW, FH, false); r3.domElement.style.cssText = 'position:absolute;left:0;top:0'; stage.append(r3.domElement);
  if (!r3.getContext().getExtension('EXT_float_blend')) throw new Error('EXT_float_blend missing: cannot accumulate into a float target');
  const rt = new THREE.WebGLRenderTarget(FW, FH, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false }), geo = new THREE.PlaneGeometry(2, 2), cam = new THREE.Camera();
  const mk = (fs, o) => { const m = new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: 'in vec3 position; void main() { gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: fs, depthTest: false, depthWrite: false, ...o }), s = new THREE.Scene(), q = new THREE.Mesh(geo, m); q.frustumCulled = false; s.add(q); return [m, s]; };
  const [pm, ps] = mk(frag, { uniforms: { uSeed: { value: 0 }, uT: { value: 0 }, uInv: { value: 1 / passes } }, transparent: true, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor });
  const [, ss] = mk(`precision highp float; precision highp sampler2D; uniform sampler2D tA; out vec4 o;
    void main() { vec3 c = texelFetch(tA, ivec2(gl_FragCoord.xy), 0).rgb; c = clamp(c * (2.51 * c + .03) / (c * (2.43 * c + .59) + .14), 0., 1.); c = pow(c, vec3(1. / 2.2));
      vec2 q = gl_FragCoord.xy / vec2(1080., 1920.) - .5; c *= 1. - dot(q, q) * .3; c += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - .5) * .016; o = vec4(c, 1.); }`, { uniforms: { tA: { value: rt.texture } } });
  return t => { r3.autoClear = false; r3.setRenderTarget(rt); r3.setClearColor(0, 0); r3.clear(); pm.uniforms.uT.value = t; for (let i = 0; i < passes; i++) { pm.uniforms.uSeed.value = i; r3.render(ps, cam); } r3.setRenderTarget(null); r3.render(ss, cam); };
}
// Clawd as a signed distance field, shared by the two realistic shaders: body(p) and eyes(p) in its own space (3.2 wide, feet at y = -1.1, face at z = +.5)
const CLAWD_SDF = `
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float sbox(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.) - r; }
float body(vec3 p) { vec3 q = vec3(abs(p.x), p.y, p.z); float d = sbox(p - vec3(0., .2, 0.), vec3(1.2, .8, .5), .09); d = min(d, sbox(p, vec3(1.6, .2, .3), .08)); d = min(d, sbox(q - vec3(.5, -.8, 0.), vec3(.1, .3, .3), .05)); return min(d, sbox(q - vec3(.9, -.8, 0.), vec3(.1, .3, .3), .05)); }
float eyes(vec3 p) { return sbox(vec3(abs(p.x) - .7, p.y - .4, p.z - .5), vec3(.1, .2, .03), .02); }
`;
