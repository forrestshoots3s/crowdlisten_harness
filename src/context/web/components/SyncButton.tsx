import React, { useState } from "react";

interface ContextBlock {
  type: string;
  title: string;
  content: string;
  source?: string;
}

interface Props {
  blocks: ContextBlock[];
}

export default function SyncButton({ blocks }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  if (blocks.length === 0) return null;

  async function handleSync() {
    setSyncing(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      setSynced(true);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={syncing || synced}
      className="btn-secondary"
      style={
        synced
          ? {
              borderColor: "var(--cl-positive-border)",
              color: "var(--cl-positive-fg)",
              background: "var(--cl-positive-bg)",
            }
          : {}
      }
      title={`Sync ${blocks.length} blocks to CrowdListen`}
    >
      {synced
        ? "\u2713 Synced"
        : syncing
          ? "Syncing..."
          : `Sync (${blocks.length})`}
    </button>
  );
}
