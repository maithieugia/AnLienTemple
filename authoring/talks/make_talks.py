"""Record the statue talks (anh Thanh 2026-11-05): ~30 s per figure, read with the female voice of the audiobook
("Giọng mẫu đang dùng", Audiobook Studio / VieNeu-TTS v3 Turbo).
In:  authoring/talks/talks.json
Out: public/assets/talks/<id>.mp3 (mono 64 kbps) + authoring/talks/durations.json
Run: C:/Users/Admin/AudiobookStudio/venv/Scripts/python.exe authoring/talks/make_talks.py [id ...]"""
import sys, os, json, re
import numpy as np
STUDIO = r'C:\Users\Admin\AudiobookStudio'
sys.path.insert(0, STUDIO)
import engine as E
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, 'public', 'assets', 'talks')
os.makedirs(OUT, exist_ok=True)
VOICE = {'type': 'ref', 'path': os.path.join(STUDIO, 'data', 'voices', 'v_giong_dang_dung', 'ref.wav')}
talks = json.load(open(os.path.join(HERE, 'talks.json'), encoding='utf-8'))
only = set(sys.argv[1:])
eng = E.Engine()
dur_path = os.path.join(HERE, 'durations.json')
durations = json.load(open(dur_path, encoding='utf-8')) if os.path.exists(dur_path) else {}

def chunks(text):
    """Sentences, short ones joined so no chunk is tiny (very short chunks make the model babble)."""
    parts = [p.strip() for p in re.split(r'(?<=[.!?])\s+', text) if p.strip()]
    out = []
    for p in parts:
        if out and (len(out[-1]) < 70 or len(p) < 40) and len(out[-1]) + len(p) < 260: out[-1] += ' ' + p
        else: out.append(p)
    return out

for t in talks:
    if only and t['id'] not in only: continue
    pieces = []
    gap = np.zeros(int(E.SR * .38), dtype=np.float32)
    for c in chunks(t['title'] + '. ' + t['text']):
        a = eng.synth(E.prep_for_tts(c), VOICE, 0.75)
        a = a / max(1e-6, float(np.abs(a).max())) * .9
        pieces += [a, gap]
    audio = np.concatenate(pieces)
    raw = os.path.join(OUT, t['id'] + '.wav')
    E.write_wav(raw, audio)
    mp3 = os.path.join(OUT, t['id'] + '.mp3')
    import subprocess
    subprocess.run([E.FFMPEG, '-y', '-loglevel', 'error', '-i', raw, '-af', E.audio_filter(1.0, 0.0), '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', mp3], check=True)
    os.remove(raw)
    durations[t['id']] = round(len(audio) / E.SR, 1)
    json.dump(durations, open(dur_path, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('TALK', t['id'], durations[t['id']], 's', flush=True)
print("ALL DONE", flush=True)
os._exit(0)
