import { formatDistanceToNow, parseISO, isValid } from "date-fns";

export default function formatPostDate(dateString) {
  if (!dateString) return "";

  try {
    const parsed = parseISO(dateString);

    if (!isValid(parsed)) return "";

    return formatDistanceToNow(parsed, {
      addSuffix: true,
    });
  } catch {
    return "";
  }
}