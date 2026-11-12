"use client";

import { useMemo } from "react";
import { sanitizeHtml } from "./editorUtils";

export default function EditorRichText({ html = "" }) {
  const safeHtml = useMemo(() => sanitizeHtml(html), [html]);

  return (
    <span
      className="[&_a]:text-info [&_a]:break-all [&_a]:hover:underline"
      dangerouslySetInnerHTML={{
        __html: safeHtml,
      }}
    />
  );
}
