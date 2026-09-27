"use client";

import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function PlainTextEditor({
  content,
  setContent,
  setContentJson,
  setContentFormat,
  onFocus,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (window.matchMedia("(max-width: 639px)").matches) {
      textarea.style.height = "100%";
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height =
      Math.min(textarea.scrollHeight, window.innerHeight * 0.32) + "px";
  }, [content]);

  function handleChange(event) {
    const value = event.target.value;
    const textarea = textareaRef.current;

    if (textarea && !window.matchMedia("(max-width: 639px)").matches) {
      textarea.style.height = "auto";
      textarea.style.height =
        Math.min(textarea.scrollHeight, window.innerHeight * 0.32) + "px";
    }

    setContent(value);
    setContentFormat("text");
    setContentJson(
      value.trim()
        ? {
            time: Date.now(),
            blocks: [{ type: "paragraph", data: { text: value } }],
          }
        : null,
    );
  }

  return (
    <Textarea
      ref={textareaRef}
      rows={3}
      placeholder="Write your post..."
      value={content || ""}
      onChange={handleChange}
      onFocus={onFocus}
      className="h-full min-h-0 flex-1 resize-none overflow-y-auto border-none bg-transparent px-4 py-3 text-base shadow-none focus-visible:ring-0 sm:h-auto sm:min-h-[76px] sm:max-h-[32vh] sm:flex-none"
    />
  );
}
