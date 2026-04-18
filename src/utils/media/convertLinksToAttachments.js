// utils/media/convertLinksToAttachments.js

export function convertLinksToAttachments(links = []) {
  return links
    .filter((l) => l.isMedia)
    .map((l) => {
      /* 🖼 IMAGE */
      if (l.type === "image") {
        return {
          url: l.url,
          type: "image/link",
          name: "Image",
        };
      }

      /* 📄 PDF */
      if (l.type === "pdf") {
        return {
          url: l.url,
          type: "application/pdf",
          name: "PDF",
        };
      }

      /* 🎥 VIDEO (FIXED) */
      if (
        l.type === "youtube" ||
        l.type === "vimeo" ||
        l.type === "video"
      ) {
        return {
          url: l.url,
          embed: l.embed || l.url, // 🔥 fallback fix
          type: "video/link",
          name: "Video",
        };
      }

      return null;
    })
    .filter(Boolean);
}