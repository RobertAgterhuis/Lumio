"use client";

import type React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";
import { HelpCalloutCard } from "./HelpCalloutCard";
import { KbdBadge, isKeyboardShortcut } from "./KbdBadge";
import { StepList } from "./StepList";
import {
  parseCalloutType,
  extractCalloutPattern,
} from "@/lib/parseCalloutType";
import { slugify } from "@/lib/slugify";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/** Recursively extracts plain text from React children. */
function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children))
    return (children as React.ReactNode[]).map(extractText).join("");
  if (
    children !== null &&
    typeof children === "object" &&
    "props" in children
  ) {
    const el = children as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}

const components: Components = {
  // ── Headings with anchor IDs ──────────────────────────────────────────────
  h1({ children }) {
    return (
      <h1
        id={slugify(extractText(children))}
        className="mb-4 mt-8 text-2xl font-bold text-foreground first:mt-0"
      >
        {children}
      </h1>
    );
  },
  h2({ children }) {
    return (
      <h2
        id={slugify(extractText(children))}
        className="mb-3 mt-6 text-xl font-semibold text-foreground"
      >
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3
        id={slugify(extractText(children))}
        className="mb-2 mt-5 text-lg font-semibold text-foreground"
      >
        {children}
      </h3>
    );
  },
  h4({ children }) {
    return (
      <h4
        id={slugify(extractText(children))}
        className="mb-2 mt-4 text-base font-semibold text-foreground"
      >
        {children}
      </h4>
    );
  },

  // ── Callout blockquotes ───────────────────────────────────────────────────
  blockquote({ node, children }) {
    const pattern = extractCalloutPattern(node);
    const calloutType = parseCalloutType(pattern);
    if (calloutType) {
      return (
        <HelpCalloutCard type={calloutType}>{children}</HelpCalloutCard>
      );
    }
    return (
      <blockquote className="my-4 border-l-4 border-primary/40 bg-primary/5 py-2 pl-4 pr-3 text-sm">
        {children}
      </blockquote>
    );
  },

  // ── Code: inline keyboard shortcuts or styled code ────────────────────────
  pre({ children }) {
    return (
      <pre className="my-4 overflow-x-auto rounded-lg bg-muted p-4">
        {children}
      </pre>
    );
  },

  code({ className, children }) {
    const isBlock = /^language-/.test(className ?? "");
    if (isBlock) {
      return (
        <code className={cn("text-sm font-mono", className)}>{children}</code>
      );
    }
    // Inline code
    const text = String(children).trim();
    if (isKeyboardShortcut(text)) return <KbdBadge>{text}</KbdBadge>;
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
        {children}
      </code>
    );
  },

  // ── Ordered lists as step cards ───────────────────────────────────────────
  ol({ children }) {
    return <StepList>{children}</StepList>;
  },

  // ── Tables with design-system styling ────────────────────────────────────
  table({ children }) {
    return (
      <div className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-primary-100">{children}</thead>;
  },
  tbody({ children }) {
    return <tbody>{children}</tbody>;
  },
  tr({ children }) {
    return <tr className="even:bg-muted/10">{children}</tr>;
  },
  th({ children }) {
    return (
      <th className="border-b border-border px-4 py-2 text-left font-semibold text-primary-700">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="border-b border-border px-4 py-2">{children}</td>
    );
  },

  // ── Paragraphs + typography ───────────────────────────────────────────────
  p({ children }) {
    return <p className="mb-3">{children}</p>;
  },
  strong({ children }) {
    return <strong className="font-semibold">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic">{children}</em>;
  },
  hr() {
    return <hr className="my-6 border-border" />;
  },
};

/**
 * Renders markdown content to React components using `react-markdown` + `remark-gfm`.
 * Supports callout cards, keyboard badges, anchor headings, styled tables, and step lists.
 * Content is embedded at build time — no network requests or dangerouslySetInnerHTML.
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("help-prose", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
