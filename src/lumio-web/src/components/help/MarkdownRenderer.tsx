"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight markdown-to-HTML renderer for the user manual.
 * Handles: headings, bold, italic, ordered/unordered lists,
 * blockquotes, inline code, horizontal rules, and paragraphs.
 *
 * No external dependencies — the user-manual content is controlled
 * and uses only basic markdown features.
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = useMemo(() => markdownToHtml(content), [content]);

  return (
    <div
      className={cn("help-prose", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ── Markdown → HTML conversion ───────────────────────────── */

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = inlineFormat(headingMatch[2]);
      const id = slugify(headingMatch[2]);
      output.push(`<h${level} id="${id}">${text}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      output.push("<hr />");
      i++;
      continue;
    }

    // Blockquote (may span multiple lines)
    if (line.startsWith("> ") || line === ">") {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      output.push(
        `<blockquote>${quoteLines.map((l) => `<p>${inlineFormat(l)}</p>`).join("")}</blockquote>`
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(inlineFormat(lines[i].replace(/^\d+\.\s/, "")));
        i++;
      }
      output.push(
        `<ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol>`
      );
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(inlineFormat(lines[i].replace(/^[-*]\s/, "")));
        i++;
      }
      output.push(
        `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`
      );
      continue;
    }

    // Paragraph (collect contiguous non-blank, non-special lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^#{1,4}\s/) &&
      !lines[i].startsWith("> ") &&
      lines[i] !== ">" &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      output.push(`<p>${inlineFormat(paraLines.join(" "))}</p>`);
    }
  }

  return output.join("\n");
}

/** Convert inline markdown formatting to HTML */
function inlineFormat(text: string): string {
  return (
    text
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Inline code
      .replace(/`(.+?)`/g, "<code>$1</code>")
  );
}

/** Generate a URL-safe slug from heading text */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
