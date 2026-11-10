#!/bin/bash
# balloon/final.sh [--no-render | scene ids...]: THE BALLOON from scenes to a finished file.
#   bash balloon/final.sh              render every scene (one Chrome at a time), then sound, concat, mux
#   bash balloon/final.sh comic pixel  re-render only those scenes, then the rest of the chain
#   bash balloon/final.sh --no-render  only sound + concat + mux
# -> out/balloon/the_balloon.mp4 (1080x1920, 30 fps) and out/balloon/the_balloon_tg.mp4 (720x1280, under 50 MB for Telegram)
cd "$(dirname "$0")/.." || exit 1
O=out/balloon
ALL=$(py -c "import json; print(' '.join(s['id'] for s in json.load(open('balloon/timeline.json', encoding='utf-8'))['scenes']))")
if [ "$1" != "--no-render" ]; then for s in ${@:-$ALL}; do node tools_balloon.mjs --video --scene=$s || echo "RENDER FAILED: $s"; done; fi
node tools_balloon.mjs --cues || exit 1
py tools_balloon_audio.py || exit 1
: > $O/list.txt; for s in $ALL; do echo "file 'seg/$s.mp4'" >> $O/list.txt; done
ffmpeg -y -v error -f concat -safe 0 -i $O/list.txt -i $O/mix.wav -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart $O/the_balloon.mp4 || exit 1
ffmpeg -y -v error -i $O/the_balloon.mp4 -vf scale=720:1280:flags=lanczos -c:v h264_nvenc -preset p5 -rc vbr -b:v 2100k -maxrate 2600k -bufsize 5M -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart $O/the_balloon_tg.mp4
for f in $O/the_balloon.mp4 $O/the_balloon_tg.mp4; do ffprobe -v error -show_entries format=duration,size -of csv=p=0 $f; done; ls -la $O/the_balloon*.mp4
