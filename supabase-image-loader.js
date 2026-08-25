const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function supabaseImageLoader({ src, width, quality }) {
  if (!projectUrl || !src) {
    return src;
  }

  const url = new URL(src, projectUrl);

  if (url.hostname !== new URL(projectUrl).hostname) {
    return src;
  }

  if (!url.pathname.startsWith("/storage/v1/object/public/")) {
    return src;
  }

  const renderPath = url.pathname.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/",
  );

  const params = new URLSearchParams(url.search);
  params.set("width", String(width));
  params.set("quality", String(quality || 75));

  return `${url.origin}${renderPath}?${params.toString()}`;
}
