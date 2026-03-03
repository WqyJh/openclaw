import type { AudioTranscriptionRequest, AudioTranscriptionResult } from "../../types.js";
import {
  assertOkOrThrowHttpError,
  normalizeBaseUrl,
  fetchWithTimeoutGuarded,
} from "../shared.js";

// Xiaomi MIMO Omni audio transcription endpoint (using chat/completion like Gemini)
const DEFAULT_XIAOMI_AUDIO_BASE_URL = "http://s-20251121150535-h1owo-fqueo.wlcb-prod-3-cloudml.xiaomi.srv/v1";
const DEFAULT_XIAOMI_AUDIO_MODEL = "mimo_omni";
const DEFAULT_XIAOMI_AUDIO_PROMPT = "Transcribe the audio.";

type XiaomiAudioPayload = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ text?: string }>;
      reasoning_content?: string;
    };
  }>;
};

function resolveModel(model?: string): string {
  const trimmed = model?.trim();
  return trimmed || DEFAULT_XIAOMI_AUDIO_MODEL;
}

function resolvePrompt(prompt?: string): string {
  const trimmed = prompt?.trim();
  return trimmed || DEFAULT_XIAOMI_AUDIO_PROMPT;
}

function coerceXiaomiText(payload: XiaomiAudioPayload): string | null {
  const message = payload.choices?.[0]?.message;
  if (!message) {
    return null;
  }
  if (typeof message.content === "string" && message.content.trim()) {
    return message.content.trim();
  }
  if (Array.isArray(message.content)) {
    const text = message.content
      .map((part) => (typeof part.text === "string" ? part.text.trim() : ""))
      .filter(Boolean)
      .join("\n")
      .trim();
    if (text) {
      return text;
    }
  }
  if (typeof message.reasoning_content === "string" && message.reasoning_content.trim()) {
    return message.reasoning_content.trim();
  }
  return null;
}

export async function transcribeXiaomiAudio(
  params: AudioTranscriptionRequest,
): Promise<AudioTranscriptionResult> {
  const fetchFn = params.fetchFn ?? fetch;
  const baseUrl = normalizeBaseUrl(params.baseUrl, DEFAULT_XIAOMI_AUDIO_BASE_URL);
  const model = resolveModel(params.model);
  const mime = params.mime ?? "audio/wav";
  const prompt = params.prompt?.trim() || resolvePrompt(params.prompt);
  const url = `${baseUrl}/chat/completions`;

  const headers = new Headers(params.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (!headers.has("authorization")) {
    headers.set("authorization", `Bearer ${params.apiKey}`);
  }

  const body = {
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "audio_url",
            audio_url: {
              url: `data:${mime};base64,${params.buffer.toString("base64")}`,
            },
          },
        ],
      },
    ],
  };

  const { response: res, release } = await fetchWithTimeoutGuarded(
    url,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
    params.timeoutMs,
    fetchFn,
  );

  try {
    await assertOkOrThrowHttpError(res, "Xiaomi audio transcription failed");
    const payload = (await res.json()) as XiaomiAudioPayload;
    const text = coerceXiaomiText(payload);
    if (!text) {
      throw new Error("Xiaomi audio transcription response missing content");
    }
    return { text, model };
  } finally {
    await release();
  }
}