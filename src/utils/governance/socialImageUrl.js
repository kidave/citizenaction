const SOCIAL_IMAGE_HOSTS = [
  "instagram.com", "cdninstagram.com", "fbcdn.net", "fbsbx.com",
  "facebook.com", "facebook.net", "linkedin.com", "licdn.com",
  "x.com", "twitter.com", "twimg.com",
];

export function isSupportedGovernanceImageSource(value) {
  try {
    const url = new URL(String(value || "").trim());
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && SOCIAL_IMAGE_HOSTS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}
