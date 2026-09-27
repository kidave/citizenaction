import * as chrono from "chrono-node";

function currentYear() {
  return new Date().getFullYear();
}

function referenceDate() {
  return new Date();
}

function safeDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date, options) {
  const safe = safeDate(date);
  if (!safe) return "";

  return new Intl.DateTimeFormat("en-IN", options).format(safe);
}

export function formatSuggestedDate(date) {
  return formatDate(date, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSuggestedMonth(date) {
  return formatDate(date, {
    month: "long",
    year: "numeric",
  });
}

function detectPrecision(result) {
  const normalized = String(result.text || "").trim().toLowerCase();

  if (/^\d{4}$/.test(normalized)) return "year";

  const monthOnly =
    /^(?:the\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+\d{4})?$/i.test(
      normalized,
    );

  if (monthOnly) return "month";

  return "date";
}

function hasExplicitYear(text) {
  return /\b(?:19|20)\d{2}\b/.test(String(text || ""));
}

function normalizeDatePrecision(date, precision, text) {
  const next = new Date(date);

  if (precision === "year") {
    next.setMonth(0, 1);
    next.setHours(12, 0, 0, 0);
    return next;
  }

  if (!hasExplicitYear(text)) {
    next.setFullYear(currentYear());
  }

  if (precision === "month") {
    next.setDate(1);
  }

  next.setHours(12, 0, 0, 0);

  return next;
}

export function extractDateCandidates(text = "") {
  if (!text?.trim()) return [];

  const reference = referenceDate();
  const results = chrono.parse(text, reference, {
    forwardDate: false,
  });

  return results
    .map((result) => {
      const parsed = safeDate(result.start?.date?.());
      if (!parsed) return null;

      const precision = detectPrecision(result);
      const value = normalizeDatePrecision(parsed, precision, result.text);

      let label = formatSuggestedDate(value);

      if (precision === "year") {
        label = formatDate(value, { year: "numeric" });
      } else if (precision === "month") {
        label = formatSuggestedMonth(value);
      }

      return {
        type: "date",
        precision,
        value: value.toISOString(),
        label,
        source: result.text,
        index: result.index,
      };
    })
    .filter(Boolean)
    .filter(
      (candidate, index, list) =>
        list.findIndex(
          (item) =>
            item.value === candidate.value &&
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
