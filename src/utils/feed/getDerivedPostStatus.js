import {
  isAfter,
  isBefore,
} from "date-fns";

export default function getDerivedPostStatus(
  post,
  config
) {
  if (
    !config.lifecycle ||
    !post?.start_at
  ) {
    return null;
  }

  const now = new Date();

  const start =
    new Date(post.start_at);

  const end = post.end_at
    ? new Date(post.end_at)
    : null;

  // =====================================================
  // RANGE TYPE
  // =====================================================

  if (
    config.displayMode ===
    "range"
  ) {
    if (
      end &&
      isAfter(now, end)
    ) {
      return "completed";
    }

    if (
      isAfter(now, start) &&
      (!end ||
        isBefore(now, end))
    ) {
      return "ongoing";
    }

    return "planned";
  }

  // =====================================================
  // LIFECYCLE TYPE
  // =====================================================

  if (
    end &&
    isAfter(now, end)
  ) {
    return "ended";
  }

  if (
    isAfter(now, start) &&
    (!end ||
      isBefore(now, end))
  ) {
    return "live";
  }

  return "upcoming";
}