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

  const removeAttachment = (index) => {
    setAttachments?.((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="shrink-0 bg-background px-2 py-2 sm:px-3">
      <AttachmentCarousel
        attachments={attachments}
        links={links}
        showMetadata={showMetadata}
        removable={removable}
        size={size}
        onRemove={removeAttachment}
        onCreditNameChange={(index, value) =>
          setAttachments?.((prev) =>
            prev.map((attachment, i) =>
              i === index
                ? {
                    ...attachment,
                    ...(typeof value === "string"
                      ? { credit_name: value }
                      : value),
                  }
                : attachment,
            ),
          )
        }
      />
    </div>
  );
}
