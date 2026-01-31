import { useState, useEffect, useCallback } from "react";
import {
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter
} from "date-fns";

import useRegionMeetings from "hooks/useRegionMeetings";
import Link from "next/link";

import RegionMeetingStatus from "components/tabs/meetings/RegionMeetingStatus";
import RegionMeetingCard from "components/tabs/meetings/RegionMeetingCard";
import Spinner from "components/ui/Spinner";
import styles from "styles/components/tabs/meeting.module.css";

export default function RegionMeetingShortcut({ regionCode }) {
  const { meetings, loading } = useRegionMeetings(regionCode);

  const [meetingStatus, setMeetingStatus] = useState("upcoming");

  /* ---------------------------
     Resolve current meeting
  ---------------------------- */
  const currentMeeting = useCallback(() => {
    if (!meetings?.length) return null;

    const now = new Date();
    const upcoming = meetings.find(m => {
      const d = parseISO(m.meeting_date);
      const dt = setHours(setMinutes(setSeconds(d, 0), 0), 19);
      return isAfter(dt, now);
    });

    return upcoming || meetings[0];
  }, [meetings])();

  /* ---------------------------
     Next meeting datetime
  ---------------------------- */
  const nextMeetingDateTime = useCallback(() => {
    if (!currentMeeting?.meeting_date) return null;
    const d = parseISO(currentMeeting.meeting_date);
    return setHours(setMinutes(setSeconds(d, 0), 0), 19);
  }, [currentMeeting])();

  const nextMeetingLabel = nextMeetingDateTime
    ? format(nextMeetingDateTime, "EEEE, MMMM do 'at' h:mm a")
    : null;

  /* ---------------------------
     Status calculation
  ---------------------------- */
  useEffect(() => {
    if (!nextMeetingDateTime) return;

    const update = () => {
      const now = new Date();
      const diff = nextMeetingDateTime - now;
      const end = new Date(nextMeetingDateTime.getTime() + 90 * 60 * 1000);

      if (diff <= 0 && now < end) setMeetingStatus("live");
      else if (diff > 0 && diff <= 15 * 60 * 1000) setMeetingStatus("startingSoon");
      else if (diff > 0) setMeetingStatus("upcoming");
      else setMeetingStatus("ended");
    };

    update();
    const i = setInterval(update, 30000);
    return () => clearInterval(i);
  }, [nextMeetingDateTime]);

  const getStatusColor = () => {
    switch (meetingStatus) {
      case "live": return "#10B981";
      case "startingSoon": return "#F59E0B";
      case "upcoming": return "#3B82F6";
      case "ended": return "#6B7280";
      default: return "#667eea";
    }
  };

  const getStatusText = () => {
    switch (meetingStatus) {
      case "live": return "Live Now";
      case "startingSoon": return "Starting Soon";
      case "upcoming": return "Upcoming";
      case "ended": return "Ended";
      default: return "Scheduled";
    }
  };

  if (loading) return <Spinner mode="inline" size="small" />;

  /* ---------------------------
     Recent completed meetings
     (ignore latest/current)
  ---------------------------- */
  const recentMeetings = meetings.slice(1, 4);

  return (
    <div className={styles.shortcutContainer}>
      {/* Status + Countdown */}
      <div className={styles.shortcutStatus}>
        {currentMeeting && (
          <RegionMeetingStatus
            meetingStatus={meetingStatus}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            nextMeetingDateTime={nextMeetingDateTime}
            nextMeetingLabel={nextMeetingLabel}
            meetLink={currentMeeting.meet_link}
          />
        )}
      </div>
      
      {/* Recent meetings shortcuts */}
      <div className={styles.shortcutCard}>
        {recentMeetings.map(meeting => (
          <Link
            key={meeting.id}
            href={`/region/${meeting.region_code}/meeting?meetingId=${meeting.id}`}
            className={styles.shortcutLink}
          >
            <RegionMeetingCard
              meeting={meeting}
              expanded={false}
              onToggle={() => {}}
              formatMeetingDate={(d) =>
                format(
                  setHours(setMinutes(setSeconds(parseISO(d), 0), 0), 19),
                  "EEEE, MMMM do 'at' h:mm a"
                )
              }
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
