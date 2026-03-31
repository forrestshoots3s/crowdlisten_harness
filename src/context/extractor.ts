/**
 * Extract context blocks from text using the configured LLM provider.
 */

import type { LLMProvider, ContextBlock } from "./types.js";
import { CHAT_EXTRACT_SYSTEM_PROMPT, EXTRACT_SYSTEM_PROMPT } from "./prompts.js";

const MAX_INPUT_CHARS = 80_000;
const MAX_RETRIES = 2;

/**
 * Extract context blocks from a text chunk.
 * @param provider - LLM provider instance
 * @param text - Text to extract from (will be truncated to 80k chars)
 * @param source - Source label for the text
 * @param isChat - Whether this is chat history (uses 4-type prompt) or general text (2-type)
 */
export async function extractBlocks(
  provider: LLMProvider,
  text: string,
  source: string,
  isChat: boolean = true
): Promise<ContextBlock[]> {
  const trimmed = text.slice(0, MAX_INPUT_CHARS);
  const systemPrompt = isChat
    ? CHAT_EXTRACT_SYSTEM_PROMPT
    : EXTRACT_SYSTEM_PROMPT;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await provider.complete(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Source: "${source}"\n\n${trimmed}` },
        ],
        { temperature: 0.3, jsonMode: true }
      );

      const parsed = JSON.parse(response);
      const blocks: ContextBlock[] = (parsed.blocks || []).map(
        (b: any) => ({
          type: b.type,
          title: b.title,
          content: b.content,
          source,
        })
      );

      return blocks;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Context extraction failed after ${MAX_RETRIES + 1} attempts: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
      // Brief delay before retry
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  return []; // unreachable but satisfies TS
}
