// balloon/film.js: the engine of THE BALLOON (balloon.html). It owns the timeline (TL, balloon/timeline.js), one 1080x1920 container per scene,
// the transition between scenes (the new world grows out of the balloon), the subtitles and the glide path of the finale.
// A scene is a file balloon/sc_<id>.js that calls FILM.add({ id, init(el), draw(u, S), glide(g), cues(S), sfx, amb }). The contract: balloon/CONTRACT.md.
const FILM = (() => {
  const W = 1080, H = 1920, ANCHOR = { x: 700, y: 560, r: 64 }, RED = '#E4572E', ORANGE = '#F0793A', scenes = {}, order = TL.scenes.map(s => s.id);
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const S = id => TL.scenes.find(s => s.id === id);
  let sub, live = [];
  function add(sc) { scenes[sc.id] = sc; }
  async function init(stage, only) {
    for (const id of order) { const sc = scenes[id]; if (!sc || (only && !only.includes(id))) continue; sc.el = document.createElement('div'); sc.el.className = 'sc'; stage.append(sc.el); await sc.init(sc.el); sc.el.style.display = 'none'; live.push(id); }
    sub = document.createElement('div'); sub.id = 'sub'; stage.append(sub);
  }
  function show(ids) { for (const id of live) { const e = scenes[id].el; e.style.display = ids.includes(id) ? 'block' : 'none'; e.style.clipPath = ''; e.style.opacity = ''; e.style.transform = ''; e.style.zIndex = ids.indexOf(id) + 1; } }
  function reveal(id) { const e = scenes[id].el; e.style.display = 'block'; e.style.zIndex = 9; }   // a scene that draws through another scene (the finale) calls this
  // the lines on screen: narration in italics, a speaker label for everybody but Clawd
  const NAMES = { oldman: 'OLD MAN', ferryman: 'FERRYMAN', guard: 'GUARD', witch: 'WITCH', crow: 'CROW', terminal: 'TERMINAL', curator: 'CURATOR', showman: 'SHOWMAN', photographer: 'PHOTOGRAPHER' };
  function phrase(l, t) {   // a long line is shown one phrase at a time (split at punctuation, at most 8 words), timed by the recorded words
    const tok = l.text.split(' '); if (tok.length < 10) return l.text;
    const at = i => l.words[i] ? l.words[i][1] : l.dur * i / tok.length, groups = [[]];
    tok.forEach((w, i) => { const g = groups[groups.length - 1]; g.push(i); if ((/[,.:;!?…]$/.test(w) && g.length >= 3 || g.length >= 8) && i < tok.length - 1) groups.push([]); });
    let k = 0; while (k < groups.length - 1 && t >= at(groups[k + 1][0]) - .08) k++; return groups[k].map(i => tok[i]).join(' ');
  }
  function subtitle(t) {
    let h = '';
    for (const sc of TL.scenes) for (const l of sc.lines) { const a = sc.t0 + l.t0; if (t >= a - .05 && t < a + l.dur + .25) h = (NAMES[l.who] ? `<b>${NAMES[l.who]}</b>` : '') + `<span class="${l.vo ? 'vo' : ''}">${phrase(l, t - a)}</span>`; }
    sub.innerHTML = h; sub.style.display = h ? 'block' : 'none';
  }
  function drawScene(id, u) { show([id]); scenes[id].draw(u, S(id)); subtitle(S(id).t0 + u); }
  function draw(t) {
    t = cl(t, 0, TL.total - 1e-4); let i = 0; while (i < order.length - 1 && t >= TL.scenes[i + 1].t0) i++;
    const cur = order[i], prev = order[i - 1], u = t - TL.scenes[i].t0, mode = scenes[cur] && scenes[cur].enter || 'iris';
    if (prev && u < TL.tr && mode !== 'cut' && live.includes(prev) && live.includes(cur)) {   // the old scene keeps running under the new one for TL.tr seconds
      show([prev, cur]); scenes[prev].draw(t - S(prev).t0, S(prev)); scenes[cur].draw(u, S(cur)); const k = eio(u / TL.tr), e = scenes[cur].el;
      if (mode === 'fade') e.style.opacity = k; else e.style.clipPath = `circle(${(ANCHOR.r + 4 + 2300 * k * k).toFixed(1)}px at ${ANCHOR.x}px ${ANCHOR.y}px)`;
    } else if (live.includes(cur)) { show([cur]); scenes[cur].draw(u, S(cur)); }
    subtitle(t);
  }
  // the finale: Clawd hangs under the balloon and drifts down one S-curve; k = 0..1 over the whole list of words
  function glidePose(k) { const x = 540 + 210 * Math.sin(k * 6.2832) * (1 - k * k), y = 720 + 460 * eio(k), rot = -.16 * Math.cos(k * 6.2832) * (1 - k * k); return { k, x, y, rot, w: 300, bx: x + 40 * Math.sin(k * 6.2832 + .6) * (1 - k), by: y - 330, br: ANCHOR.r }; }
  function drawGlide(id, k) { show([id]); scenes[id].glide(glidePose(k)); sub.style.display = 'none'; }
  function cues() { const out = []; for (const sc of TL.scenes) { const m = scenes[sc.id]; if (!m) continue; for (const [name, u, gain = 0] of (m.cues ? m.cues(sc) : [])) out.push({ t: +(sc.t0 + u).toFixed(3), name, gain, scene: sc.id }); } return out.sort((a, b) => a.t - b.t); }
  function sounds() { const sfx = {}, amb = []; for (const sc of TL.scenes) { const m = scenes[sc.id]; if (!m) continue; Object.assign(sfx, m.sfx || {}); if (m.amb) amb.push({ scene: sc.id, t0: sc.t0, dur: sc.dur, ...m.amb }); } return { sfx, amb }; }
  return { W, H, ANCHOR, RED, ORANGE, add, init, draw, drawScene, drawGlide, glidePose, reveal, cues, sounds, S, scenes, has: id => live.includes(id) };
})();
