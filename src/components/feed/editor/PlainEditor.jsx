"use client";

import { useEffect, useRef } from "react";

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
  showTitle = false,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height =
      Math.min(textarea.scrollHeight, window.innerHeight * 0.32) + "px";
  }, [content]);

  function handleChange(event) {
    const value = event.target.value;
    const textarea = textareaRef.current;

    if (textarea) {
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
            blocks: [
              {
                type: "paragraph",
                data: {
                  text: value,
                },
              },
            ],
          }
        : null,
    );
  }

  return (
    <div className="flex min-h-0 flex-col">
      {showTitle && (
        <div className="px-3 pt-3">
          <Input
            placeholder="Post title..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-10 border-none bg-muted/70 shadow-none focus-visible:ring-0"
            onFocus={onFocus}
          />
        </div>
      )}

      <Textarea
        ref={textareaRef}
        rows={3}
        placeholder="Write your post..."
        value={content || ""}
        onChange={handleChange}
        onFocus={onFocus}
        className="min-h-[76px] max-h-[32vh] resize-none overflow-y-auto border-none bg-transparent px-4 py-3 text-base shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
