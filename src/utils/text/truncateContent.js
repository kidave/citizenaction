export default function truncateContent(content, limit = 280) {
  if (!content) {
    return {
      text: "",
      isLong: false,
    };
  }

  const isLong = content.length > limit;

  if (!isLong) {
    return {
      text: content,
      isLong: false,
    };
  }

  return {
    text: content.slice(0, limit) + "...",
    isLong: true,
  };
}
