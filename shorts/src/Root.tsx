import { Composition } from "remotion";
import { OddOneOut, TOTAL_FRAMES, FPS } from "./OddOneOut";
import { Avatar, AVATAR_SIZE } from "./Avatar";

export const RemotionRoot = () => (
  <>
    <Composition
      id="OddOneOut"
      component={OddOneOut}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="Avatar"
      component={Avatar}
      durationInFrames={1}
      fps={1}
      width={AVATAR_SIZE}
      height={AVATAR_SIZE}
      defaultProps={{ showCircleGuide: false }}
    />
  </>
);
