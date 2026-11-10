# THE BALLOON: scene contract

The film is `balloon.html` (1080×1920, 30 fps, ~2:40). The story and every line are in `styles8/STORY_balloon.md`. The engine is `balloon/film.js`; the timeline (built from the recorded voices) is `balloon/timeline.json`. **A scene is one file, `balloon/sc_<id>.js`, and that file is the only thing a scene author edits.**

## The module

```js
FILM.add({
  id: 'book',                    // must match the scene id in the timeline
  async init(el) {},             // el = this scene's own 1080x1920 <div> (position: absolute, overflow: hidden). Build your canvas / SVG / DOM / WebGL inside it, once.
  draw(u, S) {},                 // draw the frame at u seconds since the scene started. S = this scene's timeline entry (below).
  glide(g) {},                   // the finale pose (below)
  sfx: { name: { prompt: 'short description of the sound for a sound-effect generator', dur: 1.2 } },
  amb: { prompt: 'the background sound of this place, no music, no speech', gain: -22 },
  cues(S) { return [['name', u], ['name', u, -4]]; }   // when each effect plays (scene seconds), optional gain in dB
});
```

- **`draw(u, S)` must be a pure function of `u`.** Frames are rendered one by one, sometimes out of order. No state carried from the previous frame, no `Date.now()`, no `Math.random()` (use `rng(seed)` from `styles8/core.js`). Do the expensive, fixed work in `init`.
- **`u` runs from 0 to `S.dur + 0.6`.** For the first 0.5 s the scene is revealed by a circle growing out of the balloon; for 0.5 s after `S.dur` the scene still runs underneath the next one. Keep animating gently there, do not freeze or jump.
- **`S`**: `{ id, t0, dur, lines: [{ id, who, vo, text, t0, dur, words }], marks: { name: u } }`. `lines[i].t0` and `marks.*` are scene seconds. `vo: true` is Clawd narrating over the picture; `vo: false` is said by a character in the scene. Read the real numbers in `balloon/timeline.json`; they will not change.
- **Budget:** aim for under 0.5 s per frame (the realistic shader scenes may take up to 3 s). WebGL contexts need `preserveDrawingBuffer: true` and pixel ratio 1.
- Helpers already loaded: `styles8/core.js` (`FW, FH, TAU, CLAWD` grid, `hitR, cv, rng, h2, vnoise, clamp, accumGL, CLAWD_SDF`), `three.min.js` (r159, global `THREE`), `FILM.ANCHOR`, `FILM.RED` (`#E4572E`), `FILM.ORANGE` (`#F0793A`). Fonts loaded: Baloo 2, Bangers, Press Start 2P, JetBrains Mono, Jost, Chango, Limelight. No image files, no external assets, nothing AI-generated; everything is drawn by code. All text on screen is English.

## Rules every scene keeps

1. **The balloon opens and closes the scene.** At `u = 0` and for every `u >= S.dur` the red balloon is at screen `(700, 560)` with radius 64 px (`FILM.ANCHOR`), drawn in your style, with its string. Get it there with a camera move or by letting it drift; it may bob by a few pixels. In between it goes wherever the story needs. The next world grows out of exactly that circle, so this is what makes the cuts invisible.
2. **Clawd is recognisable.** Same proportions as the `CLAWD` grid (16 × 10: body, two arm stubs, four legs, two tall eyes), orange, dark eyes. Restyle the rendering, not the shape. He is the hero: at least 280 px wide whenever he is the subject.
3. **Whoever speaks, moves.** While a `vo: false` line plays (`line.t0 … line.t0 + line.dur`), its speaker visibly talks: a quick bounce or squash, a moving mouth or beak, a blinking prompt. Nobody else moves much during that line. There is no lip sync.
4. **Subtitles are drawn by the engine** in the band y 1430–1680. Keep faces, hands and the balloon out of that band and inside x 70–1010.
5. **Motion with a cause.** Anticipation before a jump, squash on landing, effects on the frame of the impact, 0.3–0.6 s of stillness before a punchline. Something meaningful moves in every second; no idle wobble as filler.
6. **Stay in your style.** Start from the still of your style (`styles8/s<N>_*.js`, board `out/styles8/board.jpg`) and keep its palette, texture and technique. The whole point of the film is that the twelve worlds look nothing alike.

## The finale pose: `glide(g)`

At the end Clawd drifts home under the balloon and the world changes on every word, so each scene must be able to draw one extra thing: its world at rest (a wide, calm view, nobody else in it) with Clawd hanging from the balloon.

`g = { k, x, y, rot, w, bx, by, br }`: Clawd's body centre at screen `(x, y)`, `w` = 300 px wide, tilted by `rot` radians; he holds the string with one raised arm; the balloon's centre is at `(bx, by)` with radius `br` = 64. `k` runs 0 → 1 over the whole descent (he moves from about (540, 720) to (540, 1180)). A few pixels of error are fine in 3D styles; the cut lasts a third of a second.

## Sound

Every scene brings its own sound list. `sfx` names the effects (they are generated once from the prompt: describe the sound itself, say "cartoon" if it should be, add "no music, no speech"; `dur` 0.5–4 s). `cues(S)` places them, usually on `S.marks` or on the moment something lands in your animation. `amb` is one background bed for the scene. Aim for 5–10 cues: every impact, appearance and big move gets one.

## Working on this PC

The GPU is weak and other scenes are being built at the same time. **Run one render command at a time, in the foreground, never in the background, and keep it to what you need** (8 stills is plenty for a pass).

```bash
node tools_balloon.mjs --scene=<id> --sheet=auto          # 8 stills + out/balloon/stills/<id>_sheet.jpg (look at the sheet first, then at single stills)
node tools_balloon.mjs --scene=<id> --sheet=0.4,2.1,5     # stills at chosen scene times
node tools_balloon.mjs --glide=<id>                       # the finale pose at k = 0, .5, 1
```

The command prints page errors and the seconds per frame. Look at your stills (they are JPEGs you can open) and fix what you see before you finish: overlapping text, things outside the frame, a balloon that is not on the anchor at both ends, a speaker that does not move.

## Done means

- `--scene=<id> --sheet=auto` and `--glide=<id>` run without page errors, and the stills show the story beats of your brief.
- In your last message: the three stills that show the scene best (full paths), the seconds per frame, and anything you left out or could not check.
