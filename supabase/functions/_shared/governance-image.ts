const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function validatePublicHttpsUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid image URL.");
  }
  const host = url.hostname.toLowerCase();
  const ipLiteral = /^\[?[0-9a-f:.]+\]?$/i.test(host);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    ipLiteral ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new Error("Only public HTTPS image URLs are supported.");
  }
  return url;
}

export async function fetchGovernanceImage(sourceUrl: string) {
  let url = validatePublicHttpsUrl(sourceUrl);
  let response: Response | null = null;

  for (let attempt = 0; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      response = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "image/jpeg,image/png,image/webp",
          "User-Agent": "CitizenAction/1.0",
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (attempt === 3) throw new Error("Image URL redirected too many times.");
      const location = response.headers.get("location");
      if (!location) throw new Error("Image URL returned an invalid redirect.");
      url = validatePublicHttpsUrl(new URL(location, url).toString());
      continue;
    }
    break;
  }

  if (!response || !response.ok) {
    throw new Error(`Remote image returned HTTP ${response?.status || 502}.`);
  }

  const contentType = (response.headers.get("content-type") || "")
    .split(";")[0]
    .toLowerCase();
  const extension = ALLOWED_TYPES.get(contentType);
  if (!extension) {
    throw new Error("URL must return a JPG, PNG, or WebP image file (webpage links are not supported).");
  }

  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_BYTES) throw new Error("Image must be 5 MB or smaller.");

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.byteLength) throw new Error("Remote image was empty.");
  if (bytes.byteLength > MAX_BYTES) throw new Error("Image must be 5 MB or smaller.");

  return { bytes, contentType, extension };
}
