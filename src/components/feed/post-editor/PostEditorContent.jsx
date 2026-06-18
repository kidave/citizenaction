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
    <div className="flex h-full flex-col space-y-3">
      <Input
        placeholder="Add a title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Textarea
        placeholder="Document your action."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 resize-y"
      />
    </div>
  );
}
