#!/usr/bin/env node

/**
 * Build skills/catalog.json from SKILL.md files.
 * Extracts name, description, and keywords from YAML frontmatter + content.
 *
 * Usage: node scripts/build-catalog.js
 */

import { readFileSync, readdirSync, writeFileSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, "..", "skills");

function extractKeywords(content) {
  const keywords = new Set();

  // Extract from frontmatter description
  const descMatch = content.match(/^description:\s*(.+)$/m);
  if (descMatch) {
    const desc = descMatch[1].trim();
    // Split on common delimiters and extract meaningful words
    const words = desc
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    words.forEach((w) => keywords.add(w));
  }

  // Extract from ## When to Use headers
  const whenMatch = content.match(
    /## When to Use[\s\S]*?(?=\n## |\n---|\n$)/
  );
  if (whenMatch) {
    const bullets = whenMatch[0].match(/^- .+$/gm) || [];
    for (const bullet of bullets) {
      const words = bullet
        .replace(/^- /, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3);
      words.forEach((w) => keywords.add(w));
    }
  }

  // Extract from # title
  const titleMatch = content.match(/^# (.+)$/m);
  if (titleMatch) {
    const words = titleMatch[1]
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
    words.forEach((w) => keywords.add(w));
  }

  // Remove common stop words
  const stopWords = new Set([
    "this",
    "that",
    "with",
    "from",
    "your",
    "when",
    "what",
    "have",
    "will",
    "been",
    "they",
    "their",
    "about",
    "would",
    "could",
    "should",
    "which",
    "there",
    "where",
    "than",
    "then",
    "into",
    "also",
    "each",
    "other",
    "some",
    "more",
    "most",
    "only",
    "over",
    "such",
    "after",
    "before",
    "through",
    "between",
    "under",
    "requires",
    "using",
    "based",
  ]);

  return [...keywords].filter((k) => !stopWords.has(k));
}

const catalog = [];

const entries = readdirSync(SKILLS_DIR).filter((entry) => {
  const fullPath = join(SKILLS_DIR, entry);
  return (
    statSync(fullPath).isDirectory() &&
    entry !== "node_modules" &&
    !entry.startsWith(".")
  );
});

for (const dir of entries) {
  const skillPath = join(SKILLS_DIR, dir, "SKILL.md");
  try {
    const content = readFileSync(skillPath, "utf-8");

    // Extract frontmatter
    const nameMatch = content.match(/^name:\s*(.+)$/m);
    const descMatch = content.match(/^description:\s*(.+)$/m);

    const name = nameMatch
      ? nameMatch[1].trim()
      : dir
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

    const description = descMatch ? descMatch[1].trim() : "";
    const keywords = extractKeywords(content);

    catalog.push({
      id: dir,
      name,
      description,
      keywords,
    });
  } catch (err) {
    console.error(`Skipping ${dir}: ${err.message}`);
  }
}

catalog.sort((a, b) => a.id.localeCompare(b.id));

const outputPath = join(SKILLS_DIR, "catalog.json");
writeFileSync(outputPath, JSON.stringify(catalog, null, 2));
console.log(
  `Built catalog with ${catalog.length} skills → skills/catalog.json`
);
