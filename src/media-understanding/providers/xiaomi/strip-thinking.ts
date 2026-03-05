/**
 * Strip `<think>...</think>` reasoning blocks from mimo_omni model output.
 *
 * mimo_omni is a reasoning model that wraps its chain-of-thought in
 * `<think>` / `</think>` tags. For media understanding (audio transcription,
 * video description) we only want the final answer, not the thinking process.
 *
 * The regex is constructed via `new RegExp()` to avoid TypeScript / bundlers
 * interpreting the angle-bracket tags as JSX.
 */
export function stripThinkingTags(text: string): string {
  // Match <think>...</think> blocks (single angle brackets, standard XML-style).
  // Using `[\s\S]*?` for non-greedy match across newlines.
  const pattern = new RegExp("<think>[\\s\\S]*?</think>", "gi");
  return text.replace(pattern, "").trim();
}
