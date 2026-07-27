"use client";

import AttachmentCard from "./AttachmentCard";

export default function AttachmentGrid({
  attachments = [],
  onClick,
  onRemove,
}) {
  if (!attachments.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {attachments.map((attachment, index) => (
        <AttachmentCard
          key={attachment.id}
          attachment={attachment}
          index={index}
          onClick={onClick}
          onRemove={onRemove}
          removable
        />
      ))}
    </div>
  );
}
