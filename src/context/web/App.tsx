import React, { useState, useEffect } from "react";
import UploadZone from "./components/UploadZone";
import PiiPreview from "./components/PiiPreview";
import BlockList from "./components/BlockList";
import SkillPanel from "./components/SkillPanel";
import ConfigPanel from "./components/ConfigPanel";
import SyncButton from "./components/SyncButton";

interface PipelineResult {
  blocks: Array<{
    type: string;
    title: string;
    content: string;
    source?: string;
  }>;
  skills: Array<{
    skillId: string;
    name: string;
    description: string;
    score: number;
    matchedKeywords: string[];
  }>;
  redactionStats: Record<string, number>;
  totalRedactions: number;
  chunkCount: number;
}

interface ConfigStatus {
  configured: boolean;
  provider?: string;
  model?: string;
}

export default function App() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfigStatus)
      .catch(() => setConfigStatus({ configured: false }));
  }, []);

  async function handleProcess(text: string, source: string) {
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data: PipelineResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setProcessing(false);
    }
  }

  function handleDeleteBlock(index: number) {
    fetch(`/api/blocks/${index}`, { method: "DELETE" });
    if (result) {
      const blocks = [...result.blocks];
      blocks.splice(index, 1);
      setResult({ ...result, blocks });
    }
  }

  function handleConfigSaved() {
    setShowConfig(false);
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfigStatus);
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--cl-bg)", color: "var(--cl-fg)" }}>
      {/* Header */}
      <header className="glass-header px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 flex items-center justify-center text-white font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, var(--brand-teal), var(--brand-coral))",
                borderRadius: "var(--radius-s)",
              }}
            >
              C
            </div>
            <h1
              className="text-xl font-semibold"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              CrowdListen Context
            </h1>
          </div>
          {configStatus?.configured && (
            <span className="pill pill-teal">
              {configStatus.provider} &middot; {configStatus.model}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="btn-secondary"
          >
            {configStatus?.configured ? "Settings" : "Configure LLM"}
          </button>
          <SyncButton blocks={result?.blocks || []} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Config panel (collapsible) */}
        {(showConfig || !configStatus?.configured) && (
          <ConfigPanel onSaved={handleConfigSaved} />
        )}

        {/* Upload zone */}
        <UploadZone
          onProcess={handleProcess}
          processing={processing}
          disabled={!configStatus?.configured}
        />

        {/* Error */}
        {error && (
          <div
            className="px-4 py-3"
            style={{
              background: "var(--cl-negative-bg)",
              border: "1px solid hsl(0, 86%, 80%)",
              borderRadius: "var(--radius-m)",
              color: "var(--cl-negative-fg)",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <PiiPreview
              stats={result.redactionStats}
              total={result.totalRedactions}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BlockList
                  blocks={result.blocks}
                  onDelete={handleDeleteBlock}
                />
              </div>
              <div>
                <SkillPanel skills={result.skills} />
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && configStatus?.configured && !showConfig && (
          <div className="text-center py-16" style={{ color: "var(--cl-fg-muted)" }}>
            <p className="text-sm">
              Upload a chat export to extract context blocks and skill recommendations.
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--cl-border)" }}>
              PII is redacted locally before any LLM call.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="text-center py-6 mt-12 text-xs"
        style={{ color: "var(--cl-fg-muted)" }}
      >
        CrowdListen Context &middot; All processing happens locally &middot;{" "}
        <a
          href="https://crowdlisten.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: "var(--brand-teal)" }}
        >
          crowdlisten.com
        </a>
      </footer>
    </div>
  );
}
