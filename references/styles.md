# The thirteen styles

Each style is a different **technique**, not a filter over the same drawing. That is the point: styles that share a palette, a typeface and a renderer read as one style. For each one below: what makes the look, how it is built, how it moves, what it costs per frame (1080×1920, a modest GPU), and what went wrong.

Files: the still of a style is `example/styles8/s<N>_*.js` (a good place to start a new style), the animated scene is `example/balloon/sc_<id>.js`.

| # | Style | Technique | Scene file | s per frame |
|---|---|---|---|---|
| 1 | Picture book | SVG + filters, rebuilt per frame | `sc_book.js`, `sc_back.js` | 0.2–0.4 |
| 2 | Comic book | Canvas 2D | `sc_comic.js` | 0.4–0.5 |
| 3 | Pixel art | 180×320 buffer, ×6 | `sc_pixel.js` | 0.2 |
| 4 | Liquid chrome | raw WebGL2, raymarched SDF | `sc_chrome.js` | 0.2–0.45 |
| 5 | Low-poly | three.js, flat shading | `sc_lowpoly.js` | 0.1 |
| 6 | Flow field | Canvas 2D, pure algorithm | `sc_flow.js` | 0.1–0.3 |
| 7 | ASCII terminal | one `<pre>`, software raymarcher | `sc_ascii.js` | 0.13 |
| 8 | Bauhaus poster | DOM + CSS only | `sc_bauhaus.js` | 0.1–0.2 |
| 9 | Rubber hose 1930 | Canvas 2D bezier rig + film | `sc_hose.js` | 0.1–0.2 |
| 10 | Studio photo | GLSL path tracer | `sc_studio.js` | 0.35–2.5 |
| 11 | Alpine lake | GLSL terrain, baked height field | `sc_lake.js` | 0.25 |
| 12 | Anime cel | three.js toon + 2D sky and lens | `sc_anime.js` | 0.12 |
| 13 | Child's crayon drawing | SVG strokes + crayon filter | `sc_drawing.js` | 0.16 |

---

## 1. Picture book (cut paper)

**Look.** Layers of cut paper with soft shadows between them, crayon lines, visible paint, warm pastels, round corners, big eyes, cheeks.

**Build.**
- The whole frame is one SVG string rebuilt for every frame.
- A sheet of paper = a group with one filter: `feTurbulence` (fractalNoise, baseFrequency 0.028, 2 octaves) → `feDisplacementMap` (scale 12–13) → `feDropShadow` (dy 8, blur 6, opacity 0.3). The displaced edge is what says "scissors".
- **Put the filter on an outer, untransformed group with `filterUnits="userSpaceOnUse"` and a 1080×1920 region**, and the camera transform on a group inside it. A filter on a transformed, oversized group allocates a huge buffer and takes seconds.
- Crayon lines: a second filter, baseFrequency 0.7, displacement 8.
- Paint over everything, as three full-frame rectangles of noise: brush streaks (baseFrequency `.003 .16`, soft-light, 0.55), gouache blots (`.007 .012`, multiply, 0.28), grain (0.8, 3 octaves, multiply, 0.5).
- Parallax planes: 0.1 sun, 0.3 clouds, 0.5 far hill, 1 actors, 1.3 foreground. A plane's zoom is `1 + (zoom − 1) · p`.

**Motion.** Puppets are posed "on twos" (12–15 poses a second) while the camera moves on every frame: that is the stop-motion feel. Re-seed the edge filter on every new pose so the paper "boils".

**Went wrong.** Filter ids must carry a per-scene prefix, because all scenes live in one document. The paper edge is anchored to the screen, so it shimmers a little during camera moves.

## 2. Comic book

**Look.** The print language of Spider-Verse: Ben-Day dots instead of gradients, thick ink, colour printed off-register, speed lines, lettering, slanted gutters.

**Build.**
- Halftone: a dot grid rotated 30°, the radius of each dot a function of position (bigger toward the shadow side or the edge of the frame). Never a gradient fill.
- Ink outline of a shape made of rectangles: draw every rectangle padded by 12–14 px in black, then the fills on top. The union gets one clean outline.
- A black extrusion: the padded shape drawn 30 times, each offset by (1.5, 1.9) px.
- Off-register plates: the padded shape once in cyan at (−26, −12) and once in magenta at (22, −24), behind the ink.
- Speed lines are thin black triangles pointing at the centre of action. Lettering (Bangers): black offset copy, black stroke, coloured fill.
- Panels are clipped polygons with slanted edges on off-white paper, plus a sprinkle of 2 px specks as paper tooth.

**Motion.** Hard pose changes on twos. Impact on one frame: lettering slams in, the star and the debris start on that frame. A long strip of panels can scroll under a hero who stays at a fixed screen position, jumping the gutters. The sun sets by growing the dots of the sky.

**Went wrong.** A second speech balloon collided with the sparkle and a sign; one balloon per panel is enough when subtitles exist.

## 3. Pixel art

**Look.** A 16-bit platformer at dusk: chunky pixels, a fixed palette, dithered sky, a HUD.

**Build.**
- Draw into a 180×320 canvas and show it ×6 with `imageSmoothingEnabled = false`.
- A fixed palette (about 16 colours). Gradients are **ordered dithering**: for a value between two neighbouring palette steps, a 4×4 Bayer matrix decides per pixel which of the two to use.
- Text: draw an 8 px pixel font (Press Start 2P) into a tiny canvas, then copy only pixels with alpha above 110, with a 1 px dark shadow. Anti-aliased text ruins the look.
- Sprites: a dark 1 px outline first, then the body, one row of highlight on the lit side, one of shade on the other.

**Motion.** Everything moves in whole buffer pixels; sprite frames change 12 times a second. A side-scroller camera locked to the hero with parallax layers. Game conventions carry the story: coins, a counter that goes up, a dialog box (at the top, clear of the subtitles).

**Went wrong.** The hero at 4 px per grid cell left no room for the platforms in a 180 px view; 3 px per cell (288 px on screen) works.

## 4. Liquid chrome

**Look.** Inflated Y2K metal on a dark glossy floor, pink and cyan reflections.

**Build.**
- One fragment shader raymarches a signed distance field: the hero is a smooth union (`smin`, k 0.12–0.24) of rounded boxes.
- **Round the boxes heavily (radius close to half the depth).** A flat face reflects one colour and looks like plastic; chrome needs curvature.
- **The environment is a function with a hard horizon**: white at the horizon, hot pink above it, violet at the top; dark violet just below the horizon, then blue, then cyan; plus two softboxes. The hard line bending across the body is what the eye reads as chrome.
- A thin-film tint: a cosine palette indexed by the view angle, mixed in at 30 %.
- The floor is a plane with one reflection bounce, faded with distance, and a contact shadow from the distance field.
- Melting: blend the body's distance with a flat puddle's and move it.
- A character can exist only in the environment function, so it appears only as a reflection.

**Motion.** A slow surface ripple (a product of three sines added to the distance), drops that fall and splash, the body pouring through bars and re-forming.

**Went wrong.** The first shader took 42 s to compile. Use WebGL2, compile off the main thread, and start loops at a uniform so the compiler does not unroll them. Draw the frame in six strips: one long draw call resets a weak GPU's driver.

## 5. Low-poly

**Look.** Pastel floating islands, faceted everything, soft shadows, an isometric view.

**Build.**
- three.js, `MeshLambertMaterial` with `flatShading: true`, no tone mapping.
- Jitter the vertices by a hash of their **position**, not their index, so corners shared by several faces move together and the mesh stays closed.
- An orthographic camera at about (12, 10.5, 12) looking at the origin.
- A hemisphere light (1.7) tints the shadows; one warm directional light (2.4) with a soft shadow map of 2048.
- The hero is boxes on its pixel grid (a voxel figure).

**Motion.** Hops with anticipation, an arc and a squash; an island dips under the weight and recovers. A gust bends trees, races the clouds and throws loose triangles across the frame. To hand over to a line-based world, light up every edge as a line.

**Went wrong.** Clouds that receive shadows turn grey under a balloon; switch `receiveShadow` off for them. With an orthographic camera a screen point unprojects exactly, which makes the finale pose easy.

## 6. Flow field (generative plotter)

**Look.** Navy paper, hundreds of thin lines that follow an invisible wind and never touch, a thin frame, a mono caption.

**Build.**
- All lines are computed once in `init`, seeded: walk a noise angle field in 3 px steps; an occupancy grid (5 px cells) stops a line before it comes close to another (Jobard–Lefer). Keep each line as a list of points.
- `draw(u)` only strokes them, each cut to the fraction that has "been drawn".
- The hero is a block of short orange and gold hatching, with a small halo of paper colour so the lines under it do not tangle.

**Motion.** Lines draw themselves on, a few and then many, spreading outward from the hero; then bright bands travel along them so the field flows. The hero rides one thick gold line. The caption counts the lines on screen and stops at the number the narrator says.

**Went wrong.** To reach exactly 600 lines they had to be shorter and thinner than in the still. Decide the number first.

## 7. ASCII terminal

**Look.** Green phosphor characters on black, scanlines, glow. One red thing.

**Build.**
- The frame is a single `<pre>`: 80 × 87 cells of a 700-weight mono font at 22 px / 22 px line height (a cell is 13.2 × 22 px).
- A tiny software raymarcher in JavaScript shoots one ray per cell at box distance fields (40 steps), and the brightness picks a character from `" .:-=+*#%@"`. Light it so the three visible faces get three different characters.
- Scenery is typed: walls of `#`, bars of `|` and `=`, block-letter banners.
- The tube is CSS: `repeating-linear-gradient` scanlines, a `text-shadow` glow, a radial vignette.
- The carrier is the only non-green element (a red `<span>`).

**Motion.** Typing in time with the voice (use the word timestamps), a cursor that blinks, a beat of stillness before the answer, bars that drop column by column.

**Went wrong.** Nothing can move by less than a cell, so do not bob things by a few pixels. A perspective floor grid aliases into noise at this resolution; a small pool of dots reads better.

## 8. Bauhaus poster

**Look.** Cream ground, red, yellow, blue and black, circles, triangles and bars, a geometric sans, a strict grid.

**Build.**
- Only HTML and CSS: absolutely positioned `div`s, `border-radius`, `clip-path`, `mix-blend-mode: multiply` where two inks overlap.
- Build the elements once in `init`; `draw(u)` writes inline `transform`, `opacity` and size. **No CSS animations or transitions**: frames are rendered one by one, so only inline values computed from `u` are deterministic.
- The hero is already geometry: ten black rectangles.

**Motion.** Hard, eased, snapping to the grid. The idea of the scene is reduction: a deliberately over-decorated poster is cleared in quick staggered moves down to the few shapes that matter. Flash a shape on the word that names it.

**Went wrong.** The poster's big type collided with the subtitles; it moved below them.

## 9. Rubber hose 1930

**Look.** A black-and-white cartoon on a stage: hose limbs with no elbows, white gloves, pie-cut eyes, sepia film with grain and scratches. One spot of colour.

**Build.**
- Canvas 2D. Limbs are thick round-capped bezier strokes. A glove is a palm circle, four rounded fingers, a cuff and three short lines. A pie-cut eye is a dark pupil with a wedge of white cut out of it.
- A small palette of sepia tones instead of grey.
- The film on top: a noise canvas composited with `overlay` at 0.34, a few vertical scratches, dust specks and hairs, a dark radial vignette, a rounded gate.
- **Seed the grain, scratches and dust from the frame number**, so any frame can be rendered again and comes out identical.
- Everything is sepia except the carrier, which stays red.

**Motion.** Posed on twos, bouncy, with exaggerated anticipation. Rubber logic is the gag: an arm stretches across the whole theatre, holds for 0.4 s, and snaps back into its owner's face.

## 10. Studio photo (path tracer)

**Look.** A product photograph: a ceramic figure on a paper sweep, a glass ball, a brass ball, soft shadows, colour bleeding onto the paper, shallow depth of field.

**Build.**
- A path tracer in one GLSL ES 3 fragment shader. Each pass adds a few random light paths per pixel into a **float render target with additive blending** (`EXT_float_blend`); a final pass tone-maps (ACES, gamma 2.2) and adds a little vignette and grain. See `accumGL` in `example/styles8/core.js`.
- Scene: planes and spheres are intersected analytically; the hero is a distance field marched only inside its bounding box. Give its boxes a small bevel (radius 0.09): the highlight along an edge is half of the realism.
- Materials: paper (diffuse), ceramic (diffuse under a Fresnel-weighted glossy coat, roughness 0.09), glass (index 1.5, Schlick), brass (a tinted mirror, roughness 0.05).
- Light is an environment function: one small bright softbox, a weak cool fill, a warm strip behind, a dim room. There is no explicit light sampling, so the size of the softbox sets the noise.
- A thin lens (aperture 0.1) focused on the face. Clamp each sample's radiance (at 14) to kill fireflies. Up to 7 bounces.

**Motion.** The scene is about becoming real: first a flat live preview (one ray, direct light only) under a viewfinder overlay; half a second of stillness; a white flash frame; then the same shader starts following real paths and the photo develops (1, 2, 4 … 512 rays per pixel) while a counter shows the true number. Afterwards a slow dolly and a focus pull.

**Went wrong.** A first version was over-lit: the orange clipped to yellow and the shadows vanished. A smaller, stronger key and a much dimmer room gave it shape. Glass on a white sweep is nearly invisible until it sits in front of something coloured.

## 11. Alpine lake (raymarched landscape)

**Look.** Snow-capped mountains over a still lake in daylight, haze, drifting clouds, a reflection.

**Build.**
- Terrain is a height function: noise octaves with analytic derivatives, each octave divided by `1 + |accumulated gradient|²` (cheap erosion). Add a basin for the lake and a ramp for the far range.
- **Bake the height field once into float textures** (one for the valley, a finer one around the hero). The terrain march, the reflection march and the sun shadows then read one texel per step. This took a frame from 20 s to 0.25 s. Compute only the normals from the full noise.
- Material by height and slope: rock with strata and gullies, grass and forest on gentle low ground, snow above a line, a wet dark band at the shore.
- Soft sun shadows (the minimum of `k · height / distance` along the ray to the sun), a blue sky fill, haze `1 − exp(−t · 0.007)` toward a blue-grey.
- The lake is a plane: a rippled normal stretched toward the viewer, Fresnel `0.02 + 0.98 (1 − cos)^5`, a reflection march, and a water colour that goes from turquoise in the shallows to nearly black.
- The sky is a gradient with a cloud layer from noise, lit by comparing with a sample shifted toward the sun.
- Anti-aliasing by several jittered passes, drawn in strips.

**Motion.** Almost none, on purpose: a slow push-in, travelling ripples, drifting clouds, then a first breath of wind that sharpens the water.

**Went wrong.** Pale rock under a strong sun and heavy fog looked like plastic; darker rock, less fog and a sun from the side fixed most of it. A flat slab under the hero looks like a lily pad until it gets cracks, a ledge and a wet edge. Remember which way screen-right points: with a camera looking along +z, it is −x.

## 12. Anime cel

**Look.** A summer hill over the sea, a towering cloud, hard two-tone shading, coloured ink lines, big eyes, petals on the wind.

**Build.**
- three.js `MeshToonMaterial` with a 4×1 gradient texture `[120, 120, 255, 255]` and nearest filtering: two tones, one hard edge. `BasicShadowMap` for hard shadow edges.
- Ink lines are inverted hulls: the same geometry again with a back-side unlit material in dark purple (not black), scaled per axis by the line thickness.
- Rounded blocks from `ExtrudeGeometry` with a bevel, so the terminator has something to curve around. Eyes are flat layers: a dark plate, an iris, two highlights. A blush under each.
- Grass: 30,000 instanced blades with vertex colours from dark at the root to light at the tip, flat (unlit) colours, swaying and scrolling in the vertex shader. The hill is a treadmill: the hero stays on the crest and the grass runs under him.
- The sky is painted in 2D on a canvas behind a transparent WebGL canvas. A cel cloud is many puffs drawn **top first**, each puff as three discs (shadow, mid, white) shifted toward the sun, so every lower puff keeps its own shadow edge.
- A second 2D canvas in front is the lens: a warm light leak, petals, speed lines, the sparkle.

**Motion.** A crouch, a run with a tracking camera, then the jump: two impact frames at take-off (white with black speed lines and a silhouette, then the picture inverted), slow motion near the top, the hand closing on the string, a short hold.

**Went wrong.** The toon ramp turned the film's red brown next to orange; the balloon got a brighter red in this scene only. Round white dots near the camera look like polygons: keep small flowers far away.

## 13. Child's crayon drawing

**Look.** White paper, fat waxy strokes, fills that go over the lines, wobbly proportions, a sun in the corner.

**Build.**
- SVG rebuilt per frame. A stroke is a few control points pushed by a "child's hand": a fixed error of about ±5 px, plus a small error that is re-seeded on twos (the boil). Run them through a Catmull-Rom spline and draw a fat round line (width 9–22).
- A fill is a single zigzag between the two sides of the shape that overshoots the outline by 10–25 px.
- One filter does the crayon: noise (baseFrequency 0.4) displaces the edge by 7 px, and the same noise, pushed through a steep alpha curve, is used with `feComposite in` to knock the paper's tooth out of the wax.
- Handwriting: each letter is one or two strokes; to write it on, cut the polyline at a fraction of its length. Small text can be a handwriting font pushed through the same filter and revealed with a growing clip rectangle.

**Motion.** Strokes boil, the balloon bobs, the figures wave, the words write themselves. Keep it short: it is an ending.

**Use.** A drawing inside another scene (a sheet a character holds) and the full-frame scene should be the same function, so the camera can push into the sheet and cut invisibly.
