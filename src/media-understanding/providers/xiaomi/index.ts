import type { MediaUnderstandingProvider } from "../../types.js";
import { describeImageWithModel } from "../image.js";
import { transcribeXiaomiAudio } from "./audio.js";
import { describeXiaomiVideo } from "./video.js";

export const xiaomiProvider: MediaUnderstandingProvider = {
  id: "xiaomi",
  capabilities: ["image", "audio", "video"],
  describeImage: describeImageWithModel,
  describeVideo: describeXiaomiVideo,
  transcribeAudio: transcribeXiaomiAudio,
};