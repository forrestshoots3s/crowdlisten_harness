/**
 * Client-side PII redaction using regex patterns.
 * Runs entirely locally — no data leaves before redaction.
 * Ported from crowdlisten_deployed/frontend/src/lib/piiRedactor.js
 */

import type { RedactionResult } from "./types.js";

interface Pattern {
  name: string;
  regex: RegExp;
  replacement: string;
}

const PATTERNS: Pattern[] = [
  {
    name: "emails",
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: "[EMAIL]",
  },
  {
    name: "phones",
    regex:
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
    replacement: "[PHONE]",
  },
  {
    name: "ssns",
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: "[SSN]",
  },
  {
    name: "creditCards",
    regex: /\b(?:\d[ -]*?){13,19}\b/g,
    replacement: "[CREDIT_CARD]",
  },
  {
    name: "ipAddresses",
    regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: "[IP_ADDRESS]",
  },
  {
    name: "apiKeys",
    regex:
      /\b(?:sk-|pk-|api[_-]|token[_-]|bearer\s+|ghp_|gho_|xox[bpsa]-)[A-Za-z0-9_\-/.]{20,}\b/gi,
    replacement: "[API_KEY]",
  },
  {
    name: "genericTokens",
    regex: /\b[A-Fa-f0-9]{40,}\b/g,
    replacement: "[TOKEN]",
  },
  {
    name: "urlCredentials",
    regex: /https?:\/\/[^:]+:[^@]+@[^\s]+/g,
    replacement: "[URL_WITH_CREDENTIALS]",
  },
];

/**
 * Redact PII from text using local regex patterns.
 */
export function redactPII(text: string): RedactionResult {
  if (!text) return { redactedText: "", stats: {}, totalRedactions: 0 };

  let redactedText = text;
  const stats: Record<string, number> = {};
  let totalRedactions = 0;

  for (const { name, regex, replacement } of PATTERNS) {
    regex.lastIndex = 0;
    const matches = redactedText.match(regex);
    const count = matches?.length || 0;
    if (count > 0) {
      stats[name] = count;
      totalRedactions += count;
      redactedText = redactedText.replace(regex, replacement);
    }
  }

  return { redactedText, stats, totalRedactions };
}
