import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Use the pre-installed Chromium instead of downloading one.
Config.setBrowserExecutable("/opt/pw-browsers/chromium");
Config.setChromiumOpenGlRenderer("angle-egl");
