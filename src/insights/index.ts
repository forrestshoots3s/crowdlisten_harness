/**
 * Insights module — bridges agent-proxied tools into the progressive disclosure system.
 *
 * Re-exports from agent-tools.ts so registry.ts and index.ts can import
 * INSIGHTS_TOOLS / handleInsightsTool / cleanupInsights from a single path.
 */

import { AGENT_TOOLS, handleAgentTool } from "../agent-tools.js";

export const INSIGHTS_TOOLS = AGENT_TOOLS;

export async function handleInsightsTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  return handleAgentTool(name, args);
}

export async function cleanupInsights(): Promise<void> {
  // No persistent resources to clean up for agent-proxied tools
}
