"use client";

import * as React from "react";
import { Button, Input } from "@/components/ui";
import type { AuthSession } from "@/lib/types";
import { saveAuthSession } from "@/lib/storage";

type Props = {
  onDone: (session: AuthSession) => void;
};

// PUBLIC_INTERFACE
export function AuthCard({ onDone }: Props) {
  /** Simple auth UI (local session) that can later be connected to backend auth. */
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    // Local-only session. Backend integration can replace this.
    const session: AuthSession = {
      user: { id: trimmed, email: trimmed },
      token: "local-session",
    };

    saveAuthSession(session);
    onDone(session);
  }

  return (
    <section className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-[var(--color-primary)]">
          {mode === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-1 text-sm text-black/60">
          Local mode works offline; cloud sync can be enabled when the backend is
          ready.
        </p>
      </header>

      <form className="grid gap-3" onSubmit={submit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />

        {error ? (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit">
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>

        <button
          type="button"
          className="text-sm text-[var(--color-accent)] underline underline-offset-2"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </section>
  );
}
