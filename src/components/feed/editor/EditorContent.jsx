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
    <div className="flex h-full flex-col space-y-3">
      <Input
        placeholder={
          mode === "post" ? "Add a title..." : "Contribution title..."
        }
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-muted"
      />

      <Textarea
        placeholder={
          mode === "post"
            ? "Document your action."
            : "Describe your contribution."
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 resize-y bg-muted"
      />
    </div>
  );
}
