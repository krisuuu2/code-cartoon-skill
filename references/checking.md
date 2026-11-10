# Checking a film you cannot watch

An agent sees stills and numbers, never motion or sound. So check everything that stills and numbers can prove, and report the rest as unchecked.

## While building a scene

1. **A sheet first, then single stills.** `node tools_balloon.mjs --scene=<id> --sheet=auto` gives eight stills and one tiled image. Read the sheet for the story (are the beats there, in order?), then open single stills at the moments that matter: the impact frame, the line of dialogue, the last frame.
2. **Look for the usual defects**: text overlapping text, something important outside the frame or under the subtitles, a speaker that is not moving on its line, the hero unreadable against the ground, a transparent hole (it renders black).
3. **Measure the carrier.** At `u = 0` and at `u = S.dur` it must be on the anchor within a few pixels. Compute it in the page rather than judging by eye.
4. **The finale pose**: `--glide=<id>` at k = 0, 0.5, 1.
5. **Seconds per frame.** The tool prints it. Multiply by the frame count before committing to a look.
6. **Page errors.** The tool exits non-zero on any; a shader that fails to compile shows up here.

## Between scenes

Render film stills on every boundary, 0.2 s after the cut: `node tools_balloon.mjs --film --sheet=13.13,24.83,… --only=<the scenes involved>`. In each one the new world should be a circle growing out of the carrier, with both carriers on top of each other.

For the finale, render one still per word (word start + 0.18 s). You should see one world per word and the hero in one continuous path.

## The finished file (always from the MP4, never from the page)

1. `ffprobe`: resolution, frame rate, duration of video and audio.
2. **A contact sheet from the file**: `ffmpeg -i film.mp4 -vf "fps=1/4,scale=150:-1,tile=14x3" -frames:v 1 sheet.jpg`. Every scene present, in order, nothing black.
3. **Loudness**: `ffmpeg -i film.mp4 -af ebur128=peak=true -f null -`. Target −14 LUFS integrated, true peak under −1 dB.
4. **Transcribe the final audio** with word timestamps and compare with the script. This proves two things at once: the voices are intelligible under the effects (ours: 99 % of 303 words) and they are where the timeline says (every line within 0.2 s). For anything cut to a word, compare that word's time with the cut (ours: within 0.01 s).
5. Per-scene sheets at one frame per second (`fps=1`) are cheap and catch a scene that froze or a transition that did not happen.

## What these checks do not cover

Say it in the report, every time: the rhythm of the animation, whether poses on twos look charming or broken, how the effects sound, whether they sit on the picture, whether the voices act well. One viewing by a person settles all of that.

## Reproducibility

- A frame must come out identical when rendered again: pure function of time, seeded randomness, film grain seeded from the frame number.
- Each scene renders to its own segment. After changing a scene, render that scene **and the next one** (the next segment contains the transition out of yours).
- Voices are cached per line, sounds per prompt, so a re-run only pays for what changed.

## Things that broke, so check for them

| Symptom | Cause | Fix |
|---|---|---|
| GPU driver resets, black frames | one draw call longer than about 2 s | draw in strips or in several short passes |
| Page load times out | a shader that takes tens of seconds to compile | WebGL2, compile off the main thread, loops that start at a uniform |
| Bands in dark gradients | averaging opaque 8-bit frames with additive blending | accumulate in a float target, or use a running average |
| A flat cube still visible at scale 0 | it is a flat square | move it out of view instead |
| Backslashes missing from code | a shell heredoc ate them | write code with a file tool, not a heredoc |
| Stills overwritten by another job | two renders shared temp file names | include the process id in temp names |
| Chrome white where it should reflect | flat faces reflect one colour | round the geometry |
| A style looks like the previous one | shared palette and typeface | change palette, texture and technique together |
