/**
 * Context extraction pipeline — barrel export.
 */

export { redactPII } from "./redactor.js";
export { parseFile, parseTextContent, parseZipBuffer, chunkText } from "./parser.js";
export { extractBlocks } from "./extractor.js";
export { matchSkills, discoverSkills, searchSkills, getSkillCategories, getFullCatalog } from "./matcher.js";
export { createProvider } from "./providers.js";
export { runPipeline } from "./pipeline.js";
export type { PipelineOpts } from "./pipeline.js";
export * from "./store.js";
export * from "./types.js";
