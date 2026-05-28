export function extractContentMeta(text) {
  if (!text) {
    return { links: [], hashtags: [] };
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const hashtagRegex = /#(\w+)/g;

  const links = text.match(urlRegex) || [];
  const hashtags = [...text.matchAll(hashtagRegex)].map((m) => m[1]);

  return { links, hashtags };
}
