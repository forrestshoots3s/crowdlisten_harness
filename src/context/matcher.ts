/**
 * Skill matching: cosine similarity on keyword overlap + TF-IDF-like scoring
 * against both native and community skill catalogs.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import type {
  ContextBlock,
  SkillMatch,
  SkillCatalogEntry,
  ExtendedSkillCatalogEntry,
  ExtendedSkillMatch,
  SkillTier,
  SkillCategory,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let nativeCatalogCache: ExtendedSkillCatalogEntry[] | null = null;
let communityCatalogCache: ExtendedSkillCatalogEntry[] | null = null;

function loadJsonFile<T>(candidates: string[]): T | null {
  for (const p of candidates) {
    try {
      const raw = fs.readFileSync(p, "utf-8");
      return JSON.parse(raw) as T;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Load native CrowdListen skills and wrap them as ExtendedSkillCatalogEntry.
 */
function loadNativeCatalog(): ExtendedSkillCatalogEntry[] {
  if (nativeCatalogCache) return nativeCatalogCache;

  const raw = loadJsonFile<SkillCatalogEntry[]>([
    path.join(__dirname, "..", "..", "skills", "catalog.json"),
    path.join(__dirname, "..", "..", "dist", "skills", "catalog.json"),
  ]);

  if (!raw) {
    nativeCatalogCache = [];
    return [];
  }

  nativeCatalogCache = raw.map((entry) => ({
    ...entry,
    tier: "crowdlisten" as SkillTier,
    category: "research" as SkillCategory, // CrowdListen skills are research/audience intel
    installMethod: "copy" as const,
    installTarget: `crowdlisten:${entry.id}`,
    source: "crowdlisten/native",
  }));

  return nativeCatalogCache;
}

/**
 * Load community skill catalog.
 */
function loadCommunityCatalog(): ExtendedSkillCatalogEntry[] {
  if (communityCatalogCache) return communityCatalogCache;

  const raw = loadJsonFile<ExtendedSkillCatalogEntry[]>([
    path.join(__dirname, "..", "..", "skills", "community-catalog.json"),
    path.join(__dirname, "..", "..", "dist", "skills", "community-catalog.json"),
  ]);

  communityCatalogCache = raw || [];
  return communityCatalogCache;
}

/**
 * Load both catalogs combined. Exported for install lookups.
 */
export function getFullCatalog(): ExtendedSkillCatalogEntry[] {
  return loadFullCatalog();
}

function loadFullCatalog(): ExtendedSkillCatalogEntry[] {
  return [...loadNativeCatalog(), ...loadCommunityCatalog()];
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
 * Detect dominant category from block keywords.
 */
const CATEGORY_KEYWORD_MAP: Record<SkillCategory, string[]> = {
  development: ["code", "debug", "refactor", "typescript", "javascript", "react", "component", "testing", "git", "api", "function", "class"],
  data: ["data", "database", "sql", "analytics", "machine", "learning", "model", "statistics", "visualization", "pipeline"],
  content: ["content", "writing", "blog", "seo", "copy", "editorial", "article", "social", "media"],
  research: ["research", "analysis", "market", "competitive", "audience", "insights", "trends"],
  automation: ["deploy", "docker", "kubernetes", "cicd", "pipeline", "terraform", "cloud", "monitoring", "automation"],
  design: ["design", "ui", "ux", "accessibility", "css", "layout", "responsive", "figma"],
  business: ["strategy", "pricing", "marketing", "sales", "growth", "funnel", "acquisition", "revenue"],
  productivity: ["workflow", "documentation", "onboarding", "planning", "template", "organization"],
};

function categoryAffinity(blockKeywords: string[], category: SkillCategory): number {
  const categoryKws = CATEGORY_KEYWORD_MAP[category] || [];
  const blockSet = new Set(blockKeywords);
  let matches = 0;
  for (const kw of categoryKws) {
    for (const bk of blockSet) {
      if (bk.includes(kw) || kw.includes(bk)) {
        matches++;
        break;
      }
    }
  }
  return categoryKws.length > 0 ? matches / categoryKws.length : 0;
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
 * Match context blocks against the skill catalog (backward-compatible).
 * Returns top matching skills sorted by score.
 */
export async function matchSkills(
  blocks: ContextBlock[],
  topN: number = 5
): Promise<SkillMatch[]> {
  const results = await discoverSkills(blocks, { limit: topN });
  // Return as SkillMatch for backward compatibility
  return results.map(({ tier, category, installMethod, installTarget, ...rest }) => rest);
}

/**
 * Enhanced skill discovery with tier boost and category affinity.
 * Scores against BOTH native and community catalogs.
 */
export async function discoverSkills(
  blocks: ContextBlock[],
  options: { category?: SkillCategory; tier?: SkillTier; limit?: number } = {}
): Promise<ExtendedSkillMatch[]> {
  let catalog = loadFullCatalog();
  if (catalog.length === 0 || blocks.length === 0) return [];

  // Apply filters
  if (options.tier) catalog = catalog.filter((s) => s.tier === options.tier);
  if (options.category) catalog = catalog.filter((s) => s.category === options.category);

  const blockKeywords = extractBlockKeywords(blocks);
  const results: ExtendedSkillMatch[] = [];

  for (const skill of catalog) {
    const { score: baseScore, matchedKeywords } = keywordOverlapScore(
      blockKeywords,
      skill.keywords
    );

    // Tier boost: native skills get a slight advantage
    const tierBoost = skill.tier === "crowdlisten" ? 0.10 : 0;

    // Category affinity: bonus when context keywords cluster matches skill category
    const catBoost = categoryAffinity(blockKeywords, skill.category) * 0.05;

    const finalScore = Math.min(baseScore + tierBoost + catBoost, 1);

    if (finalScore > 0.05) {
      results.push({
        skillId: skill.id,
        name: skill.name,
        description: skill.description,
        score: Math.round(finalScore * 100) / 100,
        matchedKeywords,
        tier: skill.tier,
        category: skill.category,
        installMethod: skill.installMethod,
        installTarget: skill.installTarget,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, options.limit || 10);
}

/**
 * Full-text search across both skill catalogs.
 */
export function searchSkills(
  query: string,
  options: { tier?: SkillTier; category?: SkillCategory } = {}
): ExtendedSkillMatch[] {
  let catalog = loadFullCatalog();

  if (options.tier) catalog = catalog.filter((s) => s.tier === options.tier);
  if (options.category) catalog = catalog.filter((s) => s.category === options.category);

  const q = query.toLowerCase();
  const results: ExtendedSkillMatch[] = [];

  for (const skill of catalog) {
    const haystack = `${skill.name} ${skill.description} ${skill.keywords.join(" ")}`.toLowerCase();
    if (!haystack.includes(q)) continue;

    // Simple relevance: how early the query appears + name match bonus
    const nameMatch = skill.name.toLowerCase().includes(q) ? 0.3 : 0;
    const descMatch = skill.description.toLowerCase().includes(q) ? 0.15 : 0;
    const kwMatch = skill.keywords.some((kw) => kw.includes(q)) ? 0.1 : 0;
    const score = Math.min(nameMatch + descMatch + kwMatch + 0.2, 1);

    results.push({
      skillId: skill.id,
      name: skill.name,
      description: skill.description,
      score: Math.round(score * 100) / 100,
      matchedKeywords: skill.keywords.filter((kw) => kw.includes(q)),
      tier: skill.tier,
      category: skill.category,
      installMethod: skill.installMethod,
      installTarget: skill.installTarget,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Get category summary with counts.
 */
export function getSkillCategories(): Array<{ category: SkillCategory; count: number; nativeCount: number; communityCount: number }> {
  const catalog = loadFullCatalog();
  const cats: Record<string, { total: number; native: number; community: number }> = {};

  for (const skill of catalog) {
    if (!cats[skill.category]) cats[skill.category] = { total: 0, native: 0, community: 0 };
    cats[skill.category].total++;
    if (skill.tier === "crowdlisten") cats[skill.category].native++;
    else cats[skill.category].community++;
  }

  return Object.entries(cats)
    .map(([category, { total, native, community }]) => ({
      category: category as SkillCategory,
      count: total,
      nativeCount: native,
      communityCount: community,
    }))
    .sort((a, b) => b.count - a.count);
}
