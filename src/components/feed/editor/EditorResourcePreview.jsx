"use client";

import { useState } from "react";
import AttachmentCarousel from "@/components/attachment/AttachmentCarousel";
import AttachmentEditorDialog from "./AttachmentEditorDialog";

export default function EditorResourcePreview({
  attachments = [],
  links = [],
  setAttachments,
  removable = false,
  showMetadata = true,
  size = "sm",
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const itemCount = (attachments?.length || 0) + (links?.length || 0);

  if (!itemCount) return null;

  const updateAttachment = (index, updates) => {
    if (!updates) return;

    setAttachments?.((prev) =>
      prev.map((attachment, i) =>
        i === index ? { ...attachment, ...updates } : attachment,
      ),
    );
  };

  const removeAttachment = (index) => {
    setAttachments?.((prev) => prev.filter((_, i) => i !== index));

    setEditingIndex((current) => {
      if (current === null) return null;
      if (attachments.length <= 1) return null;
      return Math.min(current, attachments.length - 2);
    });
  };

  return (
    <>
      <div className="shrink-0 border-t bg-background px-2 py-2 sm:px-3">
        <AttachmentCarousel
          attachments={attachments}
          links={links}
          showMetadata={showMetadata}
          removable={removable}
          size={size}
          onAttachmentClick={() => {}}
          onEdit={(index) => setEditingIndex(index)}
          onRemove={removeAttachment}
          onCreditNameChange={(index, value) =>
            updateAttachment(index, { credit_name: value })
          }
        />
      </div>

      <AttachmentEditorDialog
        attachments={attachments}
        open={editingIndex !== null}
        index={editingIndex ?? 0}
        onOpenChange={(open) => {
          if (!open) setEditingIndex(null);
        }}
        onChange={updateAttachment}
        onRemove={removeAttachment}
        onIndexChange={setEditingIndex}
      />
    </>
  );
}
