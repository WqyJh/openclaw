import type { AudioTranscriptionRequest, AudioTranscriptionResult } from "../../types.js";
import { generateOpenAiInlineDataText } from "./inline-data.js";

const DEFAULT_XIAOMI_AUDIO_BASE_URL = "http://omni-api-10002.bcecn-bj-cloudml.xiaomi.srv/v1";
const DEFAULT_XIAOMI_AUDIO_MODEL = "mimo_omni";
const DEFAULT_XIAOMI_AUDIO_PROMPT = "Transcribe the audio.";

export async function transcribeXiaomiAudio(
  params: AudioTranscriptionRequest,
): Promise<AudioTranscriptionResult> {
  const { text, model } = await generateOpenAiInlineDataText({
    ...params,
    defaultBaseUrl: DEFAULT_XIAOMI_AUDIO_BASE_URL,
    defaultModel: DEFAULT_XIAOMI_AUDIO_MODEL,
    defaultPrompt: DEFAULT_XIAOMI_AUDIO_PROMPT,
    defaultMime: params.mime ?? "audio/wav",
    mediaType: "audio_url",
    httpErrorLabel: "Xiaomi audio transcription failed",
    missingTextError: "Xiaomi audio transcription response missing content",
  });
  return { text, model };
}