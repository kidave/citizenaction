import TimelineMeeting from "./Timeline/TimelineMeeting";
import { useWard } from "context/WardContext";

export default function MeetingTab() {
  const { meetings, loading, error } = useWard();

  if (loading) return <div>Loading meetings...</div>;
  if (error) return <div>Error loading meetings: {error}</div>;

  return <TimelineMeeting meetings={meetings} />;
}
