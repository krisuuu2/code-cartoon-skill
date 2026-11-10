// styles8/s7_ascii.js: style 7, ASCII TERMINAL (phosphor green). No canvas: the frame is one <pre>. A tiny software raymarcher shoots one ray per character cell
// at a 3D Clawd and writes a character from a brightness ramp; the tube (scanlines, glow, vignette) is CSS.
S8.push({ name: 'ASCII TERMINAL', tech: 'DOM text · software raymarcher', init(stage) {
  stage.style.background = '#020703';
  const mk = css => { const e = document.createElement('div'); e.style.cssText = 'position:absolute;inset:0;' + css; stage.append(e); return e; };
  mk('background:radial-gradient(ellipse at 50% 48%,rgba(40,170,90,.2),transparent 62%)');
  this.pre = document.createElement('pre'); this.pre.style.cssText = 'position:absolute;left:12px;top:0;margin:0;font:700 22px/22px "JetBrains Mono",monospace;color:#56FF8E;white-space:pre;text-shadow:0 0 5px rgba(86,255,142,.8),0 0 20px rgba(86,255,142,.4)'; stage.append(this.pre);
  mk('background:repeating-linear-gradient(0deg,rgba(0,0,0,.3) 0 2px,transparent 2px 4px)'); mk('background:radial-gradient(ellipse at center,transparent 52%,rgba(0,0,0,.8) 100%)');
}, draw(t = 0) {
  const COLS = 80, ROWS = 87, R0 = 15, RN = 58, CW = 13.2, CH = 22, F = 2100, RAMP = ' .:-=+*#%@', yaw = .58 + t * .6, pit = .34;
  const f = [-Math.sin(yaw) * Math.cos(pit), -Math.sin(pit), -Math.cos(yaw) * Math.cos(pit)], rt = [Math.cos(yaw), 0, -Math.sin(yaw)], up = [rt[1] * f[2] - rt[2] * f[1], rt[2] * f[0] - rt[0] * f[2], rt[0] * f[1] - rt[1] * f[0]];
  const ro = [-f[0] * 8, -f[1] * 8 - .1, -f[2] * 8], Lv = [0, 1, 2].map(i => -rt[i] * .45 + up[i] * .7 - f[i] * .55), ll = Math.hypot(...Lv), Ld = Lv.map(v => v / ll);
  const box = (x, y, z, cx, cy, hx, hy, hz) => { const a = Math.abs(x - cx) - hx, b = Math.abs(y - cy) - hy, c = Math.abs(z) - hz; return Math.hypot(Math.max(a, 0), Math.max(b, 0), Math.max(c, 0)) + Math.min(Math.max(a, b, c), 0); };
  const sd = (x, y, z) => { const ax = Math.abs(x); return Math.min(box(x, y, z, 0, .2, 1.2, .8, .45), box(x, y, z, 0, 0, 1.6, .2, .3), box(ax, y, z, .5, -.8, .1, .2, .3), box(ax, y, z, .9, -.8, .1, .2, .3)); };
  const rows = [...Array(ROWS)].map(() => ''); let hits = 0; const t0 = performance.now();
  for (let r = 0; r < RN; r++) { let s = '';
    for (let c = 0; c < COLS; c++) {
      const sx = (c - COLS / 2 + .5) * CW, sy = (RN / 2 - r - .5) * CH; let d = [0, 1, 2].map(i => f[i] * F + rt[i] * sx + up[i] * sy); const dl = Math.hypot(...d); d = d.map(v => v / dl);
      let tt = 4, hit = false; for (let i = 0; i < 40 && tt < 14; i++) { const q = sd(ro[0] + d[0] * tt, ro[1] + d[1] * tt, ro[2] + d[2] * tt); if (q < .004) { hit = true; break; } tt += q; }
      let ch = ' ';
      if (hit) { const p = [0, 1, 2].map(i => ro[i] + d[i] * tt), e = .003, n = [sd(p[0] + e, p[1], p[2]) - sd(p[0] - e, p[1], p[2]), sd(p[0], p[1] + e, p[2]) - sd(p[0], p[1] - e, p[2]), sd(p[0], p[1], p[2] + e) - sd(p[0], p[1], p[2] - e)], nl = Math.hypot(...n) || 1;
        const eye = n[2] / nl > .9 && Math.abs(Math.abs(p[0]) - .7) < .1 && Math.abs(p[1] - .4) < .2, bri = .2 + .8 * Math.max(0, (n[0] * Ld[0] + n[1] * Ld[1] + n[2] * Ld[2]) / nl) + p[1] * .05;
        ch = eye ? ' ' : RAMP[clamp(Math.round(bri * 9), 1, 9)]; hits++; }
      else if (d[1] < 0) { const tf = (-1 - ro[1]) / d[1], px = ro[0] + d[0] * tf, pz = ro[2] + d[2] * tf, rr = Math.hypot(px, pz);   // the floor is a small pool of light
        ch = rr < 1.9 ? '.' : rr < 2.35 && (c + r) & 1 ? '.' : ' '; }
      s += ch;
    } rows[R0 + r] = s; }
  const ms = (performance.now() - t0).toFixed(0);
  rows[9] = ' clawd@fable-5.2:~/styles$ ./render clawd.sdf --ascii --cols 80';
  rows[11] = ` raymarching ${COLS} x ${RN} cells, 40 steps per ray ... done in ${ms} ms`;
  rows[12] = ' 0 images. 0 polygons. 1 font.';
  rows[R0 + RN + 2] = ` ${hits} cells hit · ramp "${RAMP.trim()}" · frame ${String(Math.round(t * 50)).padStart(4, '0')}`;
  rows[R0 + RN + 4] = ' clawd@fable-5.2:~/styles$ ' + (Math.floor(t * 2) % 2 ? ' ' : '█');
  this.pre.textContent = rows.join('\n');
} });
