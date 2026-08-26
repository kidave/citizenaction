const MONTHS = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function currentYear() {
  return new Date().getFullYear();
}

function normalizeYear(year) {
  if (!year) return currentYear();
  const value = Number(year);
  if (value < 100) return 2000 + value;
  return value;
}

export function formatSuggestedDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildDate(day, month, year) {
  const date = new Date(year, month, day, 12, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function extractDateCandidates(text = "") {
  if (!text) return [];

  const monthNames = Object.keys(MONTHS).join("|");
  const current = currentYear();
  const candidates = [];

  const dayMonthPattern = new RegExp(
    `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames})(?:\\s*,?\\s*(\\d{4}))?\\b`,
    "gi",
  );

  const monthDayPattern = new RegExp(
    `\\b(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*,?\\s*(\\d{4}))?\\b`,
    "gi",
  );

  for (const match of text.matchAll(dayMonthPattern)) {
    const day = Number(match[1]);
    const month = MONTHS[match[2].toLowerCase()];
    const year = normalizeYear(match[3]);
    const value = buildDate(day, month, year);
    if (value) candidates.push({ type: "date", value: value.toISOString(), label: formatSuggestedDate(value), source: match[0] });
  }

  for (const match of text.matchAll(monthDayPattern)) {
    const month = MONTHS[match[1].toLowerCase()];
    const day = Number(match[2]);
    const year = normalizeYear(match[3]);
    const value = buildDate(day, month, year);
    if (value) candidates.push({ type: "date", value: value.toISOString(), label: formatSuggestedDate(value), source: match[0] });
  }

  return candidates.filter(
    (candidate, index, list) =>
      list.findIndex((item) => item.value === candidate.value) === index,
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
      if (query.length >= 3) candidates.push({ type: "location", query, source: match[0] });
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
