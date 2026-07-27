"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditorContent({
  mode = "post",
  title,
  setTitle,
  content,
  setContent,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Input
        placeholder={
          mode === "post" ? "Add a title..." : "Contribution title..."
        }
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-10 shrink-0 bg-muted"
      />

      <Textarea
        placeholder={
          mode === "post"
            ? "Document your action."
            : "Describe your contribution."
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-0 flex-1 resize-none bg-muted"
      />
    </div>
  );
}
