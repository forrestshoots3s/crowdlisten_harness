/**
 * Parse chat exports (.json, .zip, .txt, .md, .pdf) and chunk text.
 * Ported from crowdlisten_deployed/frontend/src/services/chatHistoryService.js
 * Decoupled from browser File API — works with Node.js buffers/strings.
 */

const BATCH_CHAR_LIMIT = 12_000;

// ─── Parsers ──────────────────────────────────────────────────────────────────

/**
 * Parse ChatGPT export JSON (conversations[].mapping -> user+assistant messages)
 */
function parseChatGPTExport(json: unknown): string {
  const texts: string[] = [];
  const conversations = Array.isArray(json) ? json : [json];

  for (const convo of conversations) {
    if (!convo?.mapping) continue;
    for (const node of Object.values(convo.mapping) as any[]) {
      const msg = node?.message;
      if (!msg?.content?.parts?.length) continue;
      if (msg.author?.role === "user" || msg.author?.role === "assistant") {
        texts.push(msg.content.parts.join("\n"));
      }
    }
  }
  return texts.join("\n\n---\n\n");
}

/**
 * Parse Claude export JSON (conversations[].chat_messages -> text content)
 */
function parseClaudeExport(json: unknown): string {
  const texts: string[] = [];
  const conversations = Array.isArray(json) ? json : [json];

  for (const convo of conversations) {
    const c = convo as any;
    const messages = c.chat_messages || c.messages || [];
    for (const msg of messages) {
      const text =
        msg.text ||
        (typeof msg.content === "string"
          ? msg.content
          : Array.isArray(msg.content)
            ? msg.content
                .filter((c: any) => c.type === "text")
                .map((c: any) => c.text)
                .join("\n")
            : null);
      if (text) texts.push(text);
    }
  }
  return texts.join("\n\n---\n\n");
}

/**
 * Auto-detect format and parse JSON content.
 */
function parseJSON(json: unknown): string {
  const arr = Array.isArray(json) ? json : [json];
  const sample = (arr[0] || {}) as any;

  if (sample.mapping) return parseChatGPTExport(json);
  if (sample.chat_messages || (sample.messages && sample.uuid))
    return parseClaudeExport(json);

  return JSON.stringify(json, null, 2);
}

// ─── File Parsing ────────────────────────────────────────────────────────────

/**
 * Parse a single file from a buffer or string. Handles .json, .txt, .md.
 * For .zip, use parseZipBuffer(). For .pdf, use parsePdfBuffer().
 */
export function parseTextContent(content: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "json") {
    try {
      return parseJSON(JSON.parse(content));
    } catch {
      return content;
    }
  }

  return content;
}

/**
 * Parse a ZIP buffer containing chat exports.
 * Requires jszip to be installed.
 */
export async function parseZipBuffer(buffer: Buffer): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const texts: string[] = [];

  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const content = await entry.async("string");
    if (name.endsWith(".json")) {
      try {
        texts.push(parseJSON(JSON.parse(content)));
      } catch {
        texts.push(content);
      }
    } else {
      texts.push(content);
    }
  }

  return texts.join("\n\n---\n\n");
}

/**
 * Parse a PDF buffer into text.
 * Requires pdf-parse to be installed.
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Parse a file from disk by path.
 */
export async function parseFile(filePath: string): Promise<string> {
  const fs = await import("fs/promises");
  const ext = filePath.split(".").pop()?.toLowerCase();

  if (ext === "zip") {
    const buffer = await fs.readFile(filePath);
    return parseZipBuffer(buffer);
  }

  if (ext === "pdf") {
    const buffer = await fs.readFile(filePath);
    return parsePdfBuffer(buffer);
  }

  const content = await fs.readFile(filePath, "utf-8");
  return parseTextContent(content, filePath);
}

// ─── Chunking ────────────────────────────────────────────────────────────────

/**
 * Split text into chunks of ~maxChars at paragraph boundaries.
 */
export function chunkText(
  text: string,
  maxChars: number = BATCH_CHAR_LIMIT
): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChars;
    if (end >= text.length) {
      chunks.push(text.slice(start));
      break;
    }
    const breakPoint = text.lastIndexOf("\n\n", end);
    if (breakPoint > start + maxChars * 0.5) {
      end = breakPoint;
    }
    chunks.push(text.slice(start, end));
    start = end;
  }

  return chunks;
}
