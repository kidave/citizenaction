// utils/normalize.js

export function normalizeUrl(value) {
  if (!value) return null;

  let url = value.trim();
  if (url === "") return null;

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
