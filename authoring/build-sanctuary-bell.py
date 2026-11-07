"""Đại hồng chung variants (clear, majestic, long hum). Usage: python tools/build-sanctuary-bell.py → amb/chua_bell_a|b|c.mp3"""
import importlib.util, os, numpy as np
spec = importlib.util.spec_from_file_location('sa', os.path.join(os.path.dirname(__file__), 'build-sanctuary-audio.py')); sa = importlib.util.module_from_spec(spec); spec.loader.exec_module(sa)
from scipy.signal import butter, lfilter
SR = sa.SR

def bell(name, f, parts, strike=.12, dur=40, room=8):
    tt = sa.t_(dur); x = np.zeros_like(tt)
    for r, a, d, beat in parts:
        for det, w in ((0, 1), (beat, .8)):
            x += a * w * np.sin(2 * np.pi * (f * r + det) * tt + sa.rng.uniform(0, 6.28)) * np.exp(-tt / d)
    x *= 1 - np.exp(-tt / .006)
    # soft wooden ram on bronze: a short pitched knock, no rumble
    x += sa.bandpass(sa.rng.standard_normal(len(tt)), 300, 1800) * np.exp(-tt / .025) * strike
    b, a = butter(2, 70 / (SR / 2), 'high'); x = lfilter(b, a, x)
    st = np.array([x, np.roll(x, int(.0009 * SR))])
    sa.write(name, sa.reverb(st, room, .42, 3800, .05), 128)

# A: deep and solemn (temple great bell, ~98 Hz)
bell('chua_bell_a', 98, [(1, 1, 26, .45), (2.0, .7, 18, .7), (2.66, .55, 13, .5), (3.37, .35, 9, .9), (4.2, .25, 6, 1.1), (5.43, .14, 4, 1.3)])
# B: brighter, more singing (~131 Hz, C3), strong ngân beating
bell('chua_bell_b', 131, [(1, 1, 24, .6), (2.0, .8, 17, .8), (2.4, .5, 12, .4), (3.0, .45, 10, 1.0), (4.15, .3, 7, 1.2), (5.4, .2, 4.5, 1.5), (6.8, .1, 3, 2)])
# C: grand and long (~87 Hz), very long hum, gentle strike
bell('chua_bell_c', 87, [(1, 1, 32, .35), (1.98, .75, 22, .55), (2.71, .6, 15, .7), (3.52, .4, 10, .8), (4.38, .28, 7, 1.0), (5.6, .16, 5, 1.3), (7.0, .08, 3, 1.6)], .08, 46, 9)
