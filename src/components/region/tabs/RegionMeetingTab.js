import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter
} from "date-fns";

import useRegionMeetings from "hooks/useRegionMeetings";
import useMeetingAttendance from "hooks/useMeetingAttendance";
import { useRegion } from "context/RegionContext";
import { useAuth } from "context/AuthContext";

import RegionMeetingAttendance from "components/shared/meetings/RegionMeetingAttendance";
import RegionMeetingCard from "components/shared/meetings/RegionMeetingCard";
import RegionMeetingStatus from "components/shared/meetings/RegionMeetingStatus";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/tabs/meeting.module.css";

export default function RegionMeetingTab() {
  const router = useRouter();
  const { regionCode } = useRegion();
  const { user } = useAuth();

  const { meetings, loading, error } = useRegionMeetings(regionCode);
  
  const meetingIdParam = router.query.meetingId;
  const meetingId = meetingIdParam ? String(meetingIdParam) : null;

  /* ---------------------------
     Expanded card state
  ---------------------------- */
  const [expandedCards, setExpandedCards] = useState({});
  const [meetingStatus, setMeetingStatus] = useState("upcoming");

  /* ---------------------------
     Default expansion (NO deep link)
  ---------------------------- */
  useEffect(() => {
    if (!meetings?.length) return;
    if (meetingId) return;

    setExpandedCards({ [meetings[0].id]: true });
  }, [meetings, meetingId]);

  /* ---------------------------
     Deep link expand + scroll
  ---------------------------- */
  useEffect(() => {
    if (!router.isReady) return;
    if (!meetingId || !meetings?.length) return;

    const target = meetings.find(m => String(m.id) === meetingId);
    if (!target) return;

    setExpandedCards(prev => ({
      ...prev,
      [meetingId]: true
    }));

    setTimeout(() => {
      const el = document.getElementById(`meeting-${meetingId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  }, [router.isReady, meetingId, meetings]);

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  /* ---------------------------
     Find upcoming meeting
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
     Attendance
  ---------------------------- */
  const {
    attendance,
    currentUserAttendance,
    loading: attendanceLoading,
    toggleAttendance
  } = useMeetingAttendance(currentMeeting?.id, regionCode);

  /* ---------------------------
     Auth redirect
  ---------------------------- */
  const handleLoginRedirect = () => {
    router.push("/auth");
  };

  /* ---------------------------
     Meeting date formatter
  ---------------------------- */
  const formatMeetingDate = useCallback((dateString) => {
    if (!dateString) return "";

    const date = parseISO(dateString);
    const meetingDateTime = setHours(
      setMinutes(setSeconds(date, 0), 0),
      19
    );

    return format(meetingDateTime, "EEEE, MMMM do 'at' h:mm a");
  }, []);

  /* ---------------------------
     Meeting datetime
  ---------------------------- */
  const nextMeetingDateTime = useCallback(() => {
    if (!currentMeeting?.meeting_date) return null;

    const date = parseISO(currentMeeting.meeting_date);
    return setHours(setMinutes(setSeconds(date, 0), 0), 19);
  }, [currentMeeting])();

  /* ---------------------------
     Status calculation
  ---------------------------- */
  useEffect(() => {
    if (!nextMeetingDateTime) return;

    const updateStatus = () => {
      const now = new Date();
      const diff = nextMeetingDateTime - now;
      const meetingEnd = new Date(
        nextMeetingDateTime.getTime() + 90 * 60 * 1000
      );

      if (diff <= 0 && now < meetingEnd) {
        setMeetingStatus("live");
      } else if (diff > 0 && diff <= 15 * 60 * 1000) {
        setMeetingStatus("startingSoon");
      } else if (diff > 0) {
        setMeetingStatus("upcoming");
      } else {
        setMeetingStatus("ended");
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, [nextMeetingDateTime]);


  const nextMeetingLabel = useCallback(() => {
    if (!nextMeetingDateTime) return null;
    return format(nextMeetingDateTime, "EEEE, MMMM do 'at' h:mm a");
  }, [nextMeetingDateTime])();


  /* ---------------------------
     Status helpers
  ---------------------------- */
  const getStatusColor = () => {
    switch (meetingStatus) {
      case "live":
        return "#10B981";
      case "startingSoon":
        return "#F59E0B";
      case "upcoming":
        return "#3B82F6";
      case "ended":
        return "#6B7280";
      default:
        return "#667eea";
    }
  };

  const getStatusText = () => {
    switch (meetingStatus) {
      case "live":
        return "Live Now";
      case "startingSoon":
        return "Starting Soon";
      case "upcoming":
        return "Upcoming";
      case "ended":
        return "Ended";
      default:
        return "Scheduled";
    }
  };

  /* ---------------------------
     Loading / error
  ---------------------------- */
  if (loading) return <Spinner mode="inline" />;
  if (error) return <div>Error loading meetings</div>;

  /* ---------------------------
     Render
  ---------------------------- */
  return (
    <div className={styles.meetingTimeline}>
      {/* Meeting status + countdown */}
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

      {/* Attendance */}
      {currentMeeting && (
        <RegionMeetingAttendance
          attendance={attendance}
          currentUserAttendance={currentUserAttendance}
          attendanceLoading={attendanceLoading}
          user={user}
          onToggleAttendance={toggleAttendance}
          onLoginRedirect={handleLoginRedirect}
        />
      )}

      <div className={styles.improvementBanner}>
        <div className={styles.bannerContent}>
          <span>The bellow text are AI generated based on our meeting discussion</span>
        </div>
      </div>

      {/* Timeline */}
      {meetings.map(meeting => (
        <RegionMeetingCard
          key={meeting.id}
          meeting={meeting}
          expanded={!!expandedCards[meeting.id]}
          onToggle={() => toggleCardExpansion(meeting.id)}
          formatMeetingDate={formatMeetingDate}
        />
      ))}
    </div>
  );
}
