"""
Temple chanting recorded locally with VieNeu-TTS (Audiobook Studio, preset voice, Apache-2.0) + wooden fish (mõ) + khánh.
Southern male voice, warm and slow, hall reverb. Output: public/assets/amb/{niem_phat,om_mani,chu_dai_bi}.mp3

Run with the Audiobook Studio venv:
  C:/Users/Admin/AudiobookStudio/venv/Scripts/python.exe authoring/audio/make_chants.py [--voice "Thái Sơn"] [--only niem_phat]
"""
import os, sys, subprocess, re
import numpy as np
STUDIO = r'C:\Users\Admin\AudiobookStudio'
sys.path.insert(0, STUDIO)
from engine import Engine, write_wav, find_ffmpeg  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AMB = os.path.join(ROOT, 'public', 'assets', 'amb')
TMP = os.path.join(ROOT, 'authoring', 'audio', 'tmp')
SR = 48000
args = sys.argv[1:]
VOICE = args[args.index('--voice') + 1] if '--voice' in args else 'Thái Sơn'
ONLY = set(args[args.index('--only') + 1].split(',')) if '--only' in args else None
ff = find_ffmpeg()


def load_mp3(name):
    out = subprocess.run([ff, '-v', 'error', '-i', os.path.join(AMB, name), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).copy()


MO = load_mp3('chua_mo.mp3'); MO = MO[:int(SR * .45)] / (np.abs(MO).max() + 1e-6)
KHANH = load_mp3('chua_khanh.mp3'); KHANH = KHANH[:int(SR * 4)] / (np.abs(KHANH).max() + 1e-6)


def trim(a, th=0.02):
    idx = np.where(np.abs(a) > th * np.abs(a).max())[0]
    return a[max(0, idx[0] - 800):idx[-1] + 1600] if len(idx) else a


def onsets(a, n):
    """Rough syllable starts: n peaks of the short-time energy envelope, in order."""
    hop = int(SR * .01); env = np.sqrt(np.convolve(a ** 2, np.ones(hop * 3) / (hop * 3), 'same'))[::hop]
    rise = np.maximum(0, np.diff(env, prepend=env[0]))
    order = []
    for i in np.argsort(-rise):
        if all(abs(i - j) > 14 for j in order): order.append(i)
        if len(order) == n: break
    return sorted(int(i * hop) for i in order)


def mix(track, clip, at, gain):
    at = int(at)
    if at >= len(track): return
    end = min(len(track), at + len(clip)); track[at:end] += clip[:end - at] * gain


e = Engine()


PITCH = 108.0  # Hz: one low reciting tone, as when chanting together


def intone(a, hz=PITCH, stretch=1.35):
    """Chant, not speech: flatten the melody to one tone (a small fall on the last syllable) and draw the vowels out."""
    import parselmouth
    from parselmouth.praat import call
    snd = parselmouth.Sound(a.astype(np.float64), SR)
    man = call(snd, 'To Manipulation', 0.01, 70, 320)
    dur = snd.get_total_duration()
    pt = call('Create PitchTier', 'tone', 0, dur)
    call(pt, 'Add point', 0.0, hz); call(pt, 'Add point', dur * .82, hz); call(pt, 'Add point', dur, hz * .9)
    call([pt, man], 'Replace pitch tier')
    dt = call('Create DurationTier', 'slow', 0, dur); call(dt, 'Add point', 0.0, stretch)
    call([man, dt], 'Replace duration tier')
    return call(man, 'Get resynthesis (overlap-add)').values[0].astype(np.float32)


def say(text, temp=0.6):
    """Three slightly different voices intoning together (a small assembly), not one reader."""
    a = trim(e.synth(text, {'type': 'preset', 'name': VOICE}, temperature=temp).astype(np.float32))
    voices = [(intone(a, PITCH), 0, 1.0), (intone(a, PITCH * .985, 1.37), int(SR * .022), .55), (intone(a, PITCH * 1.012, 1.33), int(SR * .037), .5)]
    n = max(len(v) + d for v, d, _ in voices); out = np.zeros(n, np.float32)
    for v, d, g in voices: out[d:d + len(v)] += v * g
    return out / (np.abs(out).max() + 1e-6)


def finish(name, track):
    # a soft drone on the reciting tone and its lower octave, breathing slowly, under the whole chant
    t = np.arange(len(track)) / SR; drone = (np.sin(2 * np.pi * PITCH * t) * .5 + np.sin(np.pi * PITCH * t)) * (.6 + .4 * np.sin(2 * np.pi * .07 * t))
    track = track / (np.abs(track).max() + 1e-6) + drone.astype(np.float32) * .045
    wav = os.path.join(TMP, name + '.wav'); write_wav(wav, track / (np.abs(track).max() + 1e-6) * .9)
    # warm (a touch lower and slower), a large wooden hall, gentle loudness
    af = ('aresample=48000,lowpass=f=6500,highpass=f=70,'
          'aecho=0.8:0.8:110|230|370|540|760:0.38|0.27|0.18|0.11|0.06,loudnorm=I=-20:TP=-2,afade=t=in:d=1.5')
    subprocess.run([ff, '-v', 'error', '-y', '-i', wav, '-af', af, '-ac', '1', '-ar', '32000', '-b:a', '56k', os.path.join(AMB, name + '.mp3')], check=True)
    os.remove(wav); print('wrote', name, round(len(track) / SR), 's', flush=True)


def recitation(name, phrase, syllables, repeats, gap=.45):
    """Repeated invocation, one mõ stroke on every syllable, khánh at the start and every 9 phrases."""
    takes = [say(phrase, t) for t in (.5, .6, .7)]
    total = sum(len(takes[i % 3]) + int(SR * gap) for i in range(repeats)) + int(SR * 5)
    tr = np.zeros(total, np.float32); mix(tr, KHANH, 0, .5); pos = int(SR * 2.2)
    for i in range(repeats):
        t = takes[i % 3]; mix(tr, t, pos, 1.0)
        for o in onsets(t, syllables): mix(tr, MO, pos + o - int(SR * .02), .34)
        pos += len(t) + int(SR * gap)
        if i % 9 == 8: mix(tr, KHANH, pos - int(SR * .2), .35)
    mix(tr, KHANH, pos, .5); finish(name, tr[:pos + int(SR * 4)])


def sutra(name, text, beat=.5):
    """Long mantra: read phrase by phrase on a steady mõ beat (one stroke per beat, as when chanting with the mõ)."""
    parts = [p.strip() for p in re.split(r'[.;]\s*', text) if p.strip()]
    clips = [say(p + '.') for p in parts]
    total = sum(len(c) for c in clips) + int(SR * (len(clips) * .35 + 10))
    tr = np.zeros(total, np.float32); mix(tr, KHANH, 0, .55); pos = int(SR * 2.4)
    for c in clips: mix(tr, c, pos, 1.0); pos += len(c) + int(SR * .35)
    t = SR * 2.4
    while t < pos: mix(tr, MO, t, .3); t += SR * beat
    mix(tr, KHANH, pos + SR * .3, .55); finish(name, tr[:pos + int(SR * 4.5)])


os.makedirs(TMP, exist_ok=True)
JOBS = {
 'niem_phat': lambda: recitation('niem_phat', 'Nam mô A Di Đà Phật.', 6, 24),
 'om_mani': lambda: recitation('om_mani', 'Án ma ni bát di hồng.', 6, 18, gap=.35),
 'chu_dai_bi': lambda: sutra('chu_dai_bi', open(os.path.join(os.path.dirname(__file__), 'chu_dai_bi.txt'), encoding='utf-8').read()),
}
for k, job in JOBS.items():
    if not ONLY or k in ONLY: job()
