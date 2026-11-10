---
name: code-cartoon
description: Make an animated cartoon in which every frame is drawn by code (SVG, Canvas 2D, DOM/CSS, WebGL shaders, three.js) and rendered to MP4 in headless Chrome, with character voices, sound effects and ambience from ElevenLabs. Covers one story told in many visual styles (picture book, comic, pixel art, liquid chrome, low-poly, flow field, ASCII, Bauhaus, rubber hose, path-traced photo, raymarched landscape, anime cel, child's crayon drawing), the scene contract that lets several agents build scenes in parallel, voice and sound practice, and how to check a film you cannot watch. Use when the user asks for a cartoon, animated short, animated story, multi-style animation, "animation made only with code", a style board of animation looks, or wants to add a new visual style or scene to such a film.
---

# Code cartoon

A film here is a web page. Each scene is one JavaScript file that draws frame `u` of its own world; a small engine plays the scenes on a timeline built from the recorded voices; headless Chrome screenshots every frame; ffmpeg joins them with a mix of voices, generated sound effects and ambience. No image model and no video model is involved in the picture.

`example/` is a complete film made this way: THE BALLOON, 2:41, 13 styles, 16 scenes. **Start a new film by copying `example/` and replacing its scenes**; the engine, the tools and the contract are meant to be reused as they are.

## The order of work (do not reorder it)

1. **Style board first** (`references/styles.md`). One still per candidate style, each in a different technique, all showing the same character. Styles that share a palette and a typeface read as one style, so make them differ in palette, texture, dimension and technique at once. Get the board approved before any animation.
2. **Story** (`references/story.md`). One carrier object that is in every shot, and a reason for every change of style. Write the script with a tag for the emotion of each line.
3. **Voices before pictures** (`references/voices.md`). Record every line, then build the timeline from the real durations. Scenes are animated against that timeline, never the other way round.
4. **Engine and contract.** Reuse `example/balloon.html`, `example/balloon/film.js`, `example/tools_balloon.mjs` and `example/balloon/CONTRACT.md`. Read the contract before writing any scene: it is short and every rule in it exists because something broke without it.
5. **Scenes** (`references/styles.md` for the recipe of each style, `references/parallel-build.md` for building several at once). One file per scene, `draw(u, S)` a pure function of `u`.
6. **Sound** (`references/sound.md`). Every scene declares its own effects, cue times and ambience; the tool generates and mixes them.
7. **Render per scene, then join.** `bash balloon/final.sh` renders one MP4 per scene, so a changed scene is the only thing rendered again.
8. **Check the finished file** (`references/checking.md`). You cannot watch or listen, so check what can be measured, and say plainly what was not checked.

## Rules that hold for every scene

- **A frame is a pure function of time.** Frames are rendered one at a time and sometimes out of order. No state from the previous frame, no clock, no unseeded randomness. Expensive fixed work goes in `init`.
- **The carrier opens and closes every scene at the same screen position** (in the example: the red balloon at (700, 560), radius 64). The next scene is revealed by a circle growing out of exactly that spot, which makes every transition a match cut for free.
- **The hero keeps its proportions in every style.** Restyle the rendering, never the shape.
- **Whoever speaks, moves**, and nobody else does. There is no lip sync; a bounce, a beak or a blinking cursor is enough.
- **Numbers on screen are true.** A counter that says 600 lines or 512 rays shows what the frame really used.
- **Motion has a cause**: anticipation before a jump, squash on landing, the effect on the frame of the impact, a third to half a second of stillness before a punchline.
- **Subtitles belong to the engine**; scenes keep faces and hands out of that band.

## Commands (run from the film folder)

```bash
npm install                                             # three + puppeteer-core; set CHROME_PATH if Chrome is not in the default place
node tools_styles8.mjs                                  # the style board: one still per style -> out/styles8/board.jpg
python tools_balloon_vo.py                              # voices + timeline (needs ELEVENLABS_API_KEY); --timeline rebuilds only the timeline
node tools_balloon.mjs --scene=book --sheet=auto        # 8 stills of one scene + a tiled sheet
node tools_balloon.mjs --glide=book                     # the finale pose of one scene
node tools_balloon.mjs --film --sheet=13.1,24.8         # stills of the whole film at those seconds (use them on scene boundaries)
bash balloon/final.sh                                   # render every scene, sound, join, mux; `final.sh comic pixel` re-renders only those
```

Needs Node 18+, Chrome, ffmpeg, Python 3 with `requests numpy soundfile pyloudnorm`. The picture needs no API key; voices and sound need an ElevenLabs key.

## Reference files

| File | Read it when |
|---|---|
| `references/styles.md` | choosing styles, or building a scene in one of the thirteen |
| `references/story.md` | writing the script |
| `references/voices.md` | casting, recording, timing |
| `references/sound.md` | effects, ambience, the mix |
| `references/checking.md` | before saying a scene or the film is done |
| `references/parallel-build.md` | several scenes are built at the same time, or the machine has a weak GPU |
| `example/balloon/CONTRACT.md` | always, before the first scene |
