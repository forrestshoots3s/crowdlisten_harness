/**
 * OpenAPI 3.0 Spec Generator — auto-generates from MCP tool definitions
 *
 * Each MCP tool becomes a POST /tools/{name} endpoint.
 * Tags group tools by their pack prefix (e.g., [Analysis], [Content]).
 */

import { TOOLS } from "./tools.js";
import { SERVER_NAME, SERVER_VERSION } from "./server-factory.js";

interface OpenApiSpec {
  openapi: string;
  info: { title: string; version: string; description: string };
  servers: { url: string; description: string }[];
  paths: Record<string, unknown>;
  components: { securitySchemes: Record<string, unknown> };
  tags: { name: string; description: string }[];
  security: Record<string, string[]>[];
}

// Extract pack tag from tool description, e.g. "[Analysis] ..." → "analysis"
function extractTag(description: string): string {
  const match = description.match(/^\[([^\]]+)\]/);
  if (match) return match[1].toLowerCase();

  // Infer from description keywords
  if (description.includes("[Setup]")) return "setup";
  if (description.includes("[Advanced]")) return "sessions";
  if (description.includes("[Context]")) return "context";

  // Default categorization
  return "planning";
}

function tagDisplayName(tag: string): string {
  const names: Record<string, string> = {
    analysis: "Analysis",
    content: "Content & Vectors",
    generation: "Document Generation",
    llm: "LLM Proxy",
    "agent network": "Agent Network",
    setup: "Setup",
    sessions: "Multi-Agent Sessions",
    context: "Context Extraction",
    planning: "Planning & Tasks",
  };
  return names[tag] || tag.charAt(0).toUpperCase() + tag.slice(1);
}

function tagDescription(tag: string): string {
  const descriptions: Record<string, string> = {
    analysis:
      "Run audience analyses, extract themes and sentiment from social platforms",
    content:
      "Ingest content, semantic vector search, manage content documents",
    generation: "Generate PRDs and product documentation from analysis results",
    llm: "LLM completion proxy",
    "agent network":
      "Register agents, discover capabilities, share analysis results",
    setup: "Board and project management, initial configuration",
    sessions: "Multi-agent parallel session coordination",
    context:
      "Extract reusable context blocks from chat transcripts with PII redaction",
    planning: "Task management, execution planning, knowledge base",
  };
  return descriptions[tag] || "";
}

export function generateOpenApiSpec(): OpenApiSpec {
  const paths: Record<string, unknown> = {};
  const tagSet = new Set<string>();

  for (const tool of TOOLS) {
    const tag = extractTag(tool.description);
    tagSet.add(tag);

    // Strip the [Pack] prefix from description for cleaner OpenAPI docs
    const cleanDescription = tool.description.replace(/^\[[^\]]+\]\s*/, "");

    const requestBody: Record<string, unknown> = {};
    const schema = tool.inputSchema;
    const hasProperties =
      schema.properties && Object.keys(schema.properties).length > 0;

    if (hasProperties) {
      requestBody.required = true;
      requestBody.content = {
        "application/json": {
          schema: {
            type: "object",
            properties: schema.properties,
            ...("required" in schema ? { required: schema.required } : {}),
          },
        },
      };
    }

    paths[`/tools/${tool.name}`] = {
      post: {
        operationId: tool.name,
        summary: cleanDescription.split(".")[0] + ".",
        description: cleanDescription,
        tags: [tagDisplayName(tag)],
        ...(hasProperties ? { requestBody } : {}),
        responses: {
          "200": {
            description: "Tool result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    content: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string", example: "text" },
                          text: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Authentication required" },
          "500": { description: "Tool execution error" },
        },
      },
    };
  }

  // Health endpoint
  paths["/health"] = {
    get: {
      operationId: "health_check",
      summary: "Health check",
      tags: ["System"],
      responses: {
        "200": {
          description: "Server is healthy",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "ok" },
                  version: { type: "string", example: SERVER_VERSION },
                  tools: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
  };

  const tags = [...tagSet].map((t) => ({
    name: tagDisplayName(t),
    description: tagDescription(t),
  }));
  tags.push({ name: "System", description: "Health and metadata endpoints" });

  return {
    openapi: "3.0.3",
    info: {
      title: "CrowdListen Harness API",
      version: SERVER_VERSION,
      description:
        "Audience intelligence, social listening, planning, and context extraction for AI agents. " +
        "This API exposes the full CrowdListen tool surface as REST endpoints. " +
        "Sign in with `npx @crowdlisten/harness login` to get started.",
    },
    servers: [
      { url: "https://mcp.crowdlisten.com", description: "Production" },
      { url: "http://localhost:3848", description: "Local development" },
    ],
    paths,
    components: {
      securitySchemes: {
        apiKey: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description:
            'Bearer token: CROWDLISTEN_API_KEY or Supabase JWT. Format: "Bearer <key>"',
        },
      },
    },
    tags,
    security: [{ apiKey: [] }],
  };
}
