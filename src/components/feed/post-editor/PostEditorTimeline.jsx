"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";

import PostTimelineModal from "./PostTimelineModal";

export default function PostEditorTimeline({ editor }) {
  const { timeline } = editor;

  const [open, setOpen] = useState(false);

  return (
    <>
      <Field>

          <FieldLabel className="flex items-center gap-2">
            Timeline
            <span className="text-xs text-muted-foreground">
            (optional)
            </span>
          </FieldLabel>

          <Button variant="outline" onClick={() => setOpen(true)}>
            Manage Timeline
          </Button>

      </Field>

      <PostTimelineModal
        open={open}
        onOpenChange={setOpen}
        editor={editor}
      />
    </>
  );
}