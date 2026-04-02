import React, { useState } from "react";

interface Props {
  onSaved: () => void;
}

export default function ConfigPanel({ onSaved }: Props) {
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const body: Record<string, string> = { provider, apiKey };
      if (model) body.model = model;

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save config");
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glass-card" style={{ padding: "20px 24px" }}>
      <h2
        className="font-semibold text-base mb-1"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        LLM Provider Configuration
      </h2>
      <p className="text-sm mb-4" style={{ color: "var(--cl-fg-muted)" }}>
        Your API key is stored locally in ~/.crowdlisten/config.json. It never
        leaves your machine except to call your chosen LLM provider.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            className="text-sm font-medium block mb-1.5"
            style={{ color: "var(--cl-fg)" }}
          >
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="select-field"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>

        <div>
          <label
            className="text-sm font-medium block mb-1.5"
            style={{ color: "var(--cl-fg)" }}
          >
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={provider === "openai" ? "sk-..." : "sk-ant-..."}
            className="input-field"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">
            Model{" "}
            <span style={{ color: "var(--cl-fg-muted)", fontWeight: 400 }}>
              (optional)
            </span>
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="select-field"
          >
            <option value="">Default</option>
            {provider === "openai" && (
              <>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="o3-mini">o3-mini</option>
              </>
            )}
            {provider === "anthropic" && (
              <>
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
                <option value="claude-opus-4-6">Claude Opus 4.6</option>
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
              </>
            )}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm mt-3" style={{ color: "var(--cl-negative-fg)" }}>
          {error}
        </p>
      )}

      <div className="mt-4">
        <button
          onClick={handleSave}
          disabled={saving || !apiKey}
          className="btn-primary"
        >
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
