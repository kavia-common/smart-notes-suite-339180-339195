"use client";

import * as React from "react";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
};

// PUBLIC_INTERFACE
export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  /** App button primitive with consistent styling. */
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "h-8 px-3 text-sm" : "h-10 px-4 text-sm";
  const variants =
    variant === "primary"
      ? "bg-[var(--color-accent)] text-white hover:bg-[#2563eb] focus:ring-[var(--color-accent)]"
      : variant === "danger"
        ? "bg-[var(--color-error)] text-white hover:bg-[#dc2626] focus:ring-[var(--color-error)]"
        : "bg-transparent text-[var(--color-primary)] hover:bg-black/5 focus:ring-black/20";

  return (
    <button className={cx(base, sizes, variants, className)} {...props} />
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

// PUBLIC_INTERFACE
export function Input({ label, className, ...props }: InputProps) {
  /** App input primitive (optionally labeled). */
  const input = (
    <input
      className={cx(
        "h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]",
        className,
      )}
      {...props}
    />
  );

  if (!label) return input;

  return (
    <label className="grid gap-1 text-sm">
      <span className="text-black/70">{label}</span>
      {input}
    </label>
  );
}

// PUBLIC_INTERFACE
export function Badge({ children }: { children: React.ReactNode }) {
  /** Small badge used for tags. */
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white px-2 py-0.5 text-xs text-black/70">
      {children}
    </span>
  );
}
