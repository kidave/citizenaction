import { 
  formatDistanceToNow, 
  parseISO, 
  isValid, 
  format 
} from "date-fns";

export default function formatDate(
  dateString,
  mode = "relative"
) {
  if (!dateString) return "";

  try {
    const parsed = parseISO(dateString);
    if (!isValid(parsed)) return "";

    if (mode === "absolute") {
      return format(parsed, "d MMMM yyyy");
    }

    return formatDistanceToNow(parsed, {
      addSuffix: true,
    });

  } catch {
    return "";
  }
}