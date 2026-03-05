"use client";

import { Textarea } from "@/components/ui/textarea";

export default function PostEditorContent({ content, setContent }) {

  return (
    <Textarea
      placeholder="Document your action."
      value={content}
      onChange={(e) => {
        setContent(e.target.value)
        e.target.style.height = "auto"
        e.target.style.height = e.target.scrollHeight + "px"
      }}
      className="min-h-[160px] resize-none overflow-hidden"
    />
  );
}