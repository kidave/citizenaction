"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PlainEditor({
  title,
  setTitle,

  content,
  setContent,

  setContentJson,
  setContentFormat,

  onFocus,

  editorConfig,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Input
        placeholder={`${editorConfig.label} title...`}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="h-10 shrink-0 bg-muted"
        onFocus={onFocus}
      />

      <Textarea
        placeholder={editorConfig.placeholder}
        value={content || ""}
        onChange={(event) => {
          const value = event.target.value;

          setContent(value);

          setContentFormat("text");

          setContentJson(null);
        }}
        onFocus={onFocus}
        className="min-h-0 flex-1 resize-none bg-muted"
      />
    </div>
  );
}
