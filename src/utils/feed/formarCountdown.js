export default function formatCountdown(countdown) {
  if (!countdown) {
    return null;
  }

  const { days, hours, minutes, seconds } = countdown;

  // DAYS

  if (days > 0) {
    return `Starts in ${days} day${days > 1 ? "s" : ""}`;
  }

  // HOURS

  if (hours > 0) {
    return `Starts in ${hours} hour${hours > 1 ? "s" : ""}`;
  }

  // MINUTES

  if (minutes > 0) {
    return `Starts in ${minutes} min`;
  }

  // SECONDS

  return `Starts in ${seconds}s`;
}
