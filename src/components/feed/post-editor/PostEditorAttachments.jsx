"use client";

import AttachmentPicker from "@/components/ui/AttachmentPicker";

export default function PostEditorAttachments({ attachments, setAttachments }) {
  return (
    <AttachmentPicker
      attachments={attachments}
      onUpload={(file) => setAttachments((prev) => [...prev, file])}
      onRemove={(index) =>
        setAttachments((prev) => prev.filter((_, i) => i !== index))
      }
    />
  );
}
