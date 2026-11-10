"""tools_balloon_audio.py: the sound of THE BALLOON. Voices (balloon/audio, played at the tempo of the timeline), sound effects and one ambience per scene
(ElevenLabs sound-generation from the prompts the scenes declare, cached in balloon/sfx), and "note:<midi>" cues (a small mallet synth).
  node tools_balloon.mjs --cues      first: out/balloon/cues.json + sounds.json
  py tools_balloon_audio.py          -> out/balloon/mix.wav (48 kHz stereo, no ducking, limiter; loudness is set when it is muxed)
  py tools_balloon_audio.py --dry    lists what would be generated, generates nothing"""
import os, json, sys, hashlib, subprocess, requests, concurrent.futures as cf
from pathlib import Path
import numpy as np, soundfile as sf
R = Path(__file__).parent; B = R / 'balloon'; O = R / 'out/balloon'; X = B / 'sfx'; X.mkdir(exist_ok=True); SR = 48000
KEY = os.environ.get('ELEVENLABS_API_KEY', '')   # only needed while sounds are still missing from balloon/sfx
TL = json.loads((B / 'timeline.json').read_text(encoding='utf-8')); CUES = json.loads((O / 'cues.json').read_text(encoding='utf-8')); SND = json.loads((O / 'sounds.json').read_text(encoding='utf-8'))
def load(p):
    x, sr = sf.read(p); x = x.mean(axis=1) if x.ndim > 1 else x; assert sr == SR, p; return x
def gen(prompt, dur, loop=False):   # one generated sound per (prompt, duration), kept on disk
    f = X / (hashlib.md5(f'{prompt}|{dur}|{loop}'.encode()).hexdigest()[:12] + '.wav')
    if f.exists(): return f
    if '--dry' in sys.argv: print('would generate', dur, 's:', prompt[:90]); return None
    for attempt in range(4):
        r = requests.post('https://api.elevenlabs.io/v1/sound-generation', headers={'xi-api-key': KEY}, timeout=300, json={'text': prompt, 'duration_seconds': float(min(22, max(.5, dur))), 'prompt_influence': 0.6})
        if r.ok: break
        print('retry', r.status_code, r.text[:160])
    else: raise RuntimeError('sound-generation failed: ' + prompt[:60])
    mp3 = f.with_suffix('.mp3'); mp3.write_bytes(r.content)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(mp3), '-ac', '1', '-ar', str(SR), str(f)], check=True); mp3.unlink(); return f
def note(midi, d=.9):   # a soft mallet: the fundamental, one inharmonic partial that dies fast
    t = np.arange(int(d * SR)) / SR; f = 440 * 2 ** ((float(midi) - 69) / 12)
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / .04)) * np.exp(-t / .22) * np.minimum(1, t / .004)
N = int((TL['total'] + 1.5) * SR); BUS = {k: np.zeros((N, 2)) for k in ('amb', 'sfx', 'vo')}   # three stems, so their balance can be measured
def put(x, t, gain_db=0, pan=0., bus='sfx'):
    i = int(max(0, t) * SR); x = x[:N - i] * 10 ** (gain_db / 20); m = BUS[bus]; m[i:i + len(x), 0] += x * np.sqrt(.5 * (1 - pan)) * 1.414; m[i:i + len(x), 1] += x * np.sqrt(.5 * (1 + pan)) * 1.414
norm = lambda x, peak: x * (peak / (np.abs(x).max() + 1e-9))
# ---------- generate everything that is missing (4 at a time) ----------
names = sorted({c['name'] for c in CUES if not c['name'].startswith('note:')}); miss = [n for n in names if n not in SND['sfx']]
if miss: print('cues without an sfx entry (skipped):', miss)
jobs = [(SND['sfx'][n]['prompt'], SND['sfx'][n].get('dur', 1.5), False) for n in names if n in SND['sfx']] + [(a['prompt'], min(22, a['dur'] + 1.2), True) for a in SND['amb']]
with cf.ThreadPoolExecutor(4) as ex: files = list(ex.map(lambda j: gen(*j), jobs))
if '--dry' in sys.argv: print(len(jobs), 'sounds,', len(CUES), 'cues'); sys.exit()
F = dict(zip([(j[0], j[1], j[2]) for j in jobs], files))
# ---------- ambience: one bed per scene, looped if the scene is longer, faded at both ends, quiet ----------
for a in SND['amb']:
    x = load(F[(a['prompt'], min(22, a['dur'] + 1.2), True)]); x = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 10 ** (-30 / 20); need = int((a['dur'] + 1.0) * SR)
    while len(x) < need: k = int(.5 * SR); r = np.linspace(0, 1, k); x = np.concatenate([x[:-k], x[-k:] * (1 - r) + x[:k] * r, x[k:]])   # crossfaded loop
    x = x[:need].copy(); k = int(.6 * SR); x[:k] *= np.linspace(0, 1, k); x[-k:] *= np.linspace(1, 0, k); put(x, a['t0'] - .25, a.get('gain', -22) + 22, bus='amb')
# ---------- effects ----------
for c in CUES:
    if c['name'].startswith('note:'): put(norm(note(c['name'][5:]), .3), c['t'], c.get('gain', 0)); continue
    if c['name'] not in SND['sfx']: continue
    s = SND['sfx'][c['name']]; x = load(F[(s['prompt'], s.get('dur', 1.5), False)]); k = int(.03 * SR); x = x.copy(); x[-k:] *= np.linspace(1, 0, k)
    put(norm(x, .36), c['t'], c.get('gain', 0), pan=((int(hashlib.md5(c['name'].encode()).hexdigest(), 16) % 100) / 100 - .5) * .5)
# ---------- voices ----------
V = O / 'voice'; V.mkdir(exist_ok=True)
for sc in TL['scenes']:
    for l in sc['lines']:
        f = V / f"{l['id']}_{l['tempo']}.wav"
        if not f.exists(): subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(B / 'audio' / f"{l['id']}.wav"), '-af', f"atempo={l['tempo']}", '-ar', str(SR), str(f)], check=True)
        put(load(f), sc['t0'] + l['t0'], 0, bus='vo')
import pyloudnorm as pyln
meter = pyln.Meter(SR); print('stems (LUFS):', {k: round(float(meter.integrated_loudness(v)), 1) for k, v in BUS.items()})
mix = BUS['amb'] + BUS['sfx'] + BUS['vo']; peak = np.abs(mix).max(); mix = np.tanh(mix / .9) * .9 if peak > .9 else mix   # a soft limiter only if something clips
sf.write(O / 'mix.wav', mix[:int(TL['total'] * SR)], SR); print('mix.wav', round(TL['total'], 2), 's, peak before limiter', round(float(peak), 2), '|', len(jobs), 'sounds,', len(CUES), 'cues')
