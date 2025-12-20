// components/meetings/RegionMeetingAttendance.js
import { FaUsers, FaRegUser, FaUserCheck, FaUserPlus, FaTimes, FaCheck } from "react-icons/fa";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/tabs/meeting.module.css";

export default function RegionMeetingAttendance({
  attendance,
  currentUserAttendance,
  attendanceLoading,
  user,
  onToggleAttendance,
  onLoginRedirect
}) {
  return (
    <div className={styles.attendanceSection}>
      <div className={styles.attendanceHeader}>
        <h5>
          <FaUsers className={styles.attendanceTitleIcon} />
          Attendee ({attendance.length})
        </h5>

        <div className={styles.attendanceToggleContainer}>
          {user ? (
            <button
              onClick={onToggleAttendance}
              className={`${styles.attendanceToggle} ${
                currentUserAttendance ? styles.attending : styles.notAttending
              }`}
              disabled={attendanceLoading}
            >
              {attendanceLoading ? (
                <Spinner mode="inline" size="small" />
              ) : currentUserAttendance ? (
                <>
                  <FaUserCheck className={styles.toggleIcon} />
                  <span>Attending</span>
                  <FaTimes className={styles.toggleCloseIcon} />
                </>
              ) : (
                <>
                  <FaUserPlus className={styles.toggleIcon} />
                  <span>Mark Attendance</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onLoginRedirect}
              className={styles.loginButton}
            >
              <FaUserPlus className={styles.loginIcon} />
              <span>Login to RSVP</span>
            </button>
          )}
        </div>
      </div>

      {attendance.length > 0 ? (
        <div className={styles.attendeeGrid}>
          {attendance.map(item => (
            <div key={item.id} className={styles.attendeeItem}>
              <div className={styles.avatar}>
                {item.avatar_url ? (
                  <img
                    src={item.avatar_url}
                    alt={item.attendee_name}
                    className={styles.avatarImage}
                  />
                ) : (
                  <FaRegUser className={styles.defaultAvatar} />
                )}

                {item.user_id === user?.id && (
                  <div className={styles.currentUserBadge}>
                    <FaCheck className={styles.badgeIcon} />
                  </div>
                )}
              </div>

              <div className={styles.attendeeInfo}>
                <span className={styles.attendeeName}>
                  {item.attendee_name}
                  {item.user_id === user?.id && (
                    <span className={styles.youBadge}> (You)</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noAttendees}>
          <p>No one has marked attendance yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}
