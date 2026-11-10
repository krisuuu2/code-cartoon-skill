// styles8/s6_flow.js: style 6, GENERATIVE PLOTTER (a flow field, after Tyler Hobbs / Jobard-Lefer). Pure algorithm on a 2D canvas: streamlines walk a noise field,
// an occupancy grid stops a line before it touches another, and a line never crosses the edge of Clawd, where the field turns 90 degrees. Nothing is drawn "by hand".
S8.push({ name: 'GENERATIVE PLOTTER', tech: 'flow field · pure algorithm', init(stage) {
  const c = cv(), x = c.getContext('2d'), R = rng(52); stage.append(c);
  x.fillStyle = '#0E1A3A'; x.fillRect(0, 0, FW, FH);
  const U = 50, CX = 140, CY = 740, X0 = 70, X1 = 1010, Y0 = 160, Y1 = 1780, CELL = 5, GW = Math.ceil(FW / CELL), GH = Math.ceil(FH / CELL), occ = new Int32Array(GW * GH);
  const region = (px, py) => { const cc = (px - CX) / U, rr = (py - CY) / U; return hitR(CLAWD.eyes, cc, rr) ? 2 : hitR(CLAWD.body, cc, rr) ? 1 : 0; };
  const ang = (px, py, reg) => reg ? -.42 + (vnoise(px * .006 + 50, py * .006) - .5) * .9 : (vnoise(px * .0015, py * .0015) * 2 + vnoise(px * .0052 + 9, py * .0052) * .45) * TAU * .85;
  const near = (px, py, rad, id, mark) => { const a0 = Math.max(0, (px - rad) / CELL | 0), a1 = Math.min(GW - 1, (px + rad) / CELL | 0), b0 = Math.max(0, (py - rad) / CELL | 0), b1 = Math.min(GH - 1, (py + rad) / CELL | 0);
    for (let b = b0; b <= b1; b++) for (let a = a0; a <= a1; a++) { if (mark) occ[b * GW + a] = id; else if (occ[b * GW + a] && occ[b * GW + a] !== id) return true; } return false; };
  const OUT = ['#EDE6D3', '#EDE6D3', '#EDE6D3', '#EDE6D3', '#7FB2E5', '#7FB2E5', '#7FB2E5', '#3D62B8', '#3D62B8', '#F2B33D'], IN = ['#FF5A36', '#FF5A36', '#FF5A36', '#FF5A36', '#FF5A36', '#FFB703', '#FFB703', '#FFB703', '#FFE9C7'];
  let id = 0, n = 0; x.lineCap = 'round'; x.lineJoin = 'round';
  function line(sx, sy) {
    const reg = region(sx, sy); if (reg === 2) return; const w = reg ? 2.5 + R() * 3.5 : 1.4 + R() * R() * 8, rad = w / 2 + (reg ? 1.6 : 2.4); id++; if (near(sx, sy, rad, id)) return;
    const half = dir => { const pts = []; let px = sx, py = sy; for (let i = 0; i < 420; i++) { const a = ang(px, py, reg) + dir; px += Math.cos(a) * 3; py += Math.sin(a) * 3; if (px < X0 || px > X1 || py < Y0 || py > Y1 || region(px, py) !== reg || near(px, py, rad, id)) break; pts.push([px, py]); } return pts; };
    const pts = [...half(Math.PI).reverse(), [sx, sy], ...half(0)]; if (pts.length < (reg ? 3 : 10)) return;
    pts.forEach(([px, py]) => near(px, py, rad, id, true)); n++;
    x.strokeStyle = (reg ? IN : OUT)[R() * (reg ? IN : OUT).length | 0]; x.lineWidth = w; x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.stroke();
  }
  for (let i = 0; i < 40000; i++) line(CX + R() * 16 * U, CY + R() * 10 * U);       // Clawd first, so its edge is packed
  for (let i = 0; i < 70000; i++) line(X0 + R() * (X1 - X0), Y0 + R() * (Y1 - Y0));
  x.strokeStyle = 'rgba(237,230,211,.55)'; x.lineWidth = 2; x.strokeRect(50, 140, 980, 1660);
  x.fillStyle = '#EDE6D3'; x.font = '700 24px "JetBrains Mono"'; x.fillText(`FLOW FIELD · ${n.toLocaleString('en-US')} STREAMLINES · SEED 52`, 52, 1850); x.textAlign = 'right'; x.fillText('PLOT 06', 1030, 112);
  for (let i = 0; i < 16000; i++) { x.fillStyle = `rgba(255,255,255,${R() * .05})`; x.fillRect(R() * FW, R() * FH, 2, 2); }
} });
