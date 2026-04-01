#!/usr/bin/env node

/**
 * Build skills/community-catalog.json by fetching + parsing SKILL.md files
 * from community GitHub repos.
 *
 * Usage: node scripts/build-community-catalog.js
 *
 * This script:
 * 1. Clones/fetches 4 community repos to a temp directory
 * 2. Parses SKILL.md files (YAML frontmatter + content)
 * 3. Deduplicates by name similarity
 * 4. Auto-categorizes by keyword analysis
 * 5. Generates skills/community-catalog.json
 *
 * Note: The initial community-catalog.json was hand-curated from research.
 * This script can be used for future refreshes.
 */

import { execSync } from "child_process";
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "..", "skills", "community-catalog.json");

const REPOS = [
  { url: "https://github.com/ComposioHQ/awesome-claude-skills.git", source: "ComposioHQ/awesome-claude-skills", author: "ComposioHQ" },
  { url: "https://github.com/mattpocock/skills.git", source: "mattpocock/skills", author: "Matt Pocock" },
  { url: "https://github.com/alirezarezvani/claude-skills.git", source: "alirezarezvani/claude-skills", author: "Alireza Rezvani" },
];

// Category detection by keyword presence
const CATEGORY_KEYWORDS = {
  development: ["code", "debug", "refactor", "frontend", "backend", "fullstack", "testing", "review", "git", "typescript", "api", "cli"],
  data: ["data", "database", "sql", "ml", "machine-learning", "analytics", "visualization", "embeddings", "rag", "statistics"],
  content: ["content", "seo", "writing", "copywriting", "blog", "editorial", "schema-markup"],
  research: ["research", "investigation", "discovery", "academic"],
  automation: ["automation", "ci", "cd", "devops", "docker", "terraform", "kubernetes", "monitoring", "deployment", "cloud"],
  design: ["design", "ui", "ux", "accessibility", "figma", "css", "tailwind", "responsive"],
  business: ["marketing", "pricing", "strategy", "sales", "growth", "ads", "funnel", "competitive"],
  productivity: ["documentation", "onboarding", "workflow", "planning", "interview", "workspace"],
};

const STOP_WORDS = new Set([
  "this", "that", "with", "from", "your", "when", "what", "have", "will", "been",
  "they", "their", "about", "would", "could", "should", "which", "there", "where",
  "than", "then", "into", "also", "each", "other", "some", "more", "most", "only",
  "over", "such", "after", "before", "through", "between", "under", "requires", "using", "based",
]);

function detectCategory(name, description, keywords) {
  const text = `${name} ${description} ${keywords.join(" ")}`.toLowerCase();
  const scores = {};
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = kws.filter((kw) => text.includes(kw)).length;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > 0 ? sorted[0][0] : "development";
}

function extractKeywords(content) {
  const keywords = new Set();
  const descMatch = content.match(/^description:\s*(.+)$/m);
  if (descMatch) {
    descMatch[1].toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((w) => w.length > 3).forEach((w) => keywords.add(w));
  }
  const whenMatch = content.match(/## When to Use[\s\S]*?(?=\n## |\n---|\n$)/);
  if (whenMatch) {
    const bullets = whenMatch[0].match(/^- .+$/gm) || [];
    for (const b of bullets) {
      b.replace(/^- /, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((w) => w.length > 3).forEach((w) => keywords.add(w));
    }
  }
  const titleMatch = content.match(/^# (.+)$/m);
  if (titleMatch) {
    titleMatch[1].toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((w) => w.length > 2).forEach((w) => keywords.add(w));
  }
  return [...keywords].filter((k) => !STOP_WORDS.has(k));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

// Levenshtein distance for dedup
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function isDuplicate(name, existing) {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const e of existing) {
    const eNorm = e.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (norm === eNorm) return true;
    if (levenshtein(norm, eNorm) <= 2 && Math.max(norm.length, eNorm.length) > 5) return true;
  }
  return false;
}

async function main() {
  const tmpDir = join(tmpdir(), "crowdlisten-community-skills-" + Date.now());
  mkdirSync(tmpDir, { recursive: true });
  console.log(`Working in ${tmpDir}`);

  const catalog = [];

  for (const repo of REPOS) {
    const repoDir = join(tmpDir, slugify(repo.source));
    console.log(`\nCloning ${repo.source}...`);
    try {
      execSync(`git clone --depth 1 ${repo.url} "${repoDir}"`, { stdio: "pipe" });
    } catch (err) {
      console.error(`  Failed to clone ${repo.source}: ${err.message}`);
      continue;
    }

    // Walk directory for SKILL.md files
    function walk(dir) {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        if (entry === "node_modules" || entry === ".git" || entry.startsWith(".")) continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          const skillPath = join(full, "SKILL.md");
          if (existsSync(skillPath)) {
            try {
              const content = readFileSync(skillPath, "utf-8");
              const nameMatch = content.match(/^name:\s*(.+)$/m);
              const descMatch = content.match(/^description:\s*(.+)$/m);
              const name = nameMatch ? nameMatch[1].trim() : entry.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
              const description = descMatch ? descMatch[1].trim() : "";
              const keywords = extractKeywords(content);

              if (!isDuplicate(name, catalog)) {
                const id = "comm-" + slugify(entry);
                const category = detectCategory(name, description, keywords);
                const rawUrl = `https://raw.githubusercontent.com/${repo.source}/main/${full.slice(repoDir.length + 1)}/SKILL.md`.replace(/ /g, "%20");
                catalog.push({ id, name, description, keywords, tier: "community", category, installMethod: "copy", installTarget: rawUrl, source: repo.source, author: repo.author });
              }
            } catch (err) {
              console.error(`  Skipping ${entry}: ${err.message}`);
            }
          }
          walk(full);
        }
      }
    }

    walk(repoDir);
    console.log(`  Found ${catalog.length} skills so far`);
  }

  catalog.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(OUTPUT, JSON.stringify(catalog, null, 2));
  console.log(`\nWrote ${catalog.length} community skills → skills/community-catalog.json`);

  // Cleanup
  rmSync(tmpDir, { recursive: true, force: true });
}

main().catch(console.error);
