export function resolveEditorImageUrls(contentJson, attachments = []) {
  if (!contentJson?.blocks?.length) {
    return contentJson;
  }

  if (!attachments.length) {
    return contentJson;
  }

  /*
   * Build:
   *
   * attachmentId -> permanent Supabase public URL
   */
  const urlByAttachmentId = new Map();

  for (const attachment of attachments) {
    if (attachment?.attachmentId && attachment?.public_url) {
      urlByAttachmentId.set(attachment.attachmentId, attachment.public_url);
    }
  }

  if (!urlByAttachmentId.size) {
    return contentJson;
  }

  /*
   * Replace only the image URL.
   *
   * Everything else in the Editor.js block remains unchanged:
   *
   * - caption
   * - stretched
   * - withBorder
   * - withBackground
   * - attachmentId
   */
  const blocks = contentJson.blocks.map((block) => {
    if (block?.type !== "image") {
      return block;
    }

    const attachmentId = block?.data?.file?.attachmentId;

    if (!attachmentId) {
      return block;
    }

    const publicUrl = urlByAttachmentId.get(attachmentId);

    if (!publicUrl) {
      return block;
    }

    return {
      ...block,

      data: {
        ...block.data,

        file: {
          ...block.data.file,
          url: publicUrl,
        },
      },
    };
  });

  return {
    ...contentJson,
    blocks,
  };
}
