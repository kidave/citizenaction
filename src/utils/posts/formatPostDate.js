import { 
  formatDistanceToNow, 
  parseISO, 
  isValid, 
  format 
} from "date-fns";

export default function formatPostDate(
  dateString,
  mode = "relative" // "relative" | "absolute"
) {
  if (!dateString) return "";

  try {
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return "";

    if (mode === "absolute") {
      return format(parsed, "d MMMM yyyy");
      // Example: 17 February 2026
    }

    return formatDistanceToNow(parsed, {
      addSuffix: true,
    });

  } catch {
    return "";
  }
}