"use client";

import AttachmentCarousel from "@/components/attachment/AttachmentCarousel";

export default function EditorResourcePreview({
  attachments = [],
  links = [],
  setAttachments,
  removable = false,
  showMetadata = true,
  size = "sm",
}) {
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
          onEdit={() => {}}
          onRemove={removeAttachment}
          onCreditNameChange={(index, value) =>
            updateAttachment(index, typeof value === "string" ? { credit_name: value } : value)
          }
        />
      </div>
    </>