import type { MediaUnderstandingProvider } from "../../types.js";
import { describeImageWithModel } from "../image.js";
import { transcribeXiaomiAudio } from "./audio.js";
import { describeXiaomiVideo } from "./video.js";

export const xiaomiProvider: MediaUnderstandingProvider = {
  id: "xiaomi",
  capabilities: ["image"],  // 根据实际测试，只支持图像
  describeImage: describeImageWithModel,
  // describeVideo: describeXiaomiVideo,  // 暂不支持视频
  // transcribeAudio: transcribeXiaomiAudio,  // 暂不支持音频
};