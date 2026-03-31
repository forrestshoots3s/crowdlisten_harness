import React from "react";

interface SkillMatch {
  skillId: string;
  name: string;
  description: string;
  score: number;
  matchedKeywords: string[];
}

interface Props {
  skills: SkillMatch[];
}

export default function SkillPanel({ skills }: Props) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: "var(--cl-fg-muted)" }}>
        <p className="text-sm">No skill matches yet</p>
      </div>
    );
  }

  return (
    <div>
      <h2
        className="text-lg font-semibold mb-3"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Recommended Skills
      </h2>
      <div className="space-y-2.5">
        {skills.map((skill) => {
          const pct = Math.round(skill.score * 100);
          return (
            <div key={skill.skillId} className="glass-card" style={{ padding: "14px 16px" }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-sm">{skill.name}</span>
                <span
                  className="pill"
                  style={{
                    background:
                      pct >= 60
                        ? "rgba(111, 164, 175, 0.15)"
                        : pct >= 30
                          ? "rgba(217, 125, 85, 0.12)"
                          : "rgba(184, 196, 169, 0.2)",
                    color:
                      pct >= 60
                        ? "var(--brand-teal)"
                        : pct >= 30
                          ? "var(--brand-coral)"
                          : "var(--cl-fg-muted)",
                  }}
                >
                  {pct}%
                </span>
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--cl-fg-muted)" }}
              >
                {skill.description}
              </p>
              {skill.matchedKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {skill.matchedKeywords.slice(0, 5).map((kw) => (
                    <span
                      key={kw}
                      className="pill pill-sage"
                      style={{ fontSize: "10px", padding: "1px 7px" }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Score bar */}
              <div
                className="mt-2.5 overflow-hidden"
                style={{
                  height: "3px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--cl-border-light)",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: "var(--radius-pill)",
                    background:
                      pct >= 60
                        ? "var(--brand-teal)"
                        : pct >= 30
                          ? "var(--brand-coral)"
                          : "var(--cl-border)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
