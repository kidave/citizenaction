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

export function extractDateCandidate(text) {
  if (!text) return null;

  const monthNames = Object.keys(MONTHS).join("|");
  const monthDayPattern = new RegExp(
    `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames})(?:\\s*,?\\s*(\\d{4}))?\\b`,
    "i",
  );

  const dayMonthPattern = new RegExp(
    `\\b(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*,?\\s*(\\d{4}))?\\b`,
    "i",
  );

  let match = text.match(monthDayPattern);
  let day;
  let month;
  let year;

  if (match) {
    day = Number(match[1]);
    month = MONTHS[match[2].toLowerCase()];
    year = normalizeYear(match[3]);
  } else {
    match = text.match(dayMonthPattern);
    if (!match) return null;

    month = MONTHS[match[1].toLowerCase()];
    day = Number(match[2]);
    year = normalizeYear(match[3]);
  }

  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return {
    type: "date",
    value: date.toISOString(),
    label: formatSuggestedDate(date),
  };
}

export function extractLocationCandidate(text) {
  if (!text) return null;

  const patterns = [
    /(?:at|near|in|on)\s+([^.!?\n]{3,100})/i,
    /(?:venue|location|place)\s*[:\-]\s*([^.!?\n]{3,100})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    const value = match[1].trim().replace(/[,:;]+$/, "");

    if (value.length < 3) continue;

    return {
      type: "location",
      query: value,
    };
  }

  return null;
}
