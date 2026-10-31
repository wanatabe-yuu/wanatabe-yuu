"""Synthesize royalty-free music and SFX for the Shorts, into public/.

Everything is generated from oscillators and noise, so there is nothing to license.
Run: python3 tools/gen_audio.py
"""
import math, os, wave
import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public")
rng = np.random.default_rng(7)


def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def env(n, attack=0.002, decay=0.2, curve=6.0):
    """Exponential decay envelope with a tiny linear attack."""
    x = np.arange(n) / SR
    e = np.exp(-x / decay * curve / 6.0 * 6.0)
    a = int(SR * attack)
    if a > 0:
        e[:a] *= np.linspace(0, 1, a)
    return e


def lowpass(x, cutoff):
    """One-pole lowpass, good enough to take the fizz off noise."""
    rc = 1.0 / (2 * math.pi * cutoff)
    alpha = (1.0 / SR) / (rc + 1.0 / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += alpha * (v - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def write(name, data, peak=0.9):
    data = np.asarray(data, dtype=np.float64)
    m = np.max(np.abs(data)) or 1.0
    data = data / m * peak
    pcm = (data * 32767).astype(np.int16)
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote", name, f"{len(data)/SR:.2f}s")


# ---------------- SFX ----------------
def tick(freq=1800, length=0.045, click=0.6):
    x = t(length)
    tone = np.sin(2 * math.pi * freq * x) * env(len(x), decay=0.02)
    noise = rng.standard_normal(len(x)) * env(len(x), decay=0.006) * click
    return tone + noise


def ding():
    x = t(0.9)
    notes = [(659.25, 1.0), (987.77, 0.7), (1318.5, 0.45)]  # E5 B5 E6
    out = np.zeros_like(x)
    for i, (f, g) in enumerate(notes):
        delay = int(SR * 0.04 * i)
        tone = np.sin(2 * math.pi * f * x) * env(len(x), decay=0.35) * g
        out[delay:] += tone[: len(x) - delay]
    sparkle = rng.standard_normal(len(x)) * env(len(x), decay=0.03) * 0.15
    return out + highpass(sparkle, 4000)


def whoosh(length=0.45, rise=0.6):
    x = t(length)
    n = rng.standard_normal(len(x))
    # amplitude swells then falls; cutoff sweeps upward
    a = np.sin(np.pi * np.clip(x / length, 0, 1)) ** 1.5
    sweep = lowpass(n, 1200) * (1 - rise) + highpass(n, 2500) * rise * (x / length)
    return sweep * a


def thud():
    x = t(0.35)
    f = 110 * np.exp(-x * 12) + 55
    body = np.sin(2 * math.pi * np.cumsum(f) / SR) * env(len(x), decay=0.18)
    click = rng.standard_normal(len(x)) * env(len(x), decay=0.004) * 0.5
    return body + lowpass(click, 3000)


def riser(length=1.0):
    x = t(length)
    n = rng.standard_normal(len(x))
    a = (x / length) ** 2.2
    tone = np.sin(2 * math.pi * (220 + 660 * (x / length) ** 2) * x) * 0.4
    return (highpass(n, 1500) * 0.7 + tone) * a


# ---------------- MUSIC ----------------
def music(seconds=26.0, bpm=124):
    beat = 60.0 / bpm
    n = int(SR * seconds)
    out = np.zeros(n)
    x = np.arange(n) / SR

    def place(buf, start_s, gain=1.0):
        s = int(start_s * SR)
        e = min(n, s + len(buf))
        if s < n:
            out[s:e] += buf[: e - s] * gain

    # drums
    kick_x = t(0.35)
    kick_f = 150 * np.exp(-kick_x * 25) + 48
    kick = np.sin(2 * math.pi * np.cumsum(kick_f) / SR) * env(len(kick_x), decay=0.16)
    hat = highpass(rng.standard_normal(int(SR * 0.06)), 6000) * env(int(SR * 0.06), decay=0.015)
    ohat = highpass(rng.standard_normal(int(SR * 0.16)), 6000) * env(int(SR * 0.16), decay=0.06)
    clap_n = int(SR * 0.22)
    clap = lowpass(highpass(rng.standard_normal(clap_n), 900), 5000) * env(clap_n, decay=0.07)

    # A minor, tense: bass root pattern per bar (Hz)
    A1, C2, G1, F1, E1 = 55.0, 65.41, 49.0, 43.65, 41.2
    bass_pattern = [A1, A1, C2, G1, F1, F1, E1, G1]  # one note per half-bar
    arp_notes = [220.0, 261.63, 329.63, 440.0, 329.63, 261.63]  # A3 C4 E4 A4 ...

    total_beats = int(seconds / beat) + 1
    for b in range(total_beats):
        tb = b * beat
        bar = b // 4
        in_bar = b % 4
        # kick on 1 and 3, extra kick on 4.5 every other bar
        if in_bar in (0, 2):
            place(kick, tb, 1.0)
        if in_bar == 3 and bar % 2 == 1:
            place(kick, tb + beat / 2, 0.8)
        # clap on 2 and 4
        if in_bar in (1, 3):
            place(clap, tb, 0.55)
        # hats on 8ths, open hat on the "and" of 4
        place(hat, tb, 0.35)
        place(ohat if in_bar == 3 else hat, tb + beat / 2, 0.3 if in_bar == 3 else 0.22)
        # bass: 8th notes, one pitch per half bar
        f = bass_pattern[(b // 2) % len(bass_pattern)]
        for k in range(2):
            bx = t(beat / 2 * 0.9)
            tone = (np.sin(2 * math.pi * f * bx) + 0.35 * np.sin(2 * math.pi * 2 * f * bx)
                    + 0.15 * np.sign(np.sin(2 * math.pi * f * bx)))
            tone *= env(len(bx), attack=0.004, decay=0.22)
            place(lowpass(tone, 900), tb + k * beat / 2, 0.55)
        # arp: 16ths, pluck
        for k in range(4):
            idx = (b * 4 + k) % len(arp_notes)
            ax = t(beat / 4)
            pl = np.sin(2 * math.pi * arp_notes[idx] * ax) * env(len(ax), attack=0.001, decay=0.06)
            place(pl, tb + k * beat / 4, 0.16)

    # gentle fade in/out so cuts are clean
    fade = int(SR * 0.4)
    out[:fade] *= np.linspace(0, 1, fade)
    out[-fade:] *= np.linspace(1, 0, fade)
    return out


if __name__ == "__main__":
    write("sfx-tick.wav", tick(), 0.8)
    write("sfx-tick-urgent.wav", tick(freq=1300, length=0.07, click=0.9), 0.95)
    write("sfx-ding.wav", ding(), 0.9)
    write("sfx-whoosh.wav", whoosh(), 0.8)
    write("sfx-thud.wav", thud(), 0.95)
    write("sfx-riser.wav", riser(), 0.85)
    write("music.wav", music(), 0.85)
