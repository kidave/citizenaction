import { isAfter, isBefore } from "date-fns";

export default function getDerivedPostStatus(post, config, now = null) {
  if (!config.lifecycle || !post?.start_at) {
    return null;
  }

  // Prevent SSR hydration mismatch
  if (!now) {
    return null;
  }

  const start = new Date(post.start_at);

  const end = post.end_at ? new Date(post.end_at) : null;

  // =====================================================
  // RANGE TYPE
  // =====================================================

  if (config.displayMode === "range") {
    if (end && isAfter(now, end)) {
      return "completed";
    }

    if (isAfter(now, start) && (!end || isBefore(now, end))) {
      return "ongoing";
    }

    return "planned";
  }

  // =====================================================
  // LIFECYCLE TYPE
  // =====================================================

  if (end && isAfter(now, end)) {
    return "ended";
  }

  const joinWindow = new Date(start.getTime() - 15 * 60 * 1000);

  if (isAfter(now, joinWindow) && (!end || isBefore(now, end))) {
    return "live";
  }

  return "upcoming";
}
