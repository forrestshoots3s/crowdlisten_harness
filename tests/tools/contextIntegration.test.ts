import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { handleTool } from "../../src/tools.js";
import { createSb } from "../helpers/supabaseMock.js";
import {
  TEST_USER_ID,
  TEST_PROJECT_ID,
  TEST_BOARD_ID,
  TEST_TASK_ID,
  TEST_CONTEXT_ID,
  TEST_LEARNING_ID,
} from "../helpers/fixtures.js";

const TEST_INSIGHT_ID = "insight-0000-0000-0000-000000000001";

describe("add_context → project_insights dual-write", () => {
  let sb: ReturnType<typeof createSb>["sb"];
  let pushResult: ReturnType<typeof createSb>["pushResult"];
  let calls: ReturnType<typeof createSb>["calls"];

  const originalEnv = { ...process.env };

  beforeEach(() => {
    const mock = createSb();
    sb = mock.sb;
    pushResult = mock.pushResult;
    calls = mock.calls;
    delete process.env.CLAUDE_CODE;
    delete process.env.CLAUDE_SESSION_ID;
  });

  afterEach(() => {
    Object.assign(process.env, originalEnv);
  });

  it("mirrors decision to project_insights when project_id is present", async () => {
    // planning_context insert
    pushResult("planning_context", "select", { id: TEST_CONTEXT_ID, status: "active" });
    // project_insights insert (dual-write)
    pushResult("project_insights", "insert", { id: TEST_INSIGHT_ID });

    const result = await handleTool(sb as any, TEST_USER_ID, "add_context", {
      type: "decision",
      title: "Use PostgreSQL",
      body: "Chose PostgreSQL for relational data needs",
      project_id: TEST_PROJECT_ID,
    });
    const parsed = JSON.parse(result);

    expect(parsed.context_id).toBe(TEST_CONTEXT_ID);

    // Verify project_insights was called
    const insightCalls = calls.filter(c => c.table === "project_insights");
    expect(insightCalls.length).toBeGreaterThan(0);
  });

  it("does NOT mirror to project_insights without project_id", async () => {
    pushResult("planning_context", "select", { id: TEST_CONTEXT_ID, status: "active" });

    await handleTool(sb as any, TEST_USER_ID, "add_context", {
      type: "decision",
      title: "Use PostgreSQL",
      body: "Chose PostgreSQL for relational data needs",
    });

    const insightCalls = calls.filter(c => c.table === "project_insights");
    expect(insightCalls).toHaveLength(0);
  });

  it("does NOT mirror constraint type to project_insights", async () => {
    pushResult("planning_context", "select", { id: TEST_CONTEXT_ID, status: "active" });

    await handleTool(sb as any, TEST_USER_ID, "add_context", {
      type: "constraint",
      title: "Budget limit",
      body: "Must stay under $500/mo",
      project_id: TEST_PROJECT_ID,
    });

    const insightCalls = calls.filter(c => c.table === "project_insights");
    expect(insightCalls).toHaveLength(0);
  });

  it("mirrors all knowledge types (pattern, preference, learning, principle)", async () => {
    for (const type of ["pattern", "preference", "learning", "principle"]) {
      const mock = createSb();
      mock.pushResult("planning_context", "select", { id: TEST_CONTEXT_ID, status: "active" });
      mock.pushResult("project_insights", "insert", { id: TEST_INSIGHT_ID });

      await handleTool(mock.sb as any, TEST_USER_ID, "add_context", {
        type,
        title: `Test ${type}`,
        body: `Body for ${type}`,
        project_id: TEST_PROJECT_ID,
      });

      const insightCalls = mock.calls.filter(c => c.table === "project_insights");
      expect(insightCalls.length, `Expected ${type} to mirror`).toBeGreaterThan(0);
    }
  });
});

describe("record_learning → project_insights dual-write", () => {
  let sb: ReturnType<typeof createSb>["sb"];
  let pushResult: ReturnType<typeof createSb>["pushResult"];
  let calls: ReturnType<typeof createSb>["calls"];

  const originalEnv = { ...process.env };

  beforeEach(() => {
    const mock = createSb();
    sb = mock.sb;
    pushResult = mock.pushResult;
    calls = mock.calls;
    delete process.env.CLAUDE_CODE;
    delete process.env.CLAUDE_SESSION_ID;
  });

  afterEach(() => {
    Object.assign(process.env, originalEnv);
  });

  it("mirrors learning to project_insights when project resolves", async () => {
    // card → board → project lookup
    pushResult("kanban_cards", "select", { board_id: TEST_BOARD_ID });
    pushResult("kanban_boards", "select", { project_id: TEST_PROJECT_ID });
    // planning_context insert
    pushResult("planning_context", "select", { id: TEST_LEARNING_ID });
    // project_insights dual-write
    pushResult("project_insights", "insert", { id: TEST_INSIGHT_ID });

    const result = await handleTool(sb as any, TEST_USER_ID, "record_learning", {
      task_id: TEST_TASK_ID,
      title: "Redis improved latency",
      body: "Cache layer reduced p95 from 800ms to 480ms",
    });
    const parsed = JSON.parse(result);

    expect(parsed.learning_id).toBe(TEST_LEARNING_ID);
    const insightCalls = calls.filter(c => c.table === "project_insights");
    expect(insightCalls.length).toBeGreaterThan(0);
  });

  it("skips project_insights when no project found", async () => {
    pushResult("kanban_cards", "select", null);
    pushResult("planning_context", "select", { id: TEST_LEARNING_ID });

    await handleTool(sb as any, TEST_USER_ID, "record_learning", {
      task_id: TEST_TASK_ID,
      title: "Simple learning",
      body: "No project context",
    });

    const insightCalls = calls.filter(c => c.table === "project_insights");
    expect(insightCalls).toHaveLength(0);
  });
});

describe("remember → Supabase context_blocks", () => {
  let sb: ReturnType<typeof createSb>["sb"];
  let pushResult: ReturnType<typeof createSb>["pushResult"];
  let calls: ReturnType<typeof createSb>["calls"];

  beforeEach(() => {
    const mock = createSb();
    sb = mock.sb;
    pushResult = mock.pushResult;
    calls = mock.calls;
  });

  it("writes to context_blocks in Supabase", async () => {
    pushResult("context_blocks", "insert", { id: "block-001" });

    const result = await handleTool(sb as any, TEST_USER_ID, "remember", {
      type: "pattern",
      title: "Always use UTC timestamps",
      content: "Store all dates as UTC to avoid timezone bugs",
    });
    const parsed = JSON.parse(result);

    expect(parsed.saved).toBe(true);
    expect(parsed.supabase).toBe(true);

    const blockCalls = calls.filter(c => c.table === "context_blocks");
    expect(blockCalls.length).toBeGreaterThan(0);
  });

  it("supports optional project_id", async () => {
    pushResult("context_blocks", "insert", { id: "block-002" });

    const result = await handleTool(sb as any, TEST_USER_ID, "remember", {
      type: "preference",
      title: "Use dark mode",
      content: "User prefers dark mode for all UIs",
      project_id: TEST_PROJECT_ID,
    });
    const parsed = JSON.parse(result);

    expect(parsed.saved).toBe(true);
    expect(parsed.supabase).toBe(true);
  });

  it("falls back to local store on Supabase error", async () => {
    pushResult("context_blocks", "insert", null, { message: "RLS policy violation" });

    const result = await handleTool(sb as any, TEST_USER_ID, "remember", {
      type: "insight",
      title: "Fallback test",
      content: "Should fall back to local JSON",
    });
    const parsed = JSON.parse(result);

    expect(parsed.saved).toBe(true);
    expect(parsed.supabase).toBe(false);
  });

  it("rejects missing required params", async () => {
    const result = await handleTool(sb as any, TEST_USER_ID, "remember", {
      type: "pattern",
      title: "",
      content: "Missing title",
    });
    const parsed = JSON.parse(result);

    expect(parsed.error).toBeTruthy();
  });
});

describe("recall → Supabase context_blocks", () => {
  let sb: ReturnType<typeof createSb>["sb"];
  let pushResult: ReturnType<typeof createSb>["pushResult"];
  let calls: ReturnType<typeof createSb>["calls"];

  beforeEach(() => {
    const mock = createSb();
    sb = mock.sb;
    pushResult = mock.pushResult;
    calls = mock.calls;
  });

  it("reads from Supabase context_blocks", async () => {
    pushResult("context_blocks", "select", [
      { id: "b1", type: "pattern", title: "UTC timestamps", content: "Always use UTC" },
      { id: "b2", type: "insight", title: "Users prefer dark mode", content: "80% use dark mode" },
    ]);

    const result = await handleTool(sb as any, TEST_USER_ID, "recall", {});
    const parsed = JSON.parse(result);

    expect(parsed.source).toBe("supabase");
    expect(parsed.count).toBe(2);
    expect(parsed.blocks).toHaveLength(2);
  });

  it("filters by type", async () => {
    pushResult("context_blocks", "select", [
      { id: "b1", type: "pattern", title: "UTC timestamps", content: "Always use UTC" },
    ]);

    const result = await handleTool(sb as any, TEST_USER_ID, "recall", {
      type: "pattern",
    });
    const parsed = JSON.parse(result);

    expect(parsed.source).toBe("supabase");
    expect(parsed.blocks).toHaveLength(1);
  });

  it("filters by project_id", async () => {
    pushResult("context_blocks", "select", [
      { id: "b1", type: "pattern", title: "Project-specific", content: "Scoped block" },
    ]);

    const result = await handleTool(sb as any, TEST_USER_ID, "recall", {
      project_id: TEST_PROJECT_ID,
    });
    const parsed = JSON.parse(result);

    expect(parsed.source).toBe("supabase");
    const blockCalls = calls.filter(c => c.table === "context_blocks");
    expect(blockCalls.length).toBeGreaterThan(0);
  });

  it("falls back to local on Supabase error", async () => {
    pushResult("context_blocks", "select", null, { message: "connection error" });

    const result = await handleTool(sb as any, TEST_USER_ID, "recall", {});
    const parsed = JSON.parse(result);

    expect(parsed.source).toBe("local");
  });
});
