import type { ImageDescriptionRequest, ImageDescriptionResult } from "../../types.js";
import { generateOpenAiInlineDataText } from "./inline-data.js";
import { stripThinkingTags } from "./strip-thinking.js";

const DEFAULT_XIAOMI_IMAGE_BASE_URL = "http://omni-api-10002.bcecn-bj-cloudml.xiaomi.srv/v1";
const DEFAULT_XIAOMI_IMAGE_MODEL = "mimo_omni";
const DEFAULT_XIAOMI_IMAGE_PROMPT = "Describe the image in detail.";

export async function describeXiaomiImage(
  params: ImageDescriptionRequest,
): Promise<ImageDescriptionResult> {
  // Force model to mimo_omni for image — mimo-pro doesn't support image input.
  // ImageDescriptionRequest doesn't carry apiKey (it uses model registry instead),
  // but generateOpenAiInlineDataText needs one. We pass "none" since the proxy
  // doesn't require authentication.
  const { text, model } = await generateOpenAiInlineDataText({
    buffer: params.buffer,
    mime: params.mime,
    apiKey: "none",
    model: DEFAULT_XIAOMI_IMAGE_MODEL,
    prompt: params.prompt,
    timeoutMs: params.timeoutMs,
    defaultBaseUrl: DEFAULT_XIAOMI_IMAGE_BASE_URL,
    defaultModel: DEFAULT_XIAOMI_IMAGE_MODEL,
    defaultPrompt: DEFAULT_XIAOMI_IMAGE_PROMPT,
    defaultMime: params.mime ?? "image/jpeg",
    mediaType: "image_url",
    httpErrorLabel: "Xiaomi image description failed",
    missingTextError: "Xiaomi image description response missing content",
  });
  const cleanText = stripThinkingTags(text);
  return { text: cleanText || text, model };
}
