import type { AudioTranscriptionRequest, AudioTranscriptionResult } from "../../types.js";
import { generateOpenAiInlineDataText } from "./inline-data.js";
import { stripThinkingTags } from "./strip-thinking.js";

const DEFAULT_XIAOMI_AUDIO_BASE_URL = "http://omni-api-10002.bcecn-bj-cloudml.xiaomi.srv/v1";
const DEFAULT_XIAOMI_AUDIO_MODEL = "mimo_omni";
const DEFAULT_XIAOMI_AUDIO_PROMPT = "Transcribe the audio.";

export async function transcribeXiaomiAudio(
  params: AudioTranscriptionRequest,
): Promise<AudioTranscriptionResult> {
  // Force model to mimo_omni for audio — mimo-pro doesn't support audio input.
  // The runner may pass the active text model (e.g. mimo-0218_pro), which we override here.
  const { text, model } = await generateOpenAiInlineDataText({
    ...params,
    model: DEFAULT_XIAOMI_AUDIO_MODEL,
    defaultBaseUrl: DEFAULT_XIAOMI_AUDIO_BASE_URL,
    defaultModel: DEFAULT_XIAOMI_AUDIO_MODEL,
    defaultPrompt: DEFAULT_XIAOMI_AUDIO_PROMPT,
    defaultMime: params.mime ?? "audio/wav",
    mediaType: "audio_url",
    httpErrorLabel: "Xiaomi audio transcription failed",
    missingTextError: "Xiaomi audio transcription response missing content",
  });
  const cleanText = stripThinkingTags(text);
  return { text: cleanText || text, model };
}
