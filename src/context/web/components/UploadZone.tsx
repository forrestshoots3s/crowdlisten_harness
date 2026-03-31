import React, { useState, useRef, useCallback } from "react";

interface Props {
  onProcess: (text: string, source: string) => void;
  processing: boolean;
  disabled: boolean;
}

export default function UploadZone({ onProcess, processing, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [pasteText, setPasteText] = useState("");
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

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handlePaste() {
    if (pasteText.trim()) {
      onProcess(pasteText, "paste");
      setPasteText("");
    }
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && fileRef.current?.click()}
        className="glass-card"
        style={{
          padding: "40px 24px",
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          borderStyle: "dashed",
          borderWidth: "2px",
          borderColor: dragOver ? "var(--brand-teal)" : "var(--cl-border-light)",
          background: dragOver
            ? "rgba(111, 164, 175, 0.08)"
            : "rgba(255, 255, 255, 0.92)",
          borderRadius: "var(--radius-lg)",
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
        <div
          className="text-4xl mb-3"
          style={processing ? { animation: "pulse-soft 2s ease-in-out infinite" } : {}}
        >
          {processing ? (
            <span className="pulse-soft">&#9881;</span>
          ) : (
            <span style={{ filter: "grayscale(0.3)" }}>&#128196;</span>
          )}
        </div>
        <p
          className="font-medium text-base"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {processing
            ? "Processing your transcript..."
            : "Drop chat export here or click to browse"}
        </p>
        <p className="text-sm mt-2" style={{ color: "var(--cl-fg-muted)" }}>
          Supports .json (ChatGPT/Claude), .zip, .txt, .md, .pdf
        </p>
        {processing && (
          <div
            className="mt-4 mx-auto overflow-hidden"
            style={{
              width: "200px",
              height: "3px",
              borderRadius: "var(--radius-pill)",
              background: "var(--cl-border-light)",
            }}
          >
            <div
              className="h-full loading-shimmer"
              style={{
                background: "linear-gradient(90deg, var(--brand-teal), var(--brand-coral), var(--brand-teal))",
                backgroundSize: "200px 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
          </div>
        )}
      </div>

      {/* Paste area */}
      <div className="flex gap-2">
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Or paste text here..."
          className="input-field flex-1 resize-none"
          style={{ height: "72px" }}
          disabled={disabled || processing}
        />
        <button
          onClick={handlePaste}
          disabled={disabled || processing || !pasteText.trim()}
          className="btn-primary self-end"
        >
          Process
        </button>
      </div>
    </div>
  );
}
