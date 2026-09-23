"use client";

import EditorResourcePreview from "./EditorResourcePreview";

export default function EditorAttachments({
  attachments,
  setAttachments,
  links = [],
}) {
  return (
    <EditorResourcePreview
      attachments={attachments}
      links={links}
      setAttachments={setAttachments}
      removable
      showMetadata
      size="sm"
    />
  );
}
