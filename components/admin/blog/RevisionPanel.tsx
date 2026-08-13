"use client";

// Revision history with a side-by-side diff and one-click restore.
//
// The diff is computed on the plain text of each document rather than the JSON:
// authors think in prose, and a JSON diff would be dominated by structural
// noise they never typed.

import { useCallback, useMemo, useState } from "react";
import { History, RotateCcw, X } from "lucide-react";
import { useAdminData } from "@/components/admin/useAdmin";
import { Button, ErrorState, Spinner, fmtRelative } from "@/components/admin/ui";
import { blogApi, type Post, type Revision } from "@/lib/blogApi";
import type { BlogDoc, BlogNode } from "@/lib/blog/nodes";

function docToLines(doc: BlogDoc): string[] {
  const lines: string[] = [];

  function walk(node: BlogNode, into: string[]) {
    if (node.type === "text") {
      into.push(node.text);
      return;
    }
    const buffer: string[] = [];
    for (const child of node.content ?? []) walk(child, buffer);
    const joined = buffer.join("").trim();
    if (joined) lines.push(joined);
  }

  for (const node of doc.content ?? []) walk(node, []);
  return lines;
}

type DiffRow = { left: string | null; right: string | null; changed: boolean };

/**
 * Longest-common-subsequence diff over lines. Small documents only — this is
 * O(n*m), which is fine for an article but would not be for a large file.
 */
function diffLines(before: string[], after: string[]): DiffRow[] {
  const n = before.length;
  const m = after.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      lcs[i][j] =
        before[i] === after[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (before[i] === after[j]) {
      rows.push({ left: before[i], right: after[j], changed: false });
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      rows.push({ left: before[i], right: null, changed: true });
      i += 1;
    } else {
      rows.push({ left: null, right: after[j], changed: true });
      j += 1;
    }
  }
  while (i < n) rows.push({ left: before[i++], right: null, changed: true });
  while (j < m) rows.push({ left: null, right: after[j++], changed: true });

  return rows;
}

interface Props {
  post: Post;
  /** Current editor document — diffed against the selected revision. */
  currentDoc: BlogDoc;
  onRestored: (post: Post) => void;
  onClose: () => void;
}

export function RevisionPanel({ post, currentDoc, onRestored, onClose }: Props) {
  const [selected, setSelected] = useState<Revision | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const loader = useCallback(() => blogApi.revisions(post.id), [post.id]);
  const { data, loading, error, refetch } = useAdminData(loader, [post.id]);

  const rows = useMemo(() => {
    if (!selected) return [];
    return diffLines(docToLines(selected.contentJson), docToLines(currentDoc));
  }, [selected, currentDoc]);

  const restore = async () => {
    if (!selected) return;
    setRestoring(true);
    setRestoreError(null);
    try {
      const { post: restored } = await blogApi.restoreRevision(post.id, selected.id);
      onRestored(restored);
      onClose();
    } catch (err) {
      setRestoreError((err as Error).message);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Revision history"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <h2 className="flex items-center gap-2 font-heading text-lg font-black text-zinc-900">
            <History className="h-5 w-5" /> Revision history
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close revision history"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-[16rem_1fr] overflow-hidden">
          <div className="overflow-y-auto border-r border-zinc-200 p-3">
            {loading && <Spinner label="Loading…" />}
            {error && <ErrorState message={error} onRetry={refetch} />}
            {data?.revisions.length === 0 && (
              <p className="p-3 text-sm text-zinc-500">
                No revisions yet. One is saved each time you edit or publish.
              </p>
            )}
            <ul className="space-y-1">
              {data?.revisions.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(r)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selected?.id === r.id
                        ? "bg-forest-moss-600 text-white"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    <span className="block truncate font-semibold">{r.title}</span>
                    <span
                      className={`block text-xs ${
                        selected?.id === r.id ? "text-white/80" : "text-zinc-400"
                      }`}
                    >
                      {fmtRelative(r.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col overflow-hidden">
            {!selected && (
              <p className="p-6 text-sm text-zinc-500">
                Pick a revision to compare it with the current draft.
              </p>
            )}

            {selected && (
              <>
                <div className="grid grid-cols-2 gap-4 border-b border-zinc-200 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <span>Revision · {fmtRelative(selected.createdAt)}</span>
                  <span>Current draft</span>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-3">
                  {rows.length === 0 && (
                    <p className="text-sm text-zinc-500">This revision matches the current draft.</p>
                  )}
                  {rows.map((row, i) => (
                    <div key={i} className="grid grid-cols-2 gap-4 border-b border-zinc-100 py-1.5">
                      <p
                        className={`text-sm ${
                          row.changed && row.left ? "bg-red-50 text-red-800" : "text-zinc-600"
                        }`}
                      >
                        {row.left ?? ""}
                      </p>
                      <p
                        className={`text-sm ${
                          row.changed && row.right ? "bg-green-50 text-green-800" : "text-zinc-600"
                        }`}
                      >
                        {row.right ?? ""}
                      </p>
                    </div>
                  ))}
                </div>

                {restoreError && (
                  <p className="px-5 pb-2 text-sm font-medium text-red-600">{restoreError}</p>
                )}

                <div className="flex justify-end gap-2 border-t border-zinc-200 px-5 py-3">
                  <Button variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button icon={RotateCcw} loading={restoring} onClick={() => void restore()}>
                    Restore this revision
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
