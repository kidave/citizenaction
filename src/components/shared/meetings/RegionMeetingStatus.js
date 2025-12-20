// components/meetings/RegionMeetingStatus.js
import {
  FaVideo,
  FaClock,
  FaCircle,
  FaExternalLinkAlt
} from "react-icons/fa";
import CountdownTimer from "components/shared/ui/CountdownTimer";
import styles from "styles/tabs/meeting.module.css";

export default function RegionMeetingStatus({
  meetingStatus,
  getStatusColor,
  getStatusText,
  nextMeetingDateTime,
  nextMeetingLabel,
  meetLink
}) {
  return (
    <div className={styles.meetingLinkSection}>
      <div className={styles.meetingStatusContainer}>
        <div className={styles.headerTitle}>
          <div className={styles.headerTop}>
            <FaVideo className={styles.sectionIcon} />
            <h3 className={styles.meetingTitle}>
              Weekly Regional Meeting
            </h3>
          </div>
          <div className={styles.headerBottom}>
            <span className={styles.meetingDate}>
              <FaClock className={styles.sectionIcon} />
              Every Monday at 7:00 PM
            </span>
          </div>
        </div>

        <div
          className={styles.statusIndicator}
          style={{ color: getStatusColor() }}
        >
          <FaCircle className={styles.statusDot} />
          <span className={styles.statusText}>
            {getStatusText()}
          </span>
        </div>

        {nextMeetingDateTime && (
          <CountdownTimer
            targetDate={nextMeetingDateTime.toISOString()}
            liveText="Meeting in progress"
            endedText="Meeting ended"
            noMeetingText="No meeting scheduled"
          />
        )}
      </div>

      {/* Join + Next meeting info */}
      <div className={styles.joinSection}>
        <a
          href={meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.meetLink} ${
            meetingStatus === "live" ? styles.meetLinkLive : ""
          }`}
        >
          {meetingStatus === "live"
            ? "Join Live Meeting"
            : "Join Google Meet"}
          <FaExternalLinkAlt size={12} />
        </a>

        {nextMeetingLabel && (
          <p className={styles.nextMeetingInfo}>
            Next meeting: {nextMeetingLabel}
          </p>
        )}
      </div>
    </div>
  );
}
