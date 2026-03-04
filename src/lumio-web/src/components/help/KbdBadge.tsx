"use client";

import { useTranslations } from "next-intl";

/**
 * Renders keyboard shortcuts extracted from inline `` `code` `` spans.
 * Handles modifier combos (Ctrl+K), single keys (Esc, Enter), and
 * multi-key sequences (G dan D / G then D).
 */

/** Returns true when the text looks like a keyboard shortcut. */
export function isKeyboardShortcut(text: string): boolean {
  const t = text.trim();
  // Modifier + key: Ctrl+X, Alt+X, Shift+X, Cmd+X, Meta+X
  if (/^(Ctrl|Alt|Shift|Cmd|Meta|Win)\+\S+/i.test(t)) return true;
  // Named single keys
  if (
    /^(Escape|Esc|Enter|Return|Tab|Backspace|Delete|Del|Home|End|PageUp|PageDown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|F\d{1,2}|\?)$/.test(
      t,
    )
  )
    return true;
  // Multi-key sequences like "G dan D" or "G then D"
  if (/^[A-Z]\s+(dan|then)\s+[A-Z]$/i.test(t)) return true;
  return false;
}

interface KbdProps {
  children: React.ReactNode;
}

function Key({ children }: KbdProps) {
  return (
    <kbd className="help-kbd inline-flex items-center font-mono text-xs px-1.5 py-0.5 rounded border border-border bg-muted shadow-[inset_0_-1px_0_0_hsl(var(--border))] transition-transform hover:-translate-y-px">
      {children}
    </kbd>
  );
}

interface KbdBadgeProps {
  children: string;
}

/**
 * Renders a keyboard shortcut string as styled `<kbd>` badges.
 * Sequences like "G dan D" become two badges separated by "→".
 * Combos like "Ctrl+Shift+K" become a single badge.
 */
export function KbdBadge({ children }: KbdBadgeProps) {
  const tAria = useTranslations("aria");
  const text = children.trim();

  // Multi-key sequences: "G dan D" / "G then D"
  const sequenceMatch = text.match(/^([^\s]+)\s+(?:dan|then)\s+([^\s]+)$/i);
  if (sequenceMatch) {
    return (
      <span
        className="inline-flex items-center gap-1"
        aria-label={tAria("toetscombinatie", { keys: text })}
      >
        <Key>{sequenceMatch[1]}</Key>
        <span className="text-muted-foreground text-xs">→</span>
        <Key>{sequenceMatch[2]}</Key>
      </span>
    );
  }

  return (
    <Key>
      <span aria-label={tAria("toetscombinatie", { keys: text })}>{text}</span>
    </Key>
  );
}
