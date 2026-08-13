"use client";

// Browse previously uploaded images and reuse one, rather than re-uploading
// (which the backend would dedupe anyway, but this saves the round trip and
// lets an author find an image they already used).

import { useCallback, useState } from "react";
import Image from "next/image";
import { Trash2, X } from "lucide-react";
import { useAdminData } from "@/components/admin/useAdmin";
import { Button, ErrorState, Spinner } from "@/components/admin/ui";
import { blogApi, mediaUrl, type Media } from "@/lib/blogApi";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the chosen image; the caller decides what to do with it. */
  onSelect: (media: Media) => void;
  title?: string;
}

export function MediaLibrary({ open, onClose, onSelect, title = "Media library" }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const loader = useCallback(() => blogApi.listMedia(1, 60), []);
  const { data, loading, error, refetch } = useAdminData(loader, [open]);

  if (!open) return null;

  const remove = async (id: string) => {
    setDeleting(id);
    try {
      await blogApi.deleteMedia(id);
      refetch();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <h2 className="font-heading text-lg font-black text-zinc-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media library"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5">
          {loading && <Spinner label="Loading media…" />}
          {error && <ErrorState message={error} onRetry={refetch} />}

          {data && data.media.length === 0 && (
            <p className="py-10 text-center text-sm text-zinc-500">
              Nothing uploaded yet. Add an image from the editor toolbar.
            </p>
          )}

          {data && data.media.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {data.media.map((m) => (
                <li key={m.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(m);
                      onClose();
                    }}
                    className="block w-full overflow-hidden rounded-xl border border-zinc-200 transition-colors hover:border-forest-moss-500"
                  >
                    <Image
                      src={mediaUrl(m.path)}
                      alt={m.originalName}
                      width={m.width ?? 400}
                      height={m.height ?? 300}
                      className="h-28 w-full object-cover"
                    />
                    <span className="block truncate px-2 py-1 text-left text-[11px] text-zinc-500">
                      {m.originalName}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void remove(m.id)}
                    disabled={deleting === m.id}
                    aria-label={`Delete ${m.originalName}`}
                    className="absolute right-1.5 top-1.5 rounded-lg bg-white/90 p-1.5 text-zinc-500 opacity-0 shadow-sm transition-opacity hover:text-red-600 group-hover:opacity-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end border-t border-zinc-200 px-5 py-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
