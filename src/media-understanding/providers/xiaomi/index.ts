import type { MediaUnderstandingProvider } from "../../types.js";
import { transcribeXiaomiAudio } from "./audio.js";
import { describeXiaomiImage } from "./image.js";
import { describeXiaomiVideo } from "./video.js";

export const xiaomiProvider: MediaUnderstandingProvider = {
  id: "xiaomi",
  capabilities: ["image", "audio", "video"],
  describeImage: describeXiaomiImage,
  describeVideo: describeXiaomiVideo,
  transcribeAudio: transcribeXiaomiAudio,
};
