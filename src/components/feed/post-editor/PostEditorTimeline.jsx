"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Route } from "lucide-react";

import PostTimelineModal from "./PostTimelineModal";

export default function PostEditorTimeline({ editor }) {
  const { type, timeline } = editor;

  const showTimeline = ["event", "report", "update"].includes(type);

  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`flex w-[160px] items-center gap-2 ${
          !showTimeline ? "pointer-events-none opacity-0" : ""
        }`}
      >
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2"
        >
          <Route />
          Timeline
        </Button>
      </div>

      <PostTimelineModal open={open} onOpenChange={setOpen} editor={editor} />
    </>
  );
}
