const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
const PAGE_HOSTS = ["instagram.com", "facebook.com", "linkedin.com", "x.com", "twitter.com"];
const IMAGE_HOSTS = ["cdninstagram.com", "fbcdn.net", "fbsbx.com", "licdn.com", "twimg.com", "instagram.com", "facebook.com", "linkedin.com", "x.com", "twitter.com"];

function hostMatches(host: string, domains: string[]) {
  const normalized = host.toLowerCase();
  return domains.some((domain) => normalized === domain || normalized.endsWith(`.${domain}`));
}

function validateUrl(value: string, domains: string[]) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !hostMatches(url.hostname, domains)) {
    throw new Error("URL must use HTTPS and belong to a supported social-media domain.");
  }
  return url;
}

async function fetchWithAllowedRedirects(startUrl: string, allowedHosts: string[], accept: string) {
  let current = validateUrl(startUrl, allowedHosts);
  for (let attempt = 0; attempt <= 5; attempt += 1) {
    const response = await fetch(current.toString(), {
      method: "GET", redirect: "manual", signal: AbortSignal.timeout(15000),
      headers: { Accept: accept, "User-Agent": "CitizenAction/1.0" },
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get("location");
    if (!location || attempt === 5) throw new Error("The social-media URL redirected too many times.");
    current = validateUrl(new URL(location, current).toString(), allowedHosts);
  }
  throw new Error("Unable to resolve social-media URL.");
}

function decodeHtml(value: string) {
  return value.replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}

function readMetaContent(tag: string, wantedNames: string[]) {
  const attributes: Record<string, string> = {};
  const attributePattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = attributePattern.exec(tag))) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }
  const key = (attributes.property || attributes.name || "").toLowerCase();
  return wantedNames.includes(key) ? attributes.content || null : null;
}

async function resolveImageUrl(sourceUrl: string) {
  const source = validateUrl(sourceUrl, [...PAGE_HOSTS, ...IMAGE_HOSTS]);
  const host = source.hostname.toLowerCase();
  const directImageHost = hostMatches(host, ["cdninstagram.com", "fbcdn.net", "fbsbx.com", "licdn.com", "twimg.com"]);
  const hasImageExtension = /\.(?:jpe?g|png|webp)(?:$|\?)/i.test(source.toString());
  if (directImageHost || hasImageExtension) return source.toString();
  if (!hostMatches(host, PAGE_HOSTS)) {
    throw new Error("Use a public post URL or direct image URL from Instagram, LinkedIn, X, or Facebook.");
  }

  const pageResponse = await fetchWithAllowedRedirects(source.toString(), PAGE_HOSTS, "text/html,application/xhtml+xml");
  if (!pageResponse.ok) throw new Error(`Social-media page returned HTTP ${pageResponse.status}. It may require sign-in or may not be public.`);
  const pageType = (pageResponse.headers.get("content-type") || "").toLowerCase();
  if (!pageType.includes("text/html") && !pageType.includes("xhtml")) {
    throw new Error("The supplied URL did not return a public social-media page.");
  }
  const html = (await pageResponse.text()).slice(0, 2_000_000);
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  let imageUrl: string | null = null;
  for (const tag of tags) {
    imageUrl = readMetaContent(tag, ["og:image", "twitter:image", "twitter:image:src"]);
    if (imageUrl) break;
  }
  if (!imageUrl) throw new Error("No public preview image was found. The platform may restrict this post; try a direct image URL instead.");
  const candidate = new URL(imageUrl, pageResponse.url || source.toString());
  validateUrl(candidate.toString(), IMAGE_HOSTS);
  return candidate.toString();
}

export async function fetchSocialImage(sourceUrl: string) {
  const imageUrl = await resolveImageUrl(sourceUrl);
  const response = await fetchWithAllowedRedirects(imageUrl, IMAGE_HOSTS, "image/avif,image/webp,image/apng,image/*,*/*;q=0.8");
  if (!response.ok) throw new Error(`Remote image returned HTTP ${response.status}.`);
  const contentType = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
  const extension = ALLOWED_TYPES.get(contentType);
  if (!extension) throw new Error("The URL did not return a supported JPEG, PNG, or WebP image.");
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_BYTES) throw new Error("Image must be 5 MB or smaller.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.byteLength) throw new Error("Remote image was empty.");
  if (bytes.byteLength > MAX_BYTES) throw new Error("Image must be 5 MB or smaller.");
  return { bytes, contentType, extension };
}
