import React from "react";

interface Props {
  onStartImport: () => void;
  disabled: boolean;
}

export default function UploadZone({ onStartImport, disabled }: Props) {
  return (
    <div
      className="glass-card flex items-center justify-between"
      style={{
        padding: "18px 24px",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "default",
      }}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className="w-9 h-9 flex items-center justify-center text-base shrink-0 mt-0.5"
          style={{
            background: "rgba(111, 164, 175, 0.12)",
            borderRadius: "var(--radius-s)",
            color: "var(--brand-teal)",
          }}
        >
          &#128196;
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm" style={{ color: "var(--cl-fg)" }}>
            Import context from your AI chats
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--cl-fg-muted)" }}>
            Extract your preferences, patterns, and decisions from ChatGPT, Claude, or other AI tools.
            We'll provide a prompt to fetch your context.{" "}
            <span style={{ color: "var(--cl-fg-muted)" }}>PII is redacted locally.</span>
          </p>
        </div>
      </div>
      <button
        onClick={onStartImport}
        disabled={disabled}
        className="btn-secondary shrink-0 ml-4"
      >
        Start Import
      </button>
    </div>
  );
}
