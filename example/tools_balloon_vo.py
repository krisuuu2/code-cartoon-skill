"""tools_balloon_vo.py: records every line of THE BALLOON (balloon/script.json) with ElevenLabs eleven_v4 + emotion tags and builds the timeline.
  py tools_balloon_vo.py            -> balloon/audio/<scene>_<n>.wav (48 kHz mono, trimmed, -19 LUFS), balloon/lines.json, balloon/timeline.js
  py tools_balloon_vo.py --timeline -> only rebuilds balloon/timeline.js from the recorded lines (after editing gaps in script.json)
Every voice is designed here from the description in script.json ("voices": 3 previews each, the one speech-to-text understands best is kept)
and stored in balloon/voices.json. Needs the environment variable ELEVENLABS_API_KEY."""
import os, json, re, sys, base64, difflib, subprocess, threading, requests, concurrent.futures as cf
from pathlib import Path
import numpy as np, soundfile as sf, pyloudnorm as pyln
R = Path(__file__).parent; B = R / 'balloon'; A = B / 'audio'; A.mkdir(parents=True, exist_ok=True)
KEY = os.environ.get('ELEVENLABS_API_KEY', '')   # not needed for --timeline
H = {'xi-api-key': KEY}; API = 'https://api.elevenlabs.io/v1'; LOCK = threading.Lock()
S = json.loads((B / 'script.json').read_text(encoding='utf-8'))
VF = B / 'voices.json'; V = json.loads(VF.read_text(encoding='utf-8')) if VF.exists() else {}
LF = B / 'lines.json'; L = json.loads(LF.read_text(encoding='utf-8')) if LF.exists() else {}
norm = lambda s: re.sub(r'[^a-z ]', '', re.sub(r'\[[^\]]*\]', '', s).lower()).split()
def scribe(path):
    r = requests.post(f'{API}/speech-to-text', headers=H, data={'model_id': 'scribe_v1', 'language_code': 'en', 'timestamps_granularity': 'word'}, files={'file': open(path, 'rb')}, timeout=300)
    if not r.ok: raise RuntimeError(r.text[:300])
    return r.json()
def design(role, desc, sample):
    r = requests.post(f'{API}/text-to-voice/design', headers=H, timeout=300, json={'voice_description': desc, 'model_id': 'eleven_ttv_v3', 'text': sample, 'guidance_scale': 5})
    if not r.ok: raise RuntimeError(f'design {role} {r.status_code} {r.text[:300]}')
    best = None
    for i, pv in enumerate(r.json()['previews']):
        f = A / f'_preview_{role}_{i}.mp3'; f.write_bytes(base64.b64decode(pv['audio_base_64']))
        sc = difflib.SequenceMatcher(None, norm(sample), norm(scribe(f)['text'])).ratio()
        if not best or sc > best[0]: best = (sc, pv['generated_voice_id'], i)
    r = requests.post(f'{API}/text-to-voice', headers=H, timeout=120, json={'voice_name': f'Balloon – {role}', 'voice_description': desc, 'generated_voice_id': best[1]})
    if not r.ok: raise RuntimeError(f'save {role} {r.status_code} {r.text[:300]}')
    print('designed', role, 'preview', best[2], 'match', round(best[0], 2)); return r.json()['voice_id']
SAMPLE = "This morning a boy lost his balloon, so I promised to bring it back. I am made of code, and I thought that would make it easy. It was not easy, but it was the best day I have ever had."
def voice(role):
    with LOCK:
        if role not in V:
            V[role] = design(role, S['voices'][role], SAMPLE)
            VF.write_text(json.dumps(V, indent=1), encoding='utf-8')
        return V[role]
def take(vid, text, out):
    r = requests.post(f'{API}/text-to-speech/{vid}?output_format=mp3_44100_192', headers=H, timeout=300, json={'text': text, 'model_id': 'eleven_v4', 'language_code': 'en', 'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8}})
    if not r.ok: raise RuntimeError(f'tts {r.status_code} {r.text[:300]}')
    mp3 = out.with_suffix('.mp3'); mp3.write_bytes(r.content)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(mp3), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse', '-ac', '1', '-ar', '48000', str(out)], check=True); mp3.unlink()
    x, sr = sf.read(out)
    try: g = 10 ** ((-19 - pyln.Meter(sr).integrated_loudness(x)) / 20)
    except Exception: g = 0.1 / (np.sqrt(np.mean(x ** 2)) + 1e-9)
    x = x * min(g, 0.97 / (np.abs(x).max() + 1e-9)); sf.write(out, x, sr); return len(x) / sr
def record(job):
    lid, role, tag, text = job
    if lid in L and (A / f'{lid}.wav').exists() and L[lid]['text'] == text and L[lid]['tag'] == tag: return lid, L[lid]
    best = None
    for attempt in range(5):
        f = A / f'_{lid}_{attempt}.wav'; dur = take(voice(role), f'[{tag}] {text}', f); sc = scribe(f)
        ratio = difflib.SequenceMatcher(None, norm(text), norm(sc['text'])).ratio()
        if not best or ratio > best[0]: best = (ratio, f, dur, sc)
        if ratio >= 0.92: break
    (A / f'{lid}.wav').unlink(missing_ok=True); best[1].rename(A / f'{lid}.wav')
    for f in A.glob(f'_{lid}_*.wav'): f.unlink()
    words = [[w['text'], round(w['start'], 3), round(w['end'], 3)] for w in best[3].get('words', []) if w.get('type') == 'word']
    return lid, {'who': role, 'tag': tag, 'text': text, 'dur': round(best[2], 3), 'match': round(best[0], 2), 'heard': best[3]['text'], 'words': words}
jobs = []
for sc in S['scenes']:
    n = 0
    for it in sc['plan']:
        if it[0] == 'line': n += 1; jobs.append((f"{sc['id']}_{n}", it[1], it[2], it[3]))
if '--timeline' not in sys.argv:
    if not KEY: sys.exit('set ELEVENLABS_API_KEY to record voices (or run with --timeline)')
    voice('clawd')
    with cf.ThreadPoolExecutor(4) as ex:
        for lid, rec in ex.map(record, jobs):
            L[lid] = rec; print(lid, rec['who'], rec['dur'], rec['match'], '|', rec['heard'][:70]); LF.write_text(json.dumps(L, indent=1, ensure_ascii=False), encoding='utf-8')
# ---------- the timeline: every scene is its plan laid end to end; times are rounded to whole frames ----------
FPS = S['fps']; fr = lambda t: round(t * FPS) / FPS; T = 0; scenes = []; TEMPO = {'clawd': 1.05, '*': 1.09, 'home_1': 1.2}   # the list of the finale is read faster: one style per word
for sc in S['scenes']:
    u = 0; n = 0; lines = []; marks = {}
    for it in sc['plan']:
        if it[0] == 'gap':
            if it[1]: marks[it[1]] = fr(u)
            u += it[2]
        else:
            n += 1; rec = L[f"{sc['id']}_{n}"]; tp = TEMPO.get(f"{sc['id']}_{n}", TEMPO.get(rec['who'], TEMPO['*'])); d = round(rec['dur'] / tp, 3)   # the mix plays the line with atempo = tp
            lines.append({'id': f"{sc['id']}_{n}", 'who': rec['who'], 'vo': len(it) > 4 and bool(it[4]), 'text': re.sub(r'\s*\[[^\]]*\]\s*', ' ', rec['text']).strip(), 't0': fr(u), 'dur': d, 'tempo': tp, 'words': [[w, round(a / tp, 3), round(z / tp, 3)] for w, a, z in rec['words']]}); u += d
    scenes.append({'id': sc['id'], 't0': fr(T), 'dur': fr(u), 'lines': lines, 'marks': marks}); T = fr(T + fr(u))
TL = {'fps': FPS, 'tr': S['tr'], 'total': fr(T), 'scenes': scenes}
(B / 'timeline.js').write_text('// generated by tools_balloon_vo.py from balloon/script.json + the recorded lines. Do not edit.\nconst TL = ' + json.dumps(TL, indent=1, ensure_ascii=False) + ';\n', encoding='utf-8')
(B / 'timeline.json').write_text(json.dumps(TL, indent=1, ensure_ascii=False), encoding='utf-8')
print('total', TL['total'], 's;', ' '.join(f"{s['id']} {s['dur']}" for s in scenes))
