// utils/media/linkParser.js

import { normalizeUrl } from "@/utils/text/normalize";

export function getLinkType(url) {
  if (!url) return "unknown";

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }

  if (url.includes("vimeo.com")) {
    return "vimeo";
  }

  if (/\.(mp4|webm|ogg)$/i.test(url)) {
    return "video";
  }

  if (url.toLowerCase().includes(".pdf")) {
    return "pdf";
  }

  if (/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) {
    return "image";
  }

  return "link";
}

export function getEmbedUrl(url) {
  if (!url) return null;

  try {
    if (url.includes("youtube.com/watch")) {
      const id = new URL(url).searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.includes("youtu.be")) {
      const id = url.split("/").pop().split("?")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.includes("vimeo.com")) {
      const id = url.split("/").pop().split("?")[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function parseLinks(rawLinks = []) {
  return rawLinks
    .map(normalizeUrl)
    .filter(Boolean)
    .map((url) => {
      const type = getLinkType(url);
      const embed = getEmbedUrl(url);

      const isMedia =
        type === "youtube" ||
        type === "vimeo" ||
        type === "video" ||
        type === "image" ||
        type === "pdf";

      return {
        url,
        type,
        embed,
        isMedia,
      };
    });
}
