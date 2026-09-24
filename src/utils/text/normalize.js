// utils/text/normalize.js

export function normalizeUrl(value) {
  if (!value) return "";

  let url = value.trim();

  if (!url) return "";

  // Convert Markdown links:
  // [https://example.com](https://example.com)
  // into:
  // https://example.com
  const markdownMatch = url.match(/^\[.*?\]\((https?:\/\/[^)]+)\)$/i);

  if (markdownMatch) {
    url = markdownMatch[1];
  }

  // Remove surrounding angle brackets
  url = url.replace(/^<|>$/g, "");

  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url;
}

export function normalizeText(value) {
  if (!value) return null;

  const v = value.trim();

  return v === "" ? null : v;
}
