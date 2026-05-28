import {
  format,
  formatDistanceToNowStrict,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  differenceInDays,
  isSameYear,
} from "date-fns";

export function getPostDateState(post) {
  if (!post?.start_at) {
    return null;
  }

  const start = new Date(post.start_at);

  const end = post.end_at ? new Date(post.end_at) : null;

  const now = new Date();

  const isMeeting = post.type === "meeting";

  const isEvent = post.type === "event";

  const hasLifecycle = isMeeting || isEvent;

  // =========================================================
  // UPDATE TYPE
  // =========================================================

  if (post.type === "update") {
    return {
      mode: "month",

      label: format(start, "MMMM yyyy"),
    };
  }

  // =========================================================
  // NORMAL POSTS
  // =========================================================

  if (!hasLifecycle) {
    return {
      mode: "simple",

      date: format(start, isSameYear(start, now) ? "d MMMM" : "d MMMM yyyy"),

      time: format(start, "h:mm a"),
    };
  }

  // =========================================================
  // MEETING / EVENT
  // =========================================================

  const isEnded = end && isAfter(now, end);

  const isLive = isAfter(now, start) && (!end || isBefore(now, end));

  const daysLeft = differenceInDays(start, now);

  return {
    mode: "lifecycle",

    isEnded,
    isLive,

    isUpcoming: !isLive && !isEnded,

    isSoon: daysLeft <= 7 && daysLeft >= 0,

    countdown: !isEnded && !isLive ? formatDistanceToNowStrict(start) : null,

    relativeDay: isToday(start)
      ? "Today"
      : isTomorrow(start)
        ? "Tomorrow"
        : format(start, "EEE, d MMMM"),

    startTime: format(start, "h:mm a"),

    endTime: end ? format(end, "h:mm a") : null,
  };
}
