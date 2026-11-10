# Sound effects, ambience and the mix

Tools: `node tools_balloon.mjs --cues` collects what the scenes declare; `example/tools_balloon_audio.py` generates and mixes.

## Each scene owns its sound

A scene file carries three things next to its drawing code:

```js
sfx: { px_coin: { prompt: 'bright 8-bit coin pickup blip, retro video game, no music, no speech', dur: 0.5 } },
amb: { prompt: 'dusk at sea in a retro video game, soft chiptune-free wind and gentle waves, no music, no speech', gain: -22 },
cues(S) { return [['px_coin', 2.1], ['px_coin', 2.9, -3], ['px_stamp', S.lines[1].t0 + 0.2]]; }
```

The person (or agent) who animated the jump knows the frame it lands on, so the cue list is written in the same file, from the same marks and line times. Sound added afterwards by someone else drifts.

## Writing prompts

- Describe the sound itself and its material: "soft landing on grass, a gentle thump and a little paper rustle".
- Add the genre when it matters ("cartoon", "8-bit", "old film") and always end with "no music, no speech".
- 0.5–4 s for effects. An ambience is one bed per scene, up to about 20 s, looped with a half-second crossfade if the scene is longer.
- Prefix names per scene (`book_`, `px_`) so two scenes never collide.
- Match the sound to the style, not only to the action: a jump is a wooden hop in low-poly and a square-wave blip in pixel art.

## How many

Five to ten cues per scene: every impact, every appearance, every big move, and nothing for idle motion. THE BALLOON has 158 cues over 109 generated sounds in 161 seconds. Put the cue on the frame of the impact, never "a little after".

## Generated once

Each sound is cached under a hash of its prompt and duration (`balloon/sfx/`). Changing cue times costs nothing; only a changed prompt generates again.

## Pitched accents

A cue named `note:<midi>` is a small mallet synthesised in the tool (a sine, one inharmonic partial that dies in 40 ms, a 220 ms decay). The finale uses twelve rising notes, one per cut, and a chord on the landing. Use notes where rhythm matters more than realism.

## The mix

- Three stems: voices, effects, ambience. The tool prints the loudness of each. Aim for effects about 8 LU under the voices and ambience about 13–15 LU under them (ours: −16.2, −24.7, −29.4 LUFS).
- Each effect is peak-normalised to the same level (0.36) before its own gain, and panned slightly by a hash of its name. Voices stay in the centre.
- **No ducking** for a story: ambience that pumps under every line is more distracting than ambience that is simply quiet.
- A soft limiter only if the sum clips. Loudness is set once, when the film is muxed: `loudnorm=I=-14:TP=-1.5`.
- No generated music. A film without music holds up if every scene has its bed and its cues; if music is wanted, it is the user's to supply.

## What to say afterwards

The agent has heard nothing. Report the stem levels, the cue count and that the sounds were generated from prompts and placed by time, and ask the user to listen once.
