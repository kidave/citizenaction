import { isAfter, isBefore, isValid } from "date-fns";

export default function getMeetingStatus(date, time) {
  if (!date || !time) return null;

  const meetingDate = new Date(`${date}T${time}`);
  if (!isValid(meetingDate)) return null;

  const now = new Date();

  if (isAfter(meetingDate, now)) {
    return "Upcoming";
  }

  if (isBefore(meetingDate, now)) {
    return "Completed";
  }

  return "Ongoing";
}