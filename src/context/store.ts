/**
 * Local JSON storage in ~/.crowdlisten/ for context blocks, config, and history.
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import type { ContextBlock, ContextConfig, StoredData } from "./types.js";

const BASE_DIR = path.join(os.homedir(), ".crowdlisten");
const CONFIG_FILE = path.join(BASE_DIR, "config.json");
const DATA_FILE = path.join(BASE_DIR, "context.json");

function ensureDir(): void {
  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
  }
}

// ─── Config ──────────────────────────────────────────────────────────────────

export function loadConfig(): ContextConfig | null {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return null;
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw) as ContextConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: ContextConfig): void {
  ensureDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// ─── Context Data ────────────────────────────────────────────────────────────

function loadData(): StoredData {
  try {
    if (!fs.existsSync(DATA_FILE)) return { blocks: [], history: [] };
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as StoredData;
  } catch {
    return { blocks: [], history: [] };
  }
}

function saveData(data: StoredData): void {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getBlocks(): ContextBlock[] {
  return loadData().blocks;
}

export function addBlocks(
  blocks: ContextBlock[],
  source: string
): ContextBlock[] {
  const data = loadData();
  data.blocks.push(...blocks);
  data.history.push({
    timestamp: new Date().toISOString(),
    source,
    blockCount: blocks.length,
  });
  saveData(data);
  return data.blocks;
}

export function deleteBlock(index: number): void {
  const data = loadData();
  if (index >= 0 && index < data.blocks.length) {
    data.blocks.splice(index, 1);
    saveData(data);
  }
}

export function updateBlock(
  index: number,
  updates: Partial<ContextBlock>
): void {
  const data = loadData();
  if (index >= 0 && index < data.blocks.length) {
    data.blocks[index] = { ...data.blocks[index], ...updates };
    saveData(data);
  }
}

export function clearBlocks(): void {
  const data = loadData();
  data.blocks = [];
  saveData(data);
}

export function getHistory(): StoredData["history"] {
  return loadData().history;
}
