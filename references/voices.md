# Voices

Tool: `example/tools_balloon_vo.py`. It reads `balloon/script.json`, designs the voices, records every line, checks it, and writes the timeline.

## Voices come first

Record before animating. Durations of synthetic speech cannot be predicted well (our estimate was 1:55, the film came out at 2:41), and every scene is timed against the real lines. The timeline is rebuilt from the audio with `--timeline` whenever a gap changes.

## Designing a voice

- Describe the person, not the sound engineering: age, texture, temperament, role, accent. "Very old man, shaky thin creaky voice, gentle and amused, storybook grandpa, clear English with a soft British accent."
- For a calm narrator say so in several ways (calm, soft, warm, unhurried) and add "natural human voice, not robotic".
- Ask for three previews and keep the one a speech-to-text model understands best on the sample text. An agent cannot listen, so intelligibility is the one thing it can rank; tell the user the choice was made that way.
- Voices designed for another language can still carry English. Test them with the check below before designing new ones.

## Recording a line

For every line the tool does this, and you should keep all of it:

1. Send `[tag] text` to a model that follows audio tags (the example uses `eleven_v4`), stability 0.5.
2. Trim the silence at both ends (leave about 0.1 s at the end) and convert to 48 kHz mono.
3. Normalise each line to −19 LUFS, so that every character sits at the same level before the mix.
4. Transcribe it and compare with the script. Accept at a match of 0.92 or more; otherwise record again, up to five takes, and keep the best. One-word lines ("Please.", "Password.") fail most often.
5. Store the word timestamps. They drive subtitles, mouth and typing animation, and cuts.

## Tempo

Calm delivery is slow. The mix plays the hero at 1.05×, the other characters at 1.09×, and the list of the finale at 1.2×, with `atempo` (pitch unchanged). The timeline divides every duration and word time by the same factor, so picture and sound stay together.

## Using the voices in the picture

- **No lip sync.** While a character's line plays, that character bounces, squashes, opens a beak or blinks a cursor, and everyone else holds still. It reads as speech.
- **Subtitles** are drawn by the engine: narration in italics, a small speaker label for everyone but the hero. A line of ten words or more is shown one phrase at a time, split at punctuation and timed by the word timestamps.
- **Anything typed or flashed on a word** uses that word's timestamp (the terminal types "PASSWORD" while the voice says it; the curator's triangle flashes on "a triangle").

## Limits to tell the user about

- Providers may block children's voices. Plan a silent child.
- Tags are followed loosely. If a delivery matters, listen to it; the transcript check only proves the words are right.
