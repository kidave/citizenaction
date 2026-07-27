"use client";

import AttachmentCarousel from "@/components/attachment/AttachmentCarousel";

export default function EditorAttachments({ attachments, setAttachments }) {
  if (!attachments?.length) return null;

  return (
    <div className="border-t p-3">
      <AttachmentCarousel
        attachments={attachments}
        showMetadata={false}
        onAttachmentClick={() => {}}
        onRemove={(index) =>
          setAttachments((prev) => prev.filter((_, i) => i !== index))
        }
        removable
      />
    </div>
  );
}
