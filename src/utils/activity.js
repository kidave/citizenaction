export function getActivityDate(post) {
  if (!post) {
    return null;
  }

  const value = post.start_at || post.created_at;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}
