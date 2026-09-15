"use client";

import DOMPurify from "isomorphic-dompurify";

/** Prefer React nodes and plain text. Expanding this allowlist requires security review. */
export function SafeHtml({ html }: Readonly<{ html: string }>) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "strong", "em", "ul", "ol", "li", "br"],
    ALLOWED_ATTR: [],
  });
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
