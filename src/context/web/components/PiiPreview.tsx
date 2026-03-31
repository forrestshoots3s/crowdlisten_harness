import React from "react";

interface Props {
  stats: Record<string, number>;
  total: number;
}

const LABELS: Record<string, string> = {
  emails: "Emails",
  phones: "Phone Numbers",
  ssns: "SSNs",
  creditCards: "Credit Cards",
  ipAddresses: "IP Addresses",
  apiKeys: "API Keys",
  genericTokens: "Tokens",
  urlCredentials: "URL Credentials",
};

export default function PiiPreview({ stats, total }: Props) {
  return (
    <div
      className="glass-card"
      style={{
        padding: "14px 18px",
        background: total > 0
          ? "rgba(184, 196, 169, 0.2)"
          : "rgba(255, 255, 255, 0.92)",
        borderColor: total > 0
          ? "var(--cl-positive-border)"
          : "var(--cl-border-light)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 flex items-center justify-center text-sm"
          style={{
            background: "var(--cl-positive-bg)",
            borderRadius: "var(--radius-s)",
            color: "var(--cl-positive-fg)",
          }}
        >
          &#128737;
        </div>
        <span className="font-semibold text-sm" style={{ color: "var(--cl-positive-fg)" }}>
          PII Redaction
        </span>
        <span className="text-sm" style={{ color: "var(--cl-fg-muted)" }}>
          {total === 0
            ? "No PII detected"
            : `${total} item${total === 1 ? "" : "s"} redacted before processing`}
        </span>
      </div>
      {total > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5 ml-9">
          {Object.entries(stats).map(([key, count]) => (
            <span key={key} className="pill pill-sage">
              {LABELS[key] || key}: {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
