interface Period {
  start: Date;
  end?: Date;
  ongoing?: boolean;
}

/** "since 2023", "2023–2025" or "2025" */
export const formatYears = ({ start, end, ongoing }: Period) => {
  const from = start.getUTCFullYear();
  const to = end?.getUTCFullYear();

  if (ongoing) return `since ${from}`;
  if (to && to !== from) return `${from}–${to}`;
  return `${from}`;
};

/** "17 October 2026" */
export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

/**
 * For news: the exact day ("17 October 2026"),
 * unless the coverage runs across years ("2020–2024")
 */
export const formatDateline = (period: Period) =>
  period.ongoing ||
  (period.end && period.end.getUTCFullYear() !== period.start.getUTCFullYear())
    ? formatYears(period)
    : formatDate(period.start);

/** ['Paris', 'France'] → "Paris, France" */
export const formatList = (value?: string | string[]) =>
  Array.isArray(value) ? value.join(', ') : (value ?? '');

/** 7 of 61 → "07" */
export const padNumber = (value: number, total: number) =>
  String(value).padStart(String(total).length, '0');

/** Text from content files: a blank line starts a new paragraph */
export const toParagraphs = (text?: string) =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

/** Joins the parts that exist: ["Paris, France", undefined, "2026"] → "Paris, France · 2026" */
export const joinParts = (parts: (string | undefined)[], separator = ' · ') =>
  parts.filter(Boolean).join(separator);

/** For building small HTML snippets from content values */
export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
