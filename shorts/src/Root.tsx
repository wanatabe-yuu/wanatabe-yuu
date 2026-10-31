import { Composition } from "remotion";
import { OddOneOut, TOTAL_FRAMES, FPS } from "./OddOneOut";

export const RemotionRoot = () => (
  <Composition
    id="OddOneOut"
    component={OddOneOut}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
