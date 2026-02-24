"use client";

import { useMemo } from "react";
import { marked } from "marked";
import { cn } from "@/lib/utils";

// Configure marked for safe, synchronous rendering
marked.setOptions({ async: false, gfm: true, breaks: false });

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown content to HTML using the `marked` library.
 * Content is embedded at build time, so no runtime fetching is needed.
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = useMemo(() => {
    try {
      return marked.parse(content) as string;
    } catch {
      return "<p><em>Markdown kon niet worden weergegeven.</em></p>";
    }
  }, [content]);

  return (
    <div
      className={cn("help-prose", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
