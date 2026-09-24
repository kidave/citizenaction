"use client";

import { useMemo } from "react";
import { sanitizeHtml } from "./editorUtils";

export default function EditorRichText({ html = "" }) {
  const safeHtml = useMemo(() => sanitizeHtml(html), [html]);

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: safeHtml,
      }}
    />
  );
}
