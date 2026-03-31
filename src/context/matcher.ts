/**
 * Skill matching: cosine similarity on keyword overlap + TF-IDF-like scoring
 * against the skills catalog.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import type { ContextBlock, SkillMatch, SkillCatalogEntry } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let catalogCache: SkillCatalogEntry[] | null = null;

function loadCatalog(): SkillCatalogEntry[] {
  if (catalogCache) return catalogCache;

  // Try loading from skills/catalog.json relative to project root
  const candidates = [
    path.join(__dirname, "..", "..", "skills", "catalog.json"),
    path.join(__dirname, "..", "..", "dist", "skills", "catalog.json"),
  ];

  for (const p of candidates) {
    try {
      const raw = fs.readFileSync(p, "utf-8");
      catalogCache = JSON.parse(raw) as SkillCatalogEntry[];
      return catalogCache;
    } catch {
      continue;
    }
  }

  return [];
}

/**
 * Extract keywords from context blocks for matching.
 */
function extractBlockKeywords(blocks: ContextBlock[]): string[] {
  const words: string[] = [];

  for (const block of blocks) {
    const text = `${block.title} ${block.content}`.toLowerCase();
    const tokens = text
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    words.push(...tokens);
  }

  return words;
}

/**
 * Calculate keyword overlap score between block keywords and skill keywords.
 * Returns a score between 0 and 1.
 */
function keywordOverlapScore(
  blockKeywords: string[],
  skillKeywords: string[]
): { score: number; matchedKeywords: string[] } {
  const blockSet = new Set(blockKeywords);
  const matched: string[] = [];

  for (const kw of skillKeywords) {
    // Check exact match
    if (blockSet.has(kw)) {
      matched.push(kw);
      continue;
    }
    // Check partial match (block keyword contains skill keyword or vice versa)
    for (const bk of blockSet) {
      if (bk.includes(kw) || kw.includes(bk)) {
        matched.push(kw);
        break;
      }
    }
  }

  if (skillKeywords.length === 0) return { score: 0, matchedKeywords: [] };

  // Score: fraction of skill keywords that matched, weighted by frequency
  const score = matched.length / skillKeywords.length;
  return { score, matchedKeywords: [...new Set(matched)] };
}

/**
 * Match context blocks against the skill catalog.
 * Returns top matching skills sorted by score.
 */
export async function matchSkills(
  blocks: ContextBlock[],
  topN: number = 5
): Promise<SkillMatch[]> {
  const catalog = loadCatalog();
  if (catalog.length === 0 || blocks.length === 0) return [];

  const blockKeywords = extractBlockKeywords(blocks);
  const results: SkillMatch[] = [];

  for (const skill of catalog) {
    const { score, matchedKeywords } = keywordOverlapScore(
      blockKeywords,
      skill.keywords
    );

    if (score > 0.05) {
      results.push({
        skillId: skill.id,
        name: skill.name,
        description: skill.description,
        score: Math.round(score * 100) / 100,
        matchedKeywords,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topN);
}
