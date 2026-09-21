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
    setEditingIndex(null);
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
            updateAttachment(index, typeof value === "string" ? { credit_name: value } : value)
          }
        />
      </div>

      <AttachmentEditorDialog
        attachments={attachments}
        open={editingIndex !== null}
        index={editingIndex ?? 0}
        onOpenChange={(open) => { if (!open) setEditingIndex(null); }}
        onChange={(index, updates) => {
          setAttachments?.((prev) => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
        }}
        onRemove={removeAttachment}
        onIndexChange={setEditingIndex}
      />
    </>
    