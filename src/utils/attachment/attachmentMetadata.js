export async function extractAttachmentMetadata(file) {
  return {
    name: file.name,

    size: file.size,

    type: file.type,

    lastModified: file.lastModified,
  };
}
