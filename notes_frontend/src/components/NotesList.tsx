"use client";

import * as React from "react";
import type { Note } from "@/lib/types";
import { cx } from "@/components/ui";

type Props = {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onTogglePinned: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

// PUBLIC_INTERFACE
export function NotesList({
  notes,
  selectedId,
  onSelect,
  onTogglePinned,
  onToggleFavorite,
}: Props) {
  /** Notes list panel with quick actions. */
  return (
    <section className="h-full border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between gap-2 p-4">
        <h2 className="text-sm font-semibold text-[var(--color-primary)]">
          Notes
        </h2>
        <div className="text-xs text-black/50">{notes.length}</div>
      </div>

      <div className="h-[calc(100%-56px)] overflow-auto">
        {notes.length === 0 ? (
          <div className="px-4 py-6 text-sm text-black/60">
            No matching notes. Create one to get started.
          </div>
        ) : null}

        <ul className="grid">
          {notes.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => onSelect(n.id)}
                className={cx(
                  "w-full px-4 py-3 text-left transition-colors",
                  "hover:bg-black/5",
                  selectedId === n.id ? "bg-[rgba(59,130,246,0.10)]" : "",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-primary)]">
                      {n.title || "Untitled"}
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-black/60">
                      {n.content ? n.content.replace(/\n/g, " ") : "—"}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {n.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-black/60"
                        >
                          {t}
                        </span>
                      ))}
                      {n.tags.length > 3 ? (
                        <span className="text-[11px] text-black/40">
                          +{n.tags.length - 3}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      className={cx(
                        "rounded-md px-2 py-1 text-xs",
                        n.pinned
                          ? "bg-black/10 text-black"
                          : "bg-transparent text-black/50 hover:bg-black/5",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinned(n.id);
                      }}
                      aria-label={n.pinned ? "Unpin note" : "Pin note"}
                    >
                      {n.pinned ? "Pinned" : "Pin"}
                    </button>

                    <button
                      type="button"
                      className={cx(
                        "rounded-md px-2 py-1 text-xs",
                        n.favorite
                          ? "bg-[rgba(6,182,212,0.18)] text-black"
                          : "bg-transparent text-black/50 hover:bg-black/5",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(n.id);
                      }}
                      aria-label={n.favorite ? "Unfavorite note" : "Favorite note"}
                    >
                      {n.favorite ? "★" : "☆"}
                    </button>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
