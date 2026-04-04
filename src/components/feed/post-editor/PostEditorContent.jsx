"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PostEditorContent({
  title,
  setTitle,
  content,
  setContent,
}) {
  return (
    <div className="space-y-3">

      {/* TITLE */}
      <Input
        placeholder="Add a title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-base font-medium"
      />

      {/* CONTENT */}
      <Textarea
        placeholder="Document your action."
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = e.target.scrollHeight + "px";
        }}
        className="min-h-[140px] resize-none overflow-hidden"
      />

    </div>
  );
}