# Building scenes in parallel

Sixteen scenes in thirteen techniques are too much for one context. THE BALLOON was built by one lead and seven sub-agents, each given one or two scenes in the same technique. What made that work:

## Contract first, then people

Before any scene exists, finish and test these (a trivial end-card scene is enough to prove the engine):

- the timeline (from the recorded voices),
- the engine and the still tool,
- `CONTRACT.md`: the module shape, the anchor rule, the speaker rule, the subtitle band, the finale pose, the sound fields, the test commands, and what "done" means.

A scene author who has the contract, the script, the timeline entry and the still of the style needs nothing else from the lead.

## Slicing the work

- One agent per technique family: SVG scenes together, the two three.js scenes together, the two shader scenes together. They reuse their own helpers.
- Each agent edits **only its own scene files**. Nobody touches the engine, the helpers or the timeline. If an agent needs a variant of a shared helper, it copies it into its own file.
- Scenes that must match across a cut go to the same agent (in the example: the picture-book opening, the homecoming and the drawing).

## The brief

Each brief has the same parts:

1. What to read, in order: the contract, the story, the timeline entry, the still of the style, one finished scene as a sample.
2. The files it may create or edit.
3. The technique and the look, in three lines.
4. The beats, each tied to a mark or a line of the timeline ("`marks.gate`: a castle wall with a barred gate; the balloon slips between the bars").
5. Anything special (a scene that must end on the finale's first pose instead of the anchor; a per-frame budget).
6. The sound to provide.
7. What to return: the three best stills with full paths, the seconds per frame, and what was left out or not checked.

Describe what should be on screen and why; leave the how to the agent. The best ideas in the film came from that room: the path-traced photo that "develops" after the flash, the height field baked into a texture, the see-saw in the Bauhaus scene.

## A weak GPU

- At most three GPU jobs at once, counting renders by the lead.
- Tell every agent: one render command at a time, in the foreground, eight stills are plenty.
- Put the heavy shader scenes in different waves.
- Give explicit per-frame budgets for shader scenes, and say that a draw call over about two seconds resets the driver.

## While they work

The lead writes what nobody else can: the finale scene, the sound tool, the join script. When a scene comes back, look at its stills yourself before passing them on; an agent's report describes intent, the stills show what is there.

## Interruptions

Usage limits and crashes happen in a build this long. Keep a short build log in the project (what is done, what is running, the next five steps), and resume a stopped agent with a message instead of starting a new one: its work so far is on disk and in its transcript.
