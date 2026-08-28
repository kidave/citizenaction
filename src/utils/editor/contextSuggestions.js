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

function formatSuggestedMonth(date) {
  return new Intl.DateTimeFormat("en-IN", {
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

function detectPrecision(result) {
  const text = result.text || "";
  const start = result.start;
  const hasTime = Boolean(
    start?.isCertain?.("hour") ||
      start?.isCertain?.("minute") ||
      /\b(?:am|pm|a\.m\.|p\.m\.)\b/i.test(text),
  );

  if (hasTime) return "datetime";

  // Chrono represents an input such as "September" as a month-level
  // reference. Preserve that precision instead of turning it into an
  // arbitrary first-of-month date in the UI.
  const normalized = text.trim().toLowerCase();
  const monthOnly = /^(?:the\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+\d{4})?$/i.test(
    normalized,
  );

  if (monthOnly) return "month";

  return "date";
}

export function extractDateCandidates(text = "") {
  if (!text?.trim()) return [];

  const reference = referenceDate();
  const results = chrono.parse(text, reference, {
    forwardDate: false,
  });

  return results
    .map((result) => {
      const start = result.start?.date?.();
      if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
        return null;
      }

      const precision = detectPrecision(result);
      const end = result.end?.date?.() || null;
      const hasTime = precision === "datetime";

      let label = formatSuggestedDateOnly(start);
      if (precision === "month") label = formatSuggestedMonth(start);
      if (precision === "datetime") label = formatSuggestedDate(start);

      return {
        type: "date",
        precision,
        value: start.toISOString(),
        endValue:
          end instanceof Date && !Number.isNaN(end.getTime())
            ? end.toISOString()
            : null,
        label,
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
            item.endValue === candidate.endValue &&
            item.precision === candidate.precision,
        ) === index,
    );
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