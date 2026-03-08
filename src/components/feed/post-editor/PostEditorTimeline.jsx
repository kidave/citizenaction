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

          <FieldLabel>Timeline</FieldLabel>

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