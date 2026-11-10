# Story: one tale, many styles

A film that only shows styles one after another is a showreel, and people scroll past it. What held THE BALLOON together:

## Structure

- **One promise in the first line.** "This morning a boy lost his balloon, so I promised to bring it back." The viewer now waits for the balloon, and the styles ride on that wait.
- **One carrier object in every shot.** Here it is the red balloon. It is the thing being chased, the anchor of every transition, and the only red thing in each world, so the eye finds it at once.
- **Every style solves the problem in front of the hero.** A comic punch breaks the wall. Liquid chrome pours through the bars. A flow field makes the wind visible. Bauhaus reduces the room to one red circle. Rubber-hose arms can stretch. If you cannot say what a style is *for* in the story, it is decoration: cut it or find its job.
- **Vary how the change is triggered.** At first other characters ask ("Can you do pixels?" "Of course."). Then the hero starts choosing by himself. Then one style makes him hesitate ("Real is the hard one"). Then nobody asks. Eleven identical exchanges would be a list.
- **Waves.** Loud scenes next to quiet ones: comic and pixel, then strange (chrome), open (low-poly, flow), a four-second joke (ASCII), strict (Bauhaus), silly (rubber hose), still (studio, lake), the peak (anime), a rush (finale), warm (home), quiet (the drawing).
- **The finale pays the styles off again.** The hero travels home through all the worlds while the narrator lists them, and the picture changes on every word. See "Style per word" below.
- **The ending closes the pattern.** The one character who never asked for a style finally asks, without words: the boy holds up his own drawing, and the last style is that drawing.

## Length

- A calm narrator speaks about 2.3 words per second after trimming. THE BALLOON has 303 words and runs 2:41, of which 2:00 is speech. Budget the words before recording.
- A style needs about 6 seconds to be read. Twelve styles cannot fit under 75 seconds.
- Short platforms cap at 3 minutes; leave room if a spoken hook or outro is added later.

## Writing the lines

- Narration is in full sentences joined by spoken connectors (so, because, and). Dialogue can be short.
- One emotion tag per line, at its start, in brackets: `[calm]`, `[amused]`, `[stern]`, `[hesitant]`, `[proud]`, `[softly]`. A tag in the middle of a line changes the delivery from there (`…through pixels, ink... [softly] and paper.`).
- Give a concrete number only if the picture will really show it (600 lines, 512 rays).
- A child character should be silent if the voice provider blocks children's voices. Let them act instead.
- Characters that cannot be drawn convincingly in a realistic style stay off screen: a voice behind the camera, a reflection in metal.

## The plan of a scene

`balloon/script.json` lists each scene as gaps and lines:

```json
{"id": "pixel", "plan": [["gap", "open", 0.9], ["line", "clawd", "content", "So I crossed the sea eight pixels at a time.", true],
  ["gap", "gate", 1.0], ["line", "guard", "stern", "Halt! Nothing solid gets through these bars."], ["gap", "", 0.2],
  ["line", "clawd", "playful", "Then I will not be solid."], ["gap", "out", 0.5]]}
```

A named gap becomes a mark (`S.marks.gate`) that the scene animates against. `true` at the end of a line means narration over the picture. The first gap must be at least as long as the transition (0.5 s), because the scene is still being revealed.

## Style per word (the finale)

- Each scene implements one extra function, `glide(g)`: its world at rest with the hero hanging from the carrier at a given screen position.
- The finale scene draws nothing itself. It reads the word times of the recorded line from the timeline and asks the scene of the current word for its glide frame, with one continuous path for the hero (`FILM.glidePose(k)`), so only the rendering changes at each cut.
- Cut on the **start** of the word. Add a 3–4 % scale punch that decays in a tenth of a second, and one rising note per cut.
- The scene before the finale ends on `glidePose(0)` and the scene after it starts on `glidePose(1)`, which makes both cuts invisible.
- Read that one line a little faster (tempo 1.2) so the cuts come every half second.
