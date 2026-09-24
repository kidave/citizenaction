export function normalizeUrl(value) {
  if (!value) return "";

  let url = value.trim();

  if (!url) return "";

  // Allow users to paste "youtube.com/..." without https://
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url;
}

export function getHostname(url) {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function detectLinkType(url) {
  const hostname = getHostname(url);

  if (!hostname) {
    return "website";
  }

  // YouTube
  if (
    hostname === "youtube.com" ||
    hostname === "youtu.be" ||
    hostname.endsWith(".youtube.com")
  ) {
    return "youtube";
  }

  // Zoom
  if (hostname === "zoom.us" || hostname.endsWith(".zoom.us")) {
    return "zoom";
  }

  // Google Meet
  if (hostname === "meet.google.com" || hostname.endsWith(".meet.google.com")) {
    return "google_meet";
  }

  // Microsoft Teams
  if (
    hostname === "teams.microsoft.com" ||
    hostname === "teams.live.com" ||
    hostname.endsWith(".teams.microsoft.com")
  ) {
    return "teams";
  }

  // Google Maps
  if (
    hostname === "maps.google.com" ||
    hostname === "google.com" ||
    hostname.endsWith(".google.com")
  ) {
    if (url.includes("/maps") || url.includes("maps.app.goo.gl")) {
      return "maps";
    }
  }

  // Instagram
  if (hostname === "instagram.com" || hostname.endsWith(".instagram.com")) {
    return "instagram";
  }

  // Facebook
  if (hostname === "facebook.com" || hostname.endsWith(".facebook.com")) {
    return "facebook";
  }

  // X / Twitter
  if (
    hostname === "x.com" ||
    hostname === "twitter.com" ||
    hostname.endsWith(".x.com") ||
    hostname.endsWith(".twitter.com")
  ) {
    return "x";
  }

  // LinkedIn
  if (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")) {
    return "linkedin";
  }

  // Google Forms
  if (hostname === "docs.google.com" && url.includes("/forms/")) {
    return "google_form";
  }

  return "website";
}

export function getLinkTypeLabel(type) {
  switch (type) {
    case "youtube":
      return "YouTube";

    case "zoom":
      return "Zoom";

    case "google_meet":
      return "Google Meet";

    case "teams":
      return "Microsoft Teams";

    case "maps":
      return "Google Maps";

    case "instagram":
      return "Instagram";

    case "facebook":
      return "Facebook";

    case "x":
      return "X";

    case "linkedin":
      return "LinkedIn";

    case "google_form":
      return "Google Form";

    default:
      return "Website";
  }
}
