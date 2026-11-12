const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let projectHost = null;

try {
  projectHost = projectUrl ? new URL(projectUrl).hostname : null;
} catch {
  projectHost = null;
}

export default function supabaseImageLoader({ src, width, quality }) {
  if (!projectUrl || !projectHost || !src) return src;

  try {
    const url = new URL(src, projectUrl);

    if (url.hostname !== projectHost || !url.pathname.startsWith("/storage/v1/object/public/")) {
      return src;
    }

    const renderPath = url.pathname.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/",
    );

    const params = new URLSearchParams(url.search);
    if (width) params.set("width", String(width));
    params.set("quality", String(quality || 75));

    // Preserve existing cache-busting/version parameters from Storage URLs.
    return `${url.origin}${renderPath}?${params.toString()}`;
  } catch {
    return src;
  }
}
