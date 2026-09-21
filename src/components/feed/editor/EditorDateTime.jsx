"use client";

import ActionDatePicker from "./ActionDatePicker";

export default function EditorDateTime({ editor }) {
  return (
    <ActionDatePicker
      value={editor.start_at}
      precision={editor.datePrecision || "date"}
      onChange={({ value, precision }) => {
        editor.setStartAt(value);
        editor.setEndAt(null);
        editor.setDatePrecision?.(precision);
      }}
    />
  );
}
