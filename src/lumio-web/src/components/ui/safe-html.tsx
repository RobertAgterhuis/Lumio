"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

interface SafeHtmlProps {
  html: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  /** DOMPurify configuration overrides */
  purifyConfig?: DOMPurify.Config;
}

const DEFAULT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "em", "b", "i", "u", "s",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "a", "code", "pre", "blockquote",
    "table", "thead", "tbody", "tr", "th", "td",
    "hr", "img", "span", "div", "sub", "sup",
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel", "title", "alt", "src",
    "class", "id", "width", "height",
  ],
  ALLOW_DATA_ATTR: false,
};

/**
 * Renders HTML content safely by sanitizing it with DOMPurify.
 * Use this instead of `dangerouslySetInnerHTML` anywhere in the app.
 *
 * @example
 * <SafeHtml html="<strong>Bold</strong> text" />
 * <SafeHtml html={markdownHtml} as="div" className="prose" />
 */
export function SafeHtml({
  html,
  className,
  as: Tag = "div",
  purifyConfig,
}: SafeHtmlProps) {
  const config = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...purifyConfig }),
    [purifyConfig]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DOMPurify Config type mismatch (PARSER_MEDIA_TYPE: string vs DOMParserSupportedType)
  const sanitized = useMemo(
    () => DOMPurify.sanitize(html, config as any),
    [html, config]
  );

  return (
    <Tag
      className={cn(className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
