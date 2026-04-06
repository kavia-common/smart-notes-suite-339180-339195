"use client";

import * as React from "react";
import { Badge, Button, Input, cx } from "@/components/ui";

type Props = {
  open: boolean;
  onToggleOpen: () => void;

  allTags: string[];
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;

  query: string;
  onQueryChange: (value: string) => void;

  signedInEmail: string | null;
  onSignOut: () => void;
  onShowAuth: () => void;
};

// PUBLIC_INTERFACE
export function Sidebar(props: Props) {
  /** Responsive sidebar listing tags and basic navigation actions. */
  const {
    open,
    onToggleOpen,
    allTags,
    activeTag,
    onSelectTag,
    query,
    onQueryChange,
    signedInEmail,
    onSignOut,
    onShowAuth,
  } = props;

  return (
    <aside
      className={cx(
        "border-r border-[var(--color-border)] bg-[var(--color-surface)]",
        "md:static md:h-auto",
        open ? "block" : "hidden md:block",
      )}
    >
      <div className="flex h-full w-full flex-col p-4 md:w-72">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--color-primary)]">
              Smart Notes Suite
            </div>
            <div className="truncate text-xs text-black/60">
              {signedInEmail ? `Signed in as ${signedInEmail}` : "Offline / Local"}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onToggleOpen} className="md:hidden">
            Close
          </Button>
        </div>

        <div className="mt-4 grid gap-3">
          <Input
            placeholder="Search notes…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />

          <div className="flex items-center justify-between gap-2">
            {signedInEmail ? (
              <Button variant="ghost" size="sm" onClick={onSignOut}>
                Sign out
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onShowAuth}>
                Sign in
              </Button>
            )}

            <button
              type="button"
              className="text-xs text-black/60 underline underline-offset-2"
              onClick={() => onSelectTag(null)}
            >
              Clear filters
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/50">
            Tags
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className={cx(
                "rounded-full px-2 py-1 text-xs transition-colors",
                activeTag === null
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-black/5 text-black/70 hover:bg-black/10",
              )}
            >
              All
            </button>

            {allTags.length === 0 ? (
              <span className="text-xs text-black/50">No tags yet</span>
            ) : null}

            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(tag)}
                className={cx(
                  "rounded-full px-2 py-1 text-xs transition-colors",
                  activeTag === tag
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-black/5 text-black/70 hover:bg-black/10",
                )}
                aria-pressed={activeTag === tag}
              >
                <Badge>{tag}</Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4 text-xs text-black/50">
          <p className="leading-relaxed">
            Autosave is enabled. Data is stored locally in your browser.
          </p>
        </div>
      </div>
    </aside>
  );
}
