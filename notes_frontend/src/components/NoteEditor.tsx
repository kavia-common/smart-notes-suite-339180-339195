"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Note } from "@/lib/types";
import { Button, Input } from "@/components/ui";

type Props = {
  note: Note | null;

  editorMode: "edit" | "preview";
  onToggleMode: () => void;

  onChange: (patch: Partial<Pick<Note, "title" | "content" | "tags">>) => void;
  onDelete: () => void;

  autosaveState: "saved" | "saving" | "dirty";
  lastSavedLabel: string | null;
};

// PUBLIC_INTERFACE
export function NoteEditor({
  note,
  editorMode,
  onToggleMode,
  onChange,
  onDelete,
  autosaveState,
  lastSavedLabel,
}: Props) {
  /** Main note editor with markdown support. */
  const [tagText, setTagText] = React.useState("");

  React.useEffect(() => {
    setTagText(note ? note.tags.join(", ") : "");
  }, [note?.id, note?.tags]); // reset when switching notes or tags change externally

  if (!note) {
    return (
      <section className="flex h-full flex-col items-center justify-center bg-[var(--color-background)] p-8 text-center">
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">
          Select a note
        </h2>
        <p className="mt-2 max-w-md text-sm text-black/60">
          Choose a note from the list or create a new one to start writing.
        </p>
      </section>
    );
  }

  const autosaveText =
    autosaveState === "saving"
      ? "Saving…"
      : autosaveState === "dirty"
        ? "Unsaved changes"
        : lastSavedLabel
          ? `Saved ${lastSavedLabel}`
          : "Saved";

  return (
    <section className="flex h-full flex-col bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <Input
              aria-label="Note title"
              value={note.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
            <div className="mt-2 text-xs text-black/60">{autosaveText}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={onToggleMode}>
              {editorMode === "edit" ? "Preview" : "Edit"}
            </Button>
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-3">
          <Input
            label="Tags (comma separated)"
            value={tagText}
            onChange={(e) => setTagText(e.target.value)}
            onBlur={() => {
              const tags = tagText
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
              onChange({ tags });
            }}
            placeholder="e.g. work, idea, personal"
          />
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4">
        {editorMode === "edit" ? (
          <textarea
            className="min-h-[60vh] w-full resize-none rounded-md border border-[var(--color-border)] bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            value={note.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Write in Markdown…"
          />
        ) : (
          <article className="markdown rounded-md border border-[var(--color-border)] bg-white p-4">
            {note.content.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content}
              </ReactMarkdown>
            ) : (
              <p className="text-sm text-black/60">Nothing to preview.</p>
            )}
          </article>
        )}
      </div>
    </section>
  );
}
