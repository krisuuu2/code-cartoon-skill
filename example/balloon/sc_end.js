// balloon/sc_end.js: the end card of THE BALLOON. Plain DOM; it fades in over the boy's drawing.
FILM.add({ id: 'end', enter: 'fade', init(el) {
  el.style.cssText += ';background:#141413;color:#F0EEE6;font-family:Jost,sans-serif';
  el.innerHTML = `<div style="position:absolute;left:80px;top:640px;width:920px"><div id="e1" style="font:900 118px/1 Jost;letter-spacing:-2px">THE<br>BALLOON<span style="color:${FILM.RED}">.</span></div>
    <div id="e2" style="margin-top:56px;font:700 34px/1.5 'JetBrains Mono';letter-spacing:3px;color:#B0AEA5">13 STYLES · 1 STORY · 0 IMAGES</div>
    <div id="e3" style="margin-top:14px;font:400 30px/1.5 'JetBrains Mono';letter-spacing:1px;color:#87867F">Every frame written in code by Claude Fable 5.2</div></div>`;
  this.q = ['e1', 'e2', 'e3'].map(i => el.querySelector('#' + i));
}, draw(u) { this.q.forEach((e, i) => { const k = Math.min(1, Math.max(0, (u - .35 - i * .22) / .35)), o = 1 - Math.pow(1 - k, 3); e.style.opacity = o; e.style.transform = `translateY(${(1 - o) * 40}px)`; }); },
  glide() {}, sfx: { end_chime: { prompt: 'soft warm music-box chime, two gentle notes, no speech', dur: 2 } }, cues: () => [['end_chime', .3, -6]] });
