export default function getDisplayStatus(
  post
) {
  return (
    post.status ||
    post.lifecycle_status ||
    null
  );
}