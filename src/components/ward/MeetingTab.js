// components\ward\tabs\MeetingTab.js
import TimelineMeeting from "./Timeline/TimelineMeeting";
import { useWard } from "context/WardContext";
import useWardMeetings from "hooks/useWardMeetings";
import Spinner from "components/shared/ui/Spinner";

export default function MeetingTab() {
  const { wardId } = useWard();
  const { meetings, loading, error } = useWardMeetings(wardId);

  if (loading) return <Spinner />;
  if (error) return <div>Error loading meetings: {error.message}</div>;

  return <TimelineMeeting meetings={meetings} />;
}
