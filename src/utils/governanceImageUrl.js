export function isValidGovernanceImageUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !host.includes(":") &&
      !/^\d{1,3}(\.\d{1,3}){3}$/.test(host) &&
      host !== "localhost" &&
      !host.endsWith(".localhost") &&
      !host.endsWith(".local") &&
      !host.endsWith(".internal")
    );
  } catch {
    return false;
  }
}

export const GOVERNANCE_IMAGE_URL_HELPER_TEXT =
  "Use a direct HTTPS image URL from Instagram, X, Facebook, LinkedIn, or another public website. The link must return an image file; webpage links are not imported.";
