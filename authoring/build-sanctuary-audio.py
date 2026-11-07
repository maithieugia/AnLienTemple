"""
Synthesizes the An Lien sanctuary soundscape (original, no third-party recordings):
  chua_bell      đại hồng chung — one deep bronze stroke with a long beating hum (~32 s)
  chua_chimes    chuông gió — wind chimes stirring in gusts, seamless loop (~90 s)
  chua_music     nhạc thiền — slow pentatonic pad + đàn tranh plucks + sáo, seamless loop (~160 s)
  chua_mo        mõ — one wooden-fish knock
  chua_khanh     chuông gia trì — a small singing-bowl bell (~9 s)
Output: apps/client/public/assets/amb/<name>.mp3 (stereo 44.1 kHz, ffmpeg).
Usage: python tools/build-sanctuary-audio.py
"""
import os, subprocess, wave
import numpy as np
from scipy.signal import fftconvolve, butter, lfilter

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'apps', 'client', 'public', 'assets', 'amb')
TMP = os.path.join(ROOT, 'assets-src', '.tmp', 'sanctuary-audio')
FF = r'C:\ffmpeg\bin\ffmpeg.exe' if os.path.exists(r'C:\ffmpeg\bin\ffmpeg.exe') else 'ffmpeg'
rng = np.random.default_rng(108)


def t_(sec): return np.arange(int(sec * SR)) / SR


def lowpass(x, f, order=2):
    b, a = butter(order, f / (SR / 2), 'low'); return lfilter(b, a, x)


def bandpass(x, lo, hi, order=2):
    b, a = butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)


def reverb(stereo, seconds=4.5, wet=.35, damp=4500, pre=.03):
    n = int(seconds * SR); tt = np.arange(n) / SR
    out = []
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-6.9 * tt / seconds)
        ir = lowpass(ir, damp); ir[:int(pre * SR)] = 0; ir /= np.sqrt((ir ** 2).sum())
        out.append(fftconvolve(stereo[ch], ir)[:stereo.shape[1]])
    w = np.array(out)
    return stereo * (1 - wet) + w * wet * 3.2


def pan(mono, p):  # p -1..1
    return np.array([mono * np.sqrt((1 - p) / 2), mono * np.sqrt((1 + p) / 2)])


def loopify(st, fade):
    """Crossfade the tail into the head so the clip loops without a seam."""
    n = int(fade * SR); body = st[:, :-n].copy(); tail = st[:, -n:]
    r = np.linspace(0, 1, n)
    body[:, :n] = body[:, :n] * np.sqrt(r) + tail * np.sqrt(1 - r)
    return body


def write(name, st, kbps=96, peak=.89):
    st = st / (np.abs(st).max() + 1e-9) * peak
    os.makedirs(TMP, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    wav = os.path.join(TMP, name + '.wav')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(st.T, -1, 1) * 32767).astype(np.int16).tobytes())
    mp3 = os.path.join(OUT, name + '.mp3')
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libmp3lame', '-b:a', f'{kbps}k', mp3], check=True)
    print(name, round(st.shape[1] / SR, 1), 's', os.path.getsize(mp3) // 1024, 'KB')


# ------------------------------------------------------------------ đại hồng chung
def bell():
    tt = t_(34); f = 73.0
    parts = [(.5, .5, 30), (1, 1, 24), (2.09, .55, 15), (2.73, .42, 11), (3.42, .3, 8), (4.31, .22, 6), (5.37, .15, 4.2), (6.62, .1, 3), (8.13, .06, 2), (9.9, .04, 1.4)]
    x = np.zeros_like(tt)
    for r, a, d in parts:
        for det, w in ((0, 1), (.18 + r * .05, .7)):  # paired partials beat slowly: the bell "ngân"
            ph = rng.uniform(0, 2 * np.pi)
            x += a * w * np.sin(2 * np.pi * f * r * tt + det * 2 * np.pi * tt + ph) * np.exp(-tt / d)
    x *= 1 - np.exp(-tt / .004)
    strike = bandpass(rng.standard_normal(len(tt)), 180, 2400) * np.exp(-tt / .05) * .5
    thud = np.sin(2 * np.pi * 42 * tt) * np.exp(-tt / .35) * .8   # the log ram (chày) on bronze
    st = np.array([x + strike + thud, x * .97 + strike * .9 + thud])
    st[1] = np.roll(st[1], int(.0007 * SR))
    write('chua_bell', reverb(st, 7, .4, 3000), 112)


# ------------------------------------------------------------------ chuông gió
def chime_note(f, vel, dur=5.0):
    tt = t_(dur); x = np.zeros_like(tt)
    for r, a, d in ((1, 1, 3.6), (2.756, .45, 1.8), (5.404, .22, .9), (8.933, .1, .45)):
        x += a * np.sin(2 * np.pi * f * r * tt + rng.uniform(0, 6.28)) * np.exp(-tt / d) * (1 + .04 * np.sin(2 * np.pi * (1.3 + r * .2) * tt))
    return x * vel * (1 - np.exp(-tt / .0015))


def chimes():
    L = 96; st = np.zeros((2, int(L * SR)))
    notes = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0, 2349.3]
    pans = np.linspace(-.6, .6, len(notes))
    tcur = .5
    while tcur < L - 6:
        gust = rng.uniform(1.5, 5.0); n = int(rng.integers(3, 13)); strength = rng.uniform(.35, 1)
        for _ in range(n):
            ts = tcur + rng.uniform(0, gust) * rng.uniform(.4, 1)
            k = int(rng.integers(len(notes)))
            note = chime_note(notes[k] * (1 + rng.normal(0, .0015)), strength * rng.uniform(.25, .9))
            i0 = int(ts * SR); seg = pan(note, pans[k] + rng.normal(0, .08))
            i1 = min(st.shape[1], i0 + seg.shape[1]); st[:, i0:i1] += seg[:, :i1 - i0]
        tcur += gust + rng.uniform(2, 9)
    breeze = lowpass(rng.standard_normal(st.shape[1]), 700) * .025 * (1 + .6 * np.sin(2 * np.pi * t_(L) / 13))
    st += np.array([breeze, np.roll(breeze, 3000)])
    write('chua_chimes', loopify(reverb(st, 3.5, .35, 6000), 6), 96, .8)


# ------------------------------------------------------------------ nhạc thiền / tiên cảnh
def midi(n): return 440 * 2 ** ((n - 69) / 12)


def pad(freqs, dur, att=5, rel=6):
    tt = t_(dur); x = np.zeros_like(tt)
    for f in freqs:
        for det in (-.11, 0, .13):
            x += np.sin(2 * np.pi * f * (1 + det / 100) * tt + rng.uniform(0, 6.28)) * (1 / (1 + f / 400))
            x += .18 * np.sin(4 * np.pi * f * (1 + det / 100) * tt)
    env = np.minimum(1, tt / att) * np.minimum(1, (dur - tt) / rel).clip(0)
    return x * env * (1 + .15 * np.sin(2 * np.pi * tt / 9))


def tranh(f, dur=4.5, bend=False):
    """A đàn tranh pluck: bright attack, warm decay, optional nhấn (bend up a tone and back)."""
    tt = t_(dur)
    fm = np.full_like(tt, f)
    if bend: fm *= 2 ** ((2 / 12) * np.clip(np.sin(np.pi * (tt - .35) / 1.2), 0, 1) * (tt > .35) * (tt < 1.55))
    ph = 2 * np.pi * np.cumsum(fm) / SR
    x = sum(a * np.sin(k * ph) * np.exp(-tt / (d)) for k, a, d in ((1, 1, 1.9), (2, .5, 1.1), (3, .32, .6), (4, .18, .35), (5, .1, .2)))
    x *= 1 + .05 * np.sin(2 * np.pi * 5.5 * tt) * (tt > .3)
    return x * (1 - np.exp(-tt / .002))


def sao(seq, att=.25):
    """Bamboo flute line: list of (midi, seconds) with legato glides, vibrato and breath."""
    total = sum(d for _, d in seq) + 1.5; tt = t_(total); f = np.zeros_like(tt); tcur = 0
    amp = np.zeros_like(tt)
    for i, (n, d) in enumerate(seq):
        i0, i1 = int(tcur * SR), int((tcur + d) * SR)
        f[i0:i1] = midi(n); amp[i0:i1] = 1; tcur += d
    f[f == 0] = midi(seq[-1][0])
    f = lowpass(f, 6)  # glides between notes
    vib = 1 + .006 * np.sin(2 * np.pi * 5.1 * tt) * np.clip((tt % 2.5) / 1.2, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    env = lowpass(amp, 3) * np.minimum(1, tt / att)
    breath = bandpass(rng.standard_normal(len(tt)), 900, 4000) * .06
    return (np.sin(ph) + .12 * np.sin(2 * ph) + .05 * np.sin(3 * ph) + breath) * env


def music():
    L = 166; st = np.zeros((2, int(L * SR)))
    D = 50  # D3
    prog = [[D, D + 7, D + 14, D + 16, D + 19], [D - 3, D + 4, D + 9, D + 12, D + 16], [D + 2, D + 9, D + 14, D + 21], [D - 5, D + 2, D + 7, D + 14, D + 16]]
    seg = 41.5
    for i in range(4):
        x = pad([midi(n) for n in prog[i % 4]], seg + 8, 6, 8) * .05
        i0 = int(i * seg * SR); s = pan(x, -.2 + .4 * (i % 2)); i1 = min(st.shape[1], i0 + s.shape[1]); st[:, i0:i1] += s[:, :i1 - i0]
    # low tonic drone throughout, like a temple's resonance
    tt = t_(L); drone = (np.sin(2 * np.pi * midi(D - 12) * tt) + .4 * np.sin(2 * np.pi * midi(D - 5) * tt)) * .05 * (1 + .2 * np.sin(2 * np.pi * tt / 17))
    st += np.array([drone, drone])
    scale = [62, 64, 66, 69, 71, 74, 76, 78, 81]  # D major pentatonic, upper register
    tcur = 3.0
    while tcur < L - 8:  # sparse đàn tranh phrases
        n = int(rng.integers(3, 7)); idx = int(rng.integers(2, 6))
        for k in range(n):
            idx = int(np.clip(idx + rng.choice([-2, -1, -1, 1, 1, 2]), 0, len(scale) - 1))
            note = tranh(midi(scale[idx]), 4.5, bend=rng.random() < .25) * rng.uniform(.10, .17)
            i0 = int(tcur * SR); s = pan(note, rng.uniform(-.5, .5)); i1 = min(st.shape[1], i0 + s.shape[1]); st[:, i0:i1] += s[:, :i1 - i0]
            tcur += rng.choice([.45, .6, .9, 1.2])
        tcur += rng.uniform(5, 11)
    for start, line in ((22, [(74, 2.4), (76, 1.2), (78, 3.2), (76, 1.4), (74, 4.0)]), (78, [(81, 2.0), (78, 1.6), (76, 2.4), (74, 1.4), (71, 4.5)]), (128, [(69, 2.2), (71, 1.4), (74, 3.6), (76, 1.6), (74, 4.2)])):
        x = sao(line) * .07; i0 = int(start * SR); s = pan(x, .25); i1 = min(st.shape[1], i0 + s.shape[1]); st[:, i0:i1] += s[:, :i1 - i0]
    write('chua_music', loopify(reverb(st, 6, .45, 5000), 8), 96, .75)


# ------------------------------------------------------------------ mõ + chuông gia trì
def mo_knock(vel=1.0):
    tt = t_(.35)
    x = (np.sin(2 * np.pi * 620 * tt) * np.exp(-tt / .045) + .5 * np.sin(2 * np.pi * 1130 * tt) * np.exp(-tt / .025)
         + .25 * np.sin(2 * np.pi * 330 * tt) * np.exp(-tt / .06))
    x += bandpass(rng.standard_normal(len(tt)), 1500, 6000) * np.exp(-tt / .006) * .4
    return x * vel


def khanh_note(dur=9):
    tt = t_(dur); f = 432.0; x = np.zeros_like(tt)
    for r, a, d in ((1, 1, 6.5), (2.71, .5, 3.4), (5.15, .25, 1.6), (8.3, .1, .8)):
        for det, w in ((0, 1), (.9, .6)):
            x += a * w * np.sin(2 * np.pi * (f * r + det) * tt + rng.uniform(0, 6.28)) * np.exp(-tt / d)
    return x * (1 - np.exp(-tt / .002))


if __name__ == '__main__':
    bell(); chimes(); music()
    write('chua_mo', reverb(pan(np.concatenate([mo_knock(), np.zeros(int(.3 * SR))]), 0), 1.2, .2), 96, .8)
    write('chua_khanh', reverb(pan(khanh_note(), 0), 3, .3), 96, .8)
    np.save(os.path.join(TMP, 'mo.npy'), mo_knock()); np.save(os.path.join(TMP, 'khanh.npy'), khanh_note())
