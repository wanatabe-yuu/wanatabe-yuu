import { Composition } from "remotion";
import { OddOneOut, TOTAL_FRAMES, FPS } from "./OddOneOut";
import { Avatar, AVATAR_SIZE } from "./Avatar";
import { ToughnessAvatar, TC_SIZE } from "./ToughnessAvatar";

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
    <Composition
      id="ToughnessAvatar"
      component={ToughnessAvatar}
      durationInFrames={1}
      fps={1}
      width={TC_SIZE}
      height={TC_SIZE}
      defaultProps={{ variant: "full" as const, showCircleGuide: false }}
    />
  </>
);
