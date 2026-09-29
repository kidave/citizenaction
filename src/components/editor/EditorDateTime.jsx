"use client";

import { useMemo } from "react";
import ActionDatePicker from "@/components/calendar/ActionDatePicker";
import { extractDateCandidate } from "@/utils/editor/contextSuggestions";

export default function EditorDateTime({ editor }) {
  const text = `${editor.title || ""}\n${editor.content || ""}`;
  const candidate = useMemo(() => extractDateCandidate(text), [text]);
  const suggestionValue = candidate?.value || null;
  const suggestionPrecision = candidate?.precision || "date";

  return (
    <ActionDatePicker
      value={editor.start_at}
      precision={editor.datePrecision || "date"}
      suggestionValue={suggestionValue}
      suggestionPrecision={suggestionPrecision}
      onChange={({ value, precision }) => {
        editor.setStartAt(value);
        editor.setEndAt(null);
        editor.setDatePrecision?.(precision);
      }}
    />
  );
}
