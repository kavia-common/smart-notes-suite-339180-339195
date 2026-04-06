"use client";

import * as React from "react";
import type { AuthSession, Note } from "@/lib/types";
import { Button, cx } from "@/components/ui";
import { Sidebar } from "@/components/Sidebar";
import { NotesList } from "@/components/NotesList";
import { NoteEditor } from "@/components/NoteEditor";
import {
  loadAuthSession,
  loadNotes,
  loadPreferences,
  loadSelectedNoteId,
  saveAuthSession,
  saveNotes,
  savePreferences,
  saveSelectedNoteId,
} from "@/lib/storage";
import {
  applyPatch,
  createEmptyNote,
  normalizeTags,
  noteMatchesQuery,
  sortNotes,
} from "@/lib/notes";
import { AuthCard } from "@/components/AuthCard";

function formatRelativeTime(iso: string): string {
  const dt = new Date(iso);
  const ms = Date.now() - dt.getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes <= 0) return "just now";
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

// PUBLIC_INTERFACE
export function AppShell() {
  /** Full app UI with responsive sidebar, list, editor, and autosave/local persistence. */
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState("");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);

  const [editorMode, setEditorMode] = React.useState<"edit" | "preview">("edit");
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const [autosaveState, setAutosaveState] = React.useState<
    "saved" | "saving" | "dirty"
  >("saved");
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);

  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [showAuth, setShowAuth] = React.useState(false);

  // Load initial state (client-only).
  React.useEffect(() => {
    const initialNotes = loadNotes();
    const prefs = loadPreferences();
    const selected = loadSelectedNoteId();
    const auth = loadAuthSession();

    setNotes(initialNotes);
    setEditorMode(prefs.editorMode);
    setSidebarOpen(prefs.sidebarOpen);
    setSelectedId(selected);
    setSession(auth);
  }, []);

  // Persist UI prefs
  React.useEffect(() => {
    savePreferences({ editorMode, sidebarOpen });
  }, [editorMode, sidebarOpen]);

  // Persist selected note
  React.useEffect(() => {
    saveSelectedNoteId(selectedId);
  }, [selectedId]);

  // Autosave debounced whenever notes change
  React.useEffect(() => {
    // If notes never loaded yet, don't write.
    // (A simple heuristic: lastSavedAt null and notes empty may still be valid, but fine.)
    setAutosaveState("dirty");

    const t1 = window.setTimeout(() => setAutosaveState("saving"), 250);
    const t2 = window.setTimeout(() => {
      saveNotes(notes);
      setAutosaveState("saved");
      const now = new Date().toISOString();
      setLastSavedAt(now);
    }, 650);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [notes]);

  const selectedNote = React.useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    for (const n of notes) for (const t of n.tags) tags.add(t);
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const filteredNotes = React.useMemo(() => {
    const tag = activeTag?.toLowerCase() ?? null;
    const q = query.trim();
    const list = notes.filter((n) => {
      if (tag && !n.tags.includes(tag)) return false;
      if (!noteMatchesQuery(n, q)) return false;
      return true;
    });
    return sortNotes(list);
  }, [notes, activeTag, query]);

  function createNote() {
    const n = createEmptyNote();
    setNotes((prev) => [n, ...prev]);
    setSelectedId(n.id);
  }

  function deleteSelected() {
    if (!selectedId) return;
    setNotes((prev) => prev.filter((n) => n.id !== selectedId));
    setSelectedId((prevId) => {
      if (prevId !== selectedId) return prevId;
      // Select next best note after deletion
      const remaining = notes.filter((n) => n.id !== selectedId);
      return remaining.length ? sortNotes(remaining)[0].id : null;
    });
  }

  function updateSelected(patch: Partial<Pick<Note, "title" | "content" | "tags">>) {
    if (!selectedId) return;
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== selectedId) return n;
        const normalizedPatch =
          patch.tags !== undefined ? { ...patch, tags: normalizeTags(patch.tags) } : patch;
        return applyPatch(n, normalizedPatch);
      }),
    );
  }

  function togglePinned(id: string) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? applyPatch(n, { pinned: !n.pinned }) : n)),
    );
  }

  function toggleFavorite(id: string) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? applyPatch(n, { favorite: !n.favorite }) : n,
      ),
    );
  }

  function signOut() {
    setSession(null);
    saveAuthSession(null);
    setShowAuth(false);
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="flex min-h-screen">
        <Sidebar
          open={sidebarOpen}
          onToggleOpen={() => setSidebarOpen((v) => !v)}
          allTags={allTags}
          activeTag={activeTag}
          onSelectTag={setActiveTag}
          query={query}
          onQueryChange={setQuery}
          signedInEmail={session?.user.email ?? null}
          onSignOut={signOut}
          onShowAuth={() => setShowAuth(true)}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                Menu
              </Button>
              <div className="text-sm font-semibold text-[var(--color-primary)]">
                {activeTag ? `Tag: ${activeTag}` : "All notes"}
              </div>
              <div className="hidden text-xs text-black/50 md:block">
                {autosaveState === "saved" && lastSavedAt
                  ? `Saved ${formatRelativeTime(lastSavedAt)}`
                  : autosaveState === "saving"
                    ? "Saving…"
                    : "Unsaved changes"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={createNote}>
                New note
              </Button>
            </div>
          </div>

          {/* 3-column responsive layout */}
          <div
            className={cx(
              "grid flex-1",
              "grid-cols-1",
              "lg:grid-cols-[360px_1fr]",
            )}
          >
            <div className="hidden h-[calc(100vh-56px)] lg:block">
              <NotesList
                notes={filteredNotes}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onTogglePinned={togglePinned}
                onToggleFavorite={toggleFavorite}
              />
            </div>

            <div className="h-[calc(100vh-56px)]">
              {/* On smaller screens, show list above editor when none selected */}
              <div className="lg:hidden">
                <NotesList
                  notes={filteredNotes}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onTogglePinned={togglePinned}
                  onToggleFavorite={toggleFavorite}
                />
              </div>

              <div className="h-[calc(100vh-56px)] lg:h-full lg:border-l-0">
                <NoteEditor
                  note={selectedNote}
                  editorMode={editorMode}
                  onToggleMode={() =>
                    setEditorMode((m) => (m === "edit" ? "preview" : "edit"))
                  }
                  onChange={updateSelected}
                  onDelete={deleteSelected}
                  autosaveState={autosaveState}
                  lastSavedLabel={lastSavedAt ? formatRelativeTime(lastSavedAt) : null}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Auth modal */}
      {showAuth ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Authentication"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAuth(false);
          }}
        >
          <div className="relative w-full max-w-md">
            <button
              type="button"
              className="absolute right-2 top-2 rounded-md px-2 py-1 text-sm text-black/60 hover:bg-black/10"
              onClick={() => setShowAuth(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <AuthCard
              onDone={(s) => {
                setSession(s);
                saveAuthSession(s);
                setShowAuth(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
