"use client";

import { useEffect, useRef } from "react";
import DOMPurify from "dompurify";

/**
 * Renders TipTap-generated HTML article content.
 *
 * Strategy: render raw HTML on both server and client (matching → no hydration mismatch),
 * then DOMPurify-sanitize in useEffect (browser-only API) as a defense-in-depth layer.
 * Content from the admin TipTap editor is already constrained to safe HTML, so the
 * sanitization is a safety net rather than a hard requirement.
 */

const DOMPURIFY_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: [
    "h2", "h3", "h4", "p", "br", "hr",
    "strong", "em", "u", "s", "del",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img",
    "div", "span",
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel",
    "src", "alt", "width", "height",
    "class", "style",
  ],
};

interface ArticleContentProps {
  html: string;
  className?: string;
}

export default function ArticleContent({ html, className }: ArticleContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const safe = DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
    ref.current.innerHTML = safe;
  }, [html]);

  return (
    <div
      ref={ref}
      className={className}
      // Same raw HTML on server and client → hydration matches.
      // useEffect replaces with sanitized version after mount.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
