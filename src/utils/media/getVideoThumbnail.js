// utils/media/getVideoThumbnail.js

export function getVideoThumbnail(url) {
  try {
    // YouTube
    if (url.includes("youtube.com/watch")) {
      const id = new URL(url).searchParams.get("v");
      return id
        ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
        : null;
    }

    if (url.includes("youtu.be")) {
      const id = url.split("/").pop().split("?")[0];
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }

    // Vimeo (fallback)
    if (url.includes("vimeo.com")) {
      return null; // requires API, skip for now
    }
  } catch {
    return null;
  }

  return null;
}