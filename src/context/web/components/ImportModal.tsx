import React, { useState, useRef, useCallback } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onProcess: (text: string, source: string) => void;
  processing: boolean;
}

const EXPORT_PROMPT = `I'd like to export my preferences, patterns, and context from our conversations. Please provide a structured summary in the following JSON format:

{
  "styles": ["list of my communication/coding style preferences"],
  "insights": ["key insights or decisions we've discussed"],
  "patterns": ["recurring patterns in how I work or think"],
  "preferences": ["specific tool, framework, or workflow preferences"]
}

Be thorough — include anything you've learned about how I work, what I prefer, and decisions I've made. Focus on reusable context that would help another AI tool understand me better.`;

export default function ImportModal({ open, onClose, onProcess, processing }: Props) {
  const [step, setStep] = useState<"prompt" | "paste">("prompt");
  const [pasteText, setPasteText] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const texts: string[] = [];
      for (const file of Array.from(files)) {
        texts.push(await file.text());
      }
      const combined = texts.join("\n\n---\n\n");
      onProcess(combined, files[0]?.name || "upload");
    },
    [onProcess]
  );

  function handleCopy() {
    navigator.clipboard.writeText(EXPORT_PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSubmit() {
    if (pasteText.trim()) {
      onProcess(pasteText, "ai-import");
      setPasteText("");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-50 top-1/2 left-1/2 w-full max-w-xl"
        style={{
          transform: "translate(-50%, -50%)",
          background: "var(--cl-bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--cl-border-light)",
          boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 4px 12px -4px rgba(0, 0, 0, 0.08)",
          maxHeight: "85vh",
          overflow: "auto",
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--cl-border-light)" }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Import Context
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-sm"
            style={{
              color: "var(--cl-fg-muted)",
              borderRadius: "var(--radius-xs)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--cl-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            &#10005;
          </button>
        </div>

        {/* Step tabs */}
        <div
          className="flex px-6 pt-4 gap-1"
        >
          <button
            onClick={() => setStep("prompt")}
            className="px-4 py-2 text-sm font-medium"
            style={{
              borderRadius: "var(--radius-s) var(--radius-s) 0 0",
              background: step === "prompt" ? "rgba(111, 164, 175, 0.1)" : "transparent",
              color: step === "prompt" ? "var(--brand-teal)" : "var(--cl-fg-muted)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            1. Copy Prompt
          </button>
          <button
            onClick={() => setStep("paste")}
            className="px-4 py-2 text-sm font-medium"
            style={{
              borderRadius: "var(--radius-s) var(--radius-s) 0 0",
              background: step === "paste" ? "rgba(111, 164, 175, 0.1)" : "transparent",
              color: step === "paste" ? "var(--brand-teal)" : "var(--cl-fg-muted)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            2. Paste Response
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {step === "prompt" ? (
            <div className="space-y-4 pt-4">
              <p className="text-sm" style={{ color: "var(--cl-fg-muted)" }}>
                Copy this prompt and paste it into your AI chat tool (ChatGPT, Claude, Gemini, etc.)
                to extract your preferences and context.
              </p>

              {/* Prompt box */}
              <div
                className="relative"
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid var(--cl-border-light)",
                  borderRadius: "var(--radius-m)",
                  padding: "14px 16px",
                }}
              >
                <pre
                  className="text-sm whitespace-pre-wrap leading-relaxed"
                  style={{
                    color: "var(--cl-fg)",
                    fontFamily: "'Inter', system-ui, sans-serif",
                    margin: 0,
                  }}
                >
                  {EXPORT_PROMPT}
                </pre>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleCopy} className="btn-primary">
                  {copied ? "\u2713 Copied" : "Copy Prompt"}
                </button>
                <button
                  onClick={() => setStep("paste")}
                  className="btn-secondary"
                >
                  Next: Paste Response &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <p className="text-sm" style={{ color: "var(--cl-fg-muted)" }}>
                Paste the response from your AI tool, or upload a chat export file.
                PII will be redacted locally before any processing.
              </p>

              {/* Paste area */}
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste the AI's response here..."
                className="input-field"
                style={{
                  height: "140px",
                  resize: "vertical",
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
                disabled={processing}
              />

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1" style={{ height: "1px", background: "var(--cl-border-light)" }} />
                <span className="text-xs" style={{ color: "var(--cl-fg-muted)" }}>or</span>
                <div className="flex-1" style={{ height: "1px", background: "var(--cl-border-light)" }} />
              </div>

              {/* File drop */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: "var(--radius-m)",
                  border: `2px dashed ${dragOver ? "var(--brand-teal)" : "var(--cl-border-light)"}`,
                  background: dragOver ? "rgba(111, 164, 175, 0.06)" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".json,.zip,.txt,.md,.pdf"
                  multiple
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
                <p className="text-sm font-medium" style={{ color: "var(--cl-fg-muted)" }}>
                  Drop chat export or click to browse
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--cl-border)" }}>
                  .json (ChatGPT/Claude) &middot; .zip &middot; .txt &middot; .md &middot; .pdf
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setStep("prompt")}
                  className="btn-secondary"
                >
                  &larr; Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={processing || !pasteText.trim()}
                  className="btn-primary"
                >
                  {processing ? "Processing..." : "Extract Context"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
