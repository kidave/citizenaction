import { getActivityDate } from "@/utils/activity";

/*
 * ==========================================================
 * TIMELINE DATE
 * ==========================================================
 */

export function getTimelineDate(event) {
  return getActivityDate(event);
}

/*
 * ==========================================================
 * MONTH KEY
 * ==========================================================
 */

export function getTimelineMonthKey(event) {
  const date = getTimelineDate(event);

  if (!date) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

/*
 * ==========================================================
 * YEAR
 * ==========================================================
 */

export function getTimelineYear(event) {
  const date = getTimelineDate(event);

  return date?.getFullYear() ?? null;
}

/*
 * ==========================================================
 * MONTH LABEL
 * ==========================================================
 */

export function getTimelineMonthLabel(monthKey) {
  if (!monthKey) {
    return "";
  }

  const [year, month] = monthKey.split("-").map(Number);

  const date = new Date(year, month - 1, 1);

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/*
 * ==========================================================
 * FILTER EVENTS
 * ==========================================================
 *
 * Filters by activity type and sorts chronologically.
 *
 * Timeline order:
 * oldest → newest
 */

export function filterTimelineEvents(events, filter) {
  if (!Array.isArray(events)) {
    return [];
  }

  const filtered =
    filter === "all"
      ? events.filter(Boolean)
      : events.filter((event) => event && event.type === filter);

  return [...filtered].sort((a, b) => {
    const dateA = getTimelineDate(a);
    const dateB = getTimelineDate(b);

    if (!dateA && !dateB) {
      return 0;
    }

    if (!dateA) {
      return 1;
    }

    if (!dateB) {
      return -1;
    }

    return dateA.getTime() - dateB.getTime();
  });
}

/*
 * ==========================================================
 * YEARS
 * ==========================================================
 */

export function getTimelineYears(events) {
  if (!Array.isArray(events)) {
    return [];
  }

  const years = events.map(getTimelineYear).filter((year) => year !== null);

  return Array.from(new Set(years)).sort((a, b) => a - b);
}

/*
 * ==========================================================
 * MONTH MARKERS
 * ==========================================================
 *
 * Creates one marker for every month represented
 * in the timeline.
 *
 * Markers are always chronological.
 */

export function getTimelineMonthMarkers(events) {
  if (!Array.isArray(events)) {
    return [];
  }

  const months = new Map();

  events.forEach((event) => {
    const date = getTimelineDate(event);

    if (!date) {
      return;
    }

    const key = getTimelineMonthKey(event);

    if (!key) {
      return;
    }

    if (!months.has(key)) {
      months.set(key, {
        key,
        label: getTimelineMonthLabel(key),
        year: date.getFullYear(),
        month: date.getMonth(),
        date,
      });
    }
  });

  return Array.from(months.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ date, month, ...marker }) => marker);
}

/*
 * ==========================================================
 * CHECK MONTH
 * ==========================================================
 */

export function hasTimelineMonth(monthMarkers, monthKey) {
  if (!Array.isArray(monthMarkers)) {
    return false;
  }

  return monthMarkers.some((month) => month.key === monthKey);
}
