// utils/media/mediaNormalizer.js

export function normalizeMedia(attachments = [], links = []) {
  const normalizedAttachments = attachments.map((file) => ({
    url: file.url,
    type: file.type?.startsWith("image/")
      ? "image"
      : file.type === "application/pdf"
      ? "pdf"
      : "file",
    source: "attachment",
    original: file,
  }));

  const normalizedLinks = links.map((link) => ({
    url: link.url,
    type: link.type,
    embed: link.embed,
    source: "link",
    original: link,
  }));

  return [...normalizedAttachments, ...normalizedLinks];
}