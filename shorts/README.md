# Shorts (Remotion)

Programmatic YouTube Shorts, 1080x1920 @ 30fps.

## Run

```bash
cd shorts
npm install
npx remotion studio src/index.ts            # live preview in the browser
npx remotion render src/index.ts OddOneOut out/odd-one-out.mp4 --codec=h264 --crf=18
npx remotion still  src/index.ts OddOneOut out/frame.jpg --frame=120
```

## Compositions

- `OddOneOut` (25s): three "find the odd tile" rounds with a countdown, reveal, and
  a "comment your score" end card. Rounds are defined in `src/puzzles.ts`; change the
  grid size, seconds, seed, or `render()` to make a new variant without touching layout.

- `Avatar` (800x800 still): channel avatar, a 3x3 tile grid with one glowing odd tile.
  Render with `npx remotion still src/index.ts Avatar out/avatar.png --image-format=png`;
  pass `--props='{"showCircleGuide":true}'` to preview YouTube's circular crop.

- `ToughnessAvatar` (800x800 still): hexagon badge for the "Toughness Challenge" channel.
  `--props='{"variant":"full"}'` for the full wordmark, `{"variant":"monogram"}` for "TC".

## Audio

All music and SFX are synthesized by `tools/gen_audio.py` (numpy only) into `public/`,
so there is nothing to license and YouTube does not split Shorts revenue for music.
Re-run it after changing a sound:

```bash
python3 tools/gen_audio.py
ffmpeg -y -i public/music.wav -c:a libmp3lame -b:a 160k public/music.mp3 && rm public/music.wav
```

Sounds: `music.mp3` (124 BPM, A minor bed), `sfx-tick` / `sfx-tick-urgent` (countdown),
`sfx-ding` (reveal), `sfx-whoosh` (round start), `sfx-thud` (hook badge), `sfx-riser` (end card).
Volumes are set per `<Sfx>` in `src/OddOneOut.tsx`.

`remotion.config.ts` points at the pre-installed Chromium (`/opt/pw-browsers/chromium`).
Remove that line on a machine where Remotion should download its own browser.
