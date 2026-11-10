// balloon/sc_home.js: the finale, "the way home". Clawd drifts down under the balloon on one continuous path (FILM.glidePose) and the world is
// redrawn on every word of the list: this scene draws nothing itself, it asks the scene of the current word for its glide(g) frame.
// The cuts sit on the starts of the spoken words (word times of the recorded line, from the timeline), so re-recording the line moves them.
FILM.add({ id: 'home', enter: 'cut',
  WORDS: [['clouds', 'anime'], ['water', 'lake'], ['light', 'studio'], ['rubber', 'hose'], ['shapes', 'bauhaus'], ['letters', 'ascii'], ['wind', 'flow'], ['corners', 'lowpoly'], ['metal', 'chrome'], ['pixels', 'pixel'], ['ink', 'comic'], ['paper', 'book']],
  init() {},
  plan(S) {   // [{ u, id }]: from which scene second which style is on screen
    if (this._p) return this._p; const l = S.lines[0], ws = l.words.map(w => [w[0].toLowerCase().replace(/[^a-z]/g, ''), w[1]]), p = [{ u: 0, id: 'anime' }]; let from = 0;
    this.WORDS.forEach(([word, id], i) => { let j = ws.findIndex((w, n) => n >= from && w[0] === word); const u = j < 0 ? l.t0 + l.dur * (.3 + .05 * i) : l.t0 + ws[j][1]; if (j >= 0) from = j + 1; if (i) p.push({ u: +u.toFixed(3), id }); else p[0].first = +u.toFixed(3); });
    return this._p = p;
  },
  draw(u, S) {
    const p = this.plan(S), last = p[p.length - 1].u; let i = 0; while (i < p.length - 1 && u >= p[i + 1].u) i++;
    const k = Math.min(1, u / (last + .55)), id = p[i].id; if (!FILM.has(id)) return;
    FILM.reveal(id); FILM.scenes[id].glide(FILM.glidePose(k));
    const e = FILM.scenes[id].el, punch = i ? Math.exp(-(u - p[i].u) * 16) : 0; e.style.transformOrigin = '540px 960px'; e.style.transform = `scale(${(1 + .035 * punch).toFixed(4)})`;   // each cut lands with a small push
  },
  glide() {},
  sfx: { home_land: { prompt: 'soft landing on grass, a gentle thump and a little paper rustle, cartoon, no music, no speech', dur: 1.2 }, home_air: { prompt: 'gentle steady wind while gliding through the air, soft whistle of air, no music, no speech', dur: 12 } },
  cues(S) { const p = this.plan(S), notes = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84], out = [['home_air', .1, -10]]; p.slice(1).forEach((c, i) => out.push([`note:${notes[i]}`, c.u, -5])); const land = p[p.length - 1].u + .55; return out.concat([['note:72', land, -6], ['note:76', land, -6], ['note:79', land, -6], ['note:84', land + .12, -8], ['home_land', land, -4]]); }
});
