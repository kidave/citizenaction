import * as chrono from "chrono-node";

function currentYear() {
  return new Date().getFullYear();
}

function referenceDate() {
  return new Date();
}

export function formatSuggestedDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatSuggestedDateOnly(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatSuggestedTime(date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function extractDateCandidates(text = "") {
  if (!text?.trim()) return [];

  const reference = referenceDate();
  const results = chrono.parse(text, reference, {
    forwardDate: false,
  });

  const candidates = results
    .map((result) => {
      const start = result.start?.date?.();
      if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
        return null;
      }

      const hasTime = Boolean(
        result.start?.isCertain?.("hour") ||
          result.start?.isCertain?.("minute") ||
          result.text?.match(/\b(?:am|pm|a\.m\.|p\.m\.)\b/i),
      );

      const end = result.end?.date?.() || null;

      return {
        type: "date",
        value: start.toISOString(),
        endValue: end instanceof Date && !Number.isNaN(end.getTime())
          ? end.toISOString()
          : null,
        label: hasTime ? formatSuggestedDate(start) : formatSuggestedDateOnly(start),
        timeLabel: hasTime ? formatSuggestedTime(start) : null,
        source: result.text,
        index: result.index,
        hasTime,
      };
    })
    .filter(Boolean)
    .filter(
      (candidate, index, list) =>
        list.findIndex(
          (item) =>
            item.value === candidate.value &&
            item.endValue === candidate.endValue,
        ) === index,
    );

  return candidates;
}

export function extractDateCandidate(text) {
  return extractDateCandidates(text)[0] ?? null;
}

function cleanLocation(value) {
  return value
    .replace(/\b(?:on|at|near|in)\s+$/i, "")
    .replace(/[,:;]+$/, "")
    .trim();
}

export function extractLocationCandidates(text = "") {
  if (!text) return [];

  const patterns = [
    /\b(?:at|near|in)\s+([A-Za-z][^.!?\n]{2,80})/gi,
    /\b(?:venue|location|place)\s*[:\-]\s*([^.!?\n]{3,80})/gi,
    /\b((?:[^.!?\n]+\s+)?(?:Road|Rd|Street|St|Circle|Junction|Gymkhana|Ground|Garden|Park|School|College|Station|Hospital|Market|Office)\b(?:\s+[^.!?\n]{0,50})?)/gi,
  ];

  const candidates = [];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const query = cleanLocation(match[1] || match[0]);
      if (query.length >= 3) {
        candidates.push({ type: "location", query, source: match[0] });
      }
    }
  }

  const unique = new Map();
  candidates.forEach((candidate) => {
    const key = candidate.query.toLowerCase();
    if (!unique.has(key)) unique.set(key, candidate);
  });

  return Array.from(unique.values());
}

export function extractLocationCandidate(text) {
  return extractLocationCandidates(text)[0] ?? null;
}

export { currentYear };