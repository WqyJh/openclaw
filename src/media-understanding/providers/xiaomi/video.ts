import type { VideoDescriptionRequest, VideoDescriptionResult } from "../../types.js";
import { generateOpenAiInlineDataText } from "./inline-data.js";
import { stripThinkingTags } from "./strip-thinking.js";

const DEFAULT_XIAOMI_VIDEO_BASE_URL = "http://omni-api-10002.bcecn-bj-cloudml.xiaomi.srv/v1";
const DEFAULT_XIAOMI_VIDEO_MODEL = "mimo_omni";
const DEFAULT_XIAOMI_VIDEO_PROMPT = "Describe the video.";

export async function describeXiaomiVideo(
  params: VideoDescriptionRequest,
): Promise<VideoDescriptionResult> {
  // Force model to mimo_omni for video — mimo-pro doesn't support video input.
  const { text, model } = await generateOpenAiInlineDataText({
    ...params,
    model: DEFAULT_XIAOMI_VIDEO_MODEL,
    defaultBaseUrl: DEFAULT_XIAOMI_VIDEO_BASE_URL,
    defaultModel: DEFAULT_XIAOMI_VIDEO_MODEL,
    defaultPrompt: DEFAULT_XIAOMI_VIDEO_PROMPT,
    defaultMime: params.mime ?? "video/mp4",
    mediaType: "video_url",
    httpErrorLabel: "Xiaomi video description failed",
    missingTextError: "Xiaomi video description response missing content",
  });
  const cleanText = stripThinkingTags(text);
  return { text: cleanText || text, model };
}
