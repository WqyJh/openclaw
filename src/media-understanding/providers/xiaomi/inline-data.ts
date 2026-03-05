import { assertOkOrThrowHttpError, normalizeBaseUrl, fetchWithTimeoutGuarded } from "../shared.js";

type OpenAiInlineDataPayload = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ text?: string }>;
      reasoning_content?: string;
    };
  }>;
};

function coerceOpenAiText(payload: OpenAiInlineDataPayload): string | null {
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

type MediaType = "audio_url" | "video_url" | "image_url";

export async function generateOpenAiInlineDataText(params: {
  buffer: Buffer;
  mime?: string;
  apiKey: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  model?: string;
  prompt?: string;
  timeoutMs: number;
  fetchFn?: typeof fetch;
  defaultBaseUrl: string;
  defaultModel: string;
  defaultPrompt: string;
  defaultMime: string;
  mediaType: MediaType;
  httpErrorLabel: string;
  missingTextError: string;
}): Promise<{ text: string; model: string }> {
  const fetchFn = params.fetchFn ?? fetch;
  const baseUrl = normalizeBaseUrl(params.baseUrl, params.defaultBaseUrl);
  const model = params.model?.trim() || params.defaultModel;
  const prompt = params.prompt?.trim() || params.defaultPrompt;
  const mime = params.mime || params.defaultMime;
  const url = `${baseUrl}/chat/completions`;

  const headers = new Headers(params.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (!headers.has("authorization")) {
    headers.set("authorization", `Bearer ${params.apiKey}`);
  }

  const mediaUrl = `data:${mime};base64,${params.buffer.toString("base64")}`;
  const mediaContent =
    params.mediaType === "audio_url"
      ? { type: "audio_url", audio_url: { url: mediaUrl } }
      : params.mediaType === "video_url"
        ? { type: "video_url", video_url: { url: mediaUrl } }
        : { type: "image_url", image_url: { url: mediaUrl } };

  const body = {
    model,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }, mediaContent],
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
    { ssrfPolicy: { allowPrivateNetwork: true } },
  );

  try {
    await assertOkOrThrowHttpError(res, params.httpErrorLabel);
    const payload = (await res.json()) as OpenAiInlineDataPayload;
    const text = coerceOpenAiText(payload);
    if (!text) {
      throw new Error(params.missingTextError);
    }
    return { text, model };
  } finally {
    await release();
  }
}
