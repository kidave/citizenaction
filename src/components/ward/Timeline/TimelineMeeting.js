// components\ward\tabs\Timeline\TimelineMeeting.js
import { useState } from "react";
import TimelineItemMeeting from "./TimelineItemMeeting";
import styles from "styles/layout/timeline.module.css";
import { useWard } from "context/WardContext";
import { FaUsers, FaMapMarkerAlt, FaUserFriends, FaStar } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import { useAdmin } from "context/AdminContext";

export default function TimelineMeeting({ meetings: initialMeetings }) {
  const { wardId } = useWard();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { isAdmin } = useAdmin();


  const [showNew, setShowNew] = useState(false);
  const [meetings] = useState(initialMeetings);
  const [activeMeetingId, setActiveMeetingId] = useState(null);


  const handleAddClick = () => {
    setShowNew(true);
  };

  const toggleMeeting = (id) => {
    setActiveMeetingId(activeMeetingId === id ? null : id);
  };

  const MobileMeetingCard = ({ meeting }) => (
    <div
      className={`${styles.mobileMeetingCard} ${activeMeetingId === meeting.id ? styles.active : ""}`}
      onClick={() => toggleMeeting(meeting.id)}
    >
      <div className={styles.mobileCardHeader}>
        <h3>{meeting.title}</h3>
        <span className={styles.mobileDateBadge}>
          {new Date(meeting.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {activeMeetingId === meeting.id && (
        <div className={styles.meetingDetails}>
          {meeting.location && (
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>
                <FaMapMarkerAlt color="#e53935" />
              </span>
              <span className={styles.detailText}>
                <strong>Location: </strong>
                {meeting.location}
              </span>
            </div>
          )}

          {meeting.notable_attendees && (
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>
                <FaUserFriends color="#333" />
              </span>
              <span className={styles.detailText}>
                <strong>Key Attendees: </strong>
                {meeting.notable_attendees}
              </span>
            </div>
          )}
          {meeting.mood_rating && (
            <div className={styles.detailItem}>
              <span className={styles.detailIcon}>
                <FaStar />
              </span>
              <span className={styles.detailText}>
                <strong>Mood: </strong>
                {meeting.mood_rating}/10
              </span>
            </div>
          )}

          {meeting.discussion && (
            <div className={styles.discussionSection}>
              <h5>Discussion Points</h5>
              <ul className={styles.discussionList}>
                {meeting.discussion.split("\n").map((pt, i) => (
                  <li key={i} className={styles.discussionPoint}>
                    <span className={styles.bullet}>•</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={
        isMobile ? styles.mobileTimelineContainer : styles.timelineWrapper
      }
    >
      {isAdmin && (
        <div className={styles.addMeetingIconWrapper} onClick={handleAddClick}>
          <FaUsers className={styles.addMeetingIcon} />
          <div className={styles.addMeetingText}>Add Meeting</div>
        </div>
      )}

      {showNew && (
        <TimelineItemMeeting
          key="new-meeting"
          item={{
            id: null,
            title: "",
            location: "",
            notable_attendees: "",
            discussion: "",
            mood_rating: 5,
            date: "",
            ward_code: wardId,
          }}
          index={-1}
          isAdmin={isAdmin}
          isNew
          onCloseNew={() => setShowNew(false)}
          onSaveComplete={refreshMeetings}
        />
      )}

      {meetings.length === 0 && !showNew ? (
        <p className={styles.emptyTimeline}>No meetings yet.</p>
      ) : isMobile ? (
        // Mobile timeline view
        <div className={styles.mobileTimeline}>
          {meetings.map((meeting) => (
            <MobileMeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      ) : (
        meetings.map((item, index) => (
          <TimelineItemMeeting
            key={item.id}
            item={item}
            index={index}
            isAdmin={isAdmin}
          />
        ))
      )}
    </div>
  );
}
