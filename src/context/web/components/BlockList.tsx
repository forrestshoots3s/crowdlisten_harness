import React from "react";

interface ContextBlock {
  type: string;
  title: string;
  content: string;
  source?: string;
}

interface Props {
  blocks: ContextBlock[];
  onDelete: (index: number) => void;
}

const TYPE_STYLES: Record<string, { bg: string; fg: string; icon: string }> = {
  style: {
    bg: "rgba(147, 51, 234, 0.1)",
    fg: "rgb(126, 34, 206)",
    icon: "\u270D\uFE0F",
  },
  insight: {
    bg: "rgba(111, 164, 175, 0.15)",
    fg: "var(--brand-teal)",
    icon: "\uD83D\uDCA1",
  },
  pattern: {
    bg: "rgba(217, 125, 85, 0.12)",
    fg: "var(--brand-coral)",
    icon: "\uD83D\uDD04",
  },
  preference: {
    bg: "rgba(184, 196, 169, 0.25)",
    fg: "hsl(134, 30%, 35%)",
    icon: "\u2699\uFE0F",
  },
};

export default function BlockList({ blocks, onDelete }: Props) {
  if (blocks.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: "var(--cl-fg-muted)" }}>
        <p className="text-sm">No context blocks extracted yet</p>
      </div>
    );
  }

  return (
    <div>
      <h2
        className="text-lg font-semibold mb-3"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Context Blocks
        <span
          className="ml-2 text-sm font-normal"
          style={{ color: "var(--cl-fg-muted)" }}
        >
          ({blocks.length})
        </span>
      </h2>
      <div className="space-y-2.5">
        {blocks.map((block, i) => {
          const style = TYPE_STYLES[block.type] || {
            bg: "rgba(0,0,0,0.05)",
            fg: "var(--cl-fg)",
            icon: "\uD83D\uDCDD",
          };
          return (
            <div key={i} className="glass-card" style={{ padding: "14px 16px" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{style.icon}</span>
                  <span
                    className="pill shrink-0"
                    style={{ background: style.bg, color: style.fg }}
                  >
                    {block.type}
                  </span>
                  <span className="font-medium text-sm truncate">
                    {block.title}
                  </span>
                </div>
                <button
                  onClick={() => onDelete(i)}
                  className="shrink-0 w-6 h-6 flex items-center justify-center text-xs"
                  style={{
                    color: "var(--cl-fg-muted)",
                    borderRadius: "var(--radius-xs)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--cl-negative-fg)";
                    e.currentTarget.style.background = "var(--cl-negative-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--cl-fg-muted)";
                    e.currentTarget.style.background = "transparent";
                  }}
                  title="Delete block"
                >
                  &#10005;
                </button>
              </div>
              <p
                className="text-sm mt-1.5 ml-7 leading-relaxed"
                style={{ color: "var(--cl-fg-muted)" }}
              >
                {block.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
