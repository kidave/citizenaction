import {
  format,
  formatDistanceToNowStrict,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  isSameYear,
} from "date-fns";

export function getPostDateState(post) {
  if (!post?.start_at) {
    return null;
  }

  const start = new Date(post.start_at);
  const end = post.end_at ? new Date(post.end_at) : null;
  const now = new Date();

  const isEnded = end ? isAfter(now, end) : false;
  const isLive = isAfter(now, start) && (!end || isBefore(now, end));

  if (!end) {
    return {
      mode: "simple",
      date: format(start, isSameYear(start, now) ? "d MMMM" : "d MMMM yyyy"),
      time: format(start, "h:mm a"),
    };
  }

  return {
    mode: "lifecycle",
    isEnded,
    isLive,
    isUpcoming: !isLive && !isEnded,
    isSoon: false,
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
