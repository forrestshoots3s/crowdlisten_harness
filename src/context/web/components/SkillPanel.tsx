import React, { useState, useEffect } from "react";

interface ExtendedSkillMatch {
  skillId: string;
  name: string;
  description: string;
  score: number;
  matchedKeywords: string[];
  tier: "crowdlisten" | "community";
  category: string;
  installMethod: string;
  installTarget: string;
}

interface CategoryInfo {
  category: string;
  count: number;
  nativeCount: number;
  communityCount: number;
}

interface Props {
  skills: Array<{
    skillId: string;
    name: string;
    description: string;
    score: number;
    matchedKeywords: string[];
    tier?: string;
    category?: string;
    installMethod?: string;
    installTarget?: string;
  }>;
  hasBlocks: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  development: "Development",
  data: "Data & AI",
  content: "Content",
  research: "Research",
  automation: "Automation",
  design: "Design",
  business: "Business",
  productivity: "Productivity",
};

export default function SkillPanel({ skills, hasBlocks }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filterText, setFilterText] = useState("");
  const [allSkills, setAllSkills] = useState<ExtendedSkillMatch[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all skills + categories on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/skills/search?q=").then((r) => r.json()),
      fetch("/api/skills/categories").then((r) => r.json()),
    ])
      .then(([skillsData, catData]) => {
        setAllSkills(skillsData.skills || []);
        setCategories(catData.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build the recommended set (skill IDs that matched from context)
  const recommendedIds = new Set(skills.map((s) => s.skillId));

  // Filter skills for display
  const filteredSkills = allSkills.filter((skill) => {
    if (selectedCategory && skill.category !== selectedCategory) return false;
    if (filterText) {
      const q = filterText.toLowerCase();
      const haystack = `${skill.name} ${skill.description} ${skill.category}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // Sort: recommended first (by score), then alphabetical
  const sortedSkills = [...filteredSkills].sort((a, b) => {
    const aRec = recommendedIds.has(a.skillId);
    const bRec = recommendedIds.has(b.skillId);
    if (aRec && !bRec) return -1;
    if (!aRec && bRec) return 1;
    if (aRec && bRec) {
      const aScore = skills.find((s) => s.skillId === a.skillId)?.score || 0;
      const bScore = skills.find((s) => s.skillId === b.skillId)?.score || 0;
      return bScore - aScore;
    }
    return a.name.localeCompare(b.name);
  });

  function handleInstall(skill: {
    skillId: string;
    name: string;
    installTarget?: string;
    installMethod?: string;
    tier?: string;
  }) {
    if (!skill.installTarget) return;

    if (
      skill.tier === "crowdlisten" ||
      skill.installTarget.startsWith("crowdlisten:")
    ) {
      alert(
        `${skill.name} is a native CrowdListen skill.\nFind it in your crowdlisten_tasks/skills/ directory.`
      );
      return;
    }

    const safeName = skill.skillId.replace(/^comm-/, "");
    const cmd = `curl -o .claude/commands/${safeName}.md "${skill.installTarget}"`;
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedId(skill.skillId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function SkillCard({ skill }: { skill: ExtendedSkillMatch }) {
    const isRecommended = recommendedIds.has(skill.skillId);
    const recMatch = skills.find((s) => s.skillId === skill.skillId);
    const pct = recMatch ? Math.round(recMatch.score * 100) : 0;
    const isCopied = copiedId === skill.skillId;

    return (
      <div
        className="glass-card"
        style={{
          padding: "12px 14px",
          border: isRecommended
            ? "1.5px solid var(--brand-teal)"
            : undefined,
          position: "relative",
        }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="font-medium text-sm leading-snug" style={{ flex: 1 }}>
            {skill.name}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {isRecommended && (
              <span
                className="pill"
                style={{
                  background:
                    pct >= 60
                      ? "rgba(111, 164, 175, 0.15)"
                      : "rgba(217, 125, 85, 0.12)",
                  color:
                    pct >= 60 ? "var(--brand-teal)" : "var(--brand-coral)",
                  fontSize: "10px",
                  padding: "1px 7px",
                }}
              >
                {pct}% match
              </span>
            )}
            <span
              className="pill"
              style={{
                background:
                  skill.tier === "crowdlisten"
                    ? "rgba(111, 164, 175, 0.15)"
                    : "rgba(130, 140, 200, 0.12)",
                color:
                  skill.tier === "crowdlisten"
                    ? "var(--brand-teal)"
                    : "#7c8cc4",
                fontSize: "10px",
                padding: "1px 7px",
              }}
            >
              {skill.tier === "crowdlisten" ? "crowdlisten" : "community"}
            </span>
          </div>
        </div>

        {/* Description */}
        <p
          className="text-xs leading-relaxed mb-2"
          style={{
            color: "var(--cl-fg-muted)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {skill.description}
        </p>

        {/* Footer: category + install */}
        <div className="flex items-center justify-between">
          <span
            style={{
              fontSize: "10px",
              color: "var(--cl-fg-muted)",
            }}
          >
            {CATEGORY_LABELS[skill.category] || skill.category}
          </span>
          <button
            onClick={() => handleInstall(skill)}
            className="pill"
            style={{
              cursor: "pointer",
              background: isCopied
                ? "rgba(111, 164, 175, 0.2)"
                : "var(--cl-bg-secondary)",
              border: "1px solid var(--cl-border-light)",
              color: isCopied ? "var(--brand-teal)" : "var(--cl-fg)",
              fontSize: "10px",
              padding: "2px 10px",
            }}
          >
            {isCopied
              ? "Copied!"
              : skill.tier === "crowdlisten"
                ? "Info"
                : "Install"}
          </button>
        </div>

        {/* Match bar for recommended */}
        {isRecommended && (
          <div
            className="mt-2 overflow-hidden"
            style={{
              height: "2px",
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
                    : "var(--brand-coral)",
                transition: "width 0.6s ease",
              }}
            />
          </div>
        )}
      </div>
    );
  }

  const totalCount = allSkills.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Skill Gallery
        </h2>
        <span
          className="text-xs"
          style={{ color: "var(--cl-fg-muted)" }}
        >
          {filteredSkills.length} of {totalCount} skills
        </span>
      </div>

      {/* Context hint */}
      {!hasBlocks && skills.length === 0 && (
        <p
          className="text-xs mb-3"
          style={{ color: "var(--cl-fg-muted)" }}
        >
          Import a chat to highlight skills matched to your workflow
        </p>
      )}
      {skills.length > 0 && (
        <p
          className="text-xs mb-3"
          style={{ color: "var(--brand-teal)" }}
        >
          {skills.length} skill{skills.length !== 1 ? "s" : ""} matched from your context — highlighted below
        </p>
      )}

      {/* Category pills as filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          onClick={() => setSelectedCategory("")}
          className="pill"
          style={{
            cursor: "pointer",
            background: !selectedCategory
              ? "var(--brand-teal)"
              : "var(--cl-bg-secondary)",
            border: "1px solid " + (!selectedCategory ? "var(--brand-teal)" : "var(--cl-border-light)"),
            color: !selectedCategory ? "#fff" : "var(--cl-fg)",
            fontSize: "11px",
            padding: "3px 10px",
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.category}
            onClick={() =>
              setSelectedCategory(
                selectedCategory === cat.category ? "" : cat.category
              )
            }
            className="pill"
            style={{
              cursor: "pointer",
              background:
                selectedCategory === cat.category
                  ? "var(--brand-teal)"
                  : "var(--cl-bg-secondary)",
              border:
                "1px solid " +
                (selectedCategory === cat.category
                  ? "var(--brand-teal)"
                  : "var(--cl-border-light)"),
              color:
                selectedCategory === cat.category
                  ? "#fff"
                  : "var(--cl-fg)",
              fontSize: "11px",
              padding: "3px 10px",
            }}
          >
            {CATEGORY_LABELS[cat.category] || cat.category}{" "}
            <span
              style={{
                opacity: selectedCategory === cat.category ? 0.8 : 0.5,
              }}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Inline filter */}
      <input
        type="text"
        placeholder="Filter skills..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="w-full px-3 py-1.5 text-xs mb-4"
        style={{
          background: "var(--cl-bg-secondary)",
          border: "1px solid var(--cl-border-light)",
          borderRadius: "var(--radius-m)",
          color: "var(--cl-fg)",
          outline: "none",
        }}
      />

      {/* Skill gallery grid */}
      {loading ? (
        <div
          className="text-center py-8"
          style={{ color: "var(--cl-fg-muted)" }}
        >
          <p className="text-sm">Loading skills...</p>
        </div>
      ) : (
        <div
          className="grid gap-2.5"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {sortedSkills.map((skill) => (
            <SkillCard key={skill.skillId} skill={skill} />
          ))}
        </div>
      )}

      {!loading && filteredSkills.length === 0 && (
        <div
          className="text-center py-8"
          style={{ color: "var(--cl-fg-muted)" }}
        >
          <p className="text-sm">No skills match your filter</p>
        </div>
      )}
    </div>
  );
}
