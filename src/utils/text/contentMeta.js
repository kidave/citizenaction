export function extractContentMeta(text) {
  if (!text) {
    return {
      extracted_links: [],
      hashtags: [],
    };
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const hashtagRegex = /#(\w+)/g;

  const extracted_links = text.match(urlRegex) || [];

  const hashtags = [...text.matchAll(hashtagRegex)].map((m) => m[1]);

  return {
    extracted_links,
    hashtags,
  };
}
