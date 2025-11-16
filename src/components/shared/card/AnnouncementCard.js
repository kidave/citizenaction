// components/shared/card/AnnouncementCard.js
import { useState } from "react";
import styles from "styles/tabs/announcement.module.css";
import { BsTelephone } from "react-icons/bs";
import { MdOutlineEmail } from "react-icons/md";
import { FaMapMarkerAlt, FaRoute, FaCalendar, FaBullhorn } from "react-icons/fa";

export default function AnnouncementCard({ 
  announcement, 
}) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasLocationInfo = announcement.landmark_start || announcement.landmark_end;

  return (
    <div>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.actionType}>
          <span className={styles.actionLabel}>
            {announcement.action_type}
          </span>
        </div>
        {announcement.scheduled_date && (
          <div className={styles.scheduledDate}>
            <FaCalendar /> {formatDate(announcement.scheduled_date)}
          </div>
        )}
      </div>

      {/* Title */}
      <h4><FaBullhorn /> {announcement.title}</h4>

      {/* Location Information */}
      {hasLocationInfo && (
        <div className={styles.locationInfo}>
          {announcement.landmark_start && announcement.landmark_end && (
            <div className={styles.route}>
              <FaRoute /> {announcement.landmark_start} → {announcement.landmark_end}
            </div>
          )}
          {announcement.meeting_point && (
            <div className={styles.meetingPoint}>
              <FaMapMarkerAlt /> Meet at: {announcement.meeting_point}
            </div>
          )}
        </div>
      )}

      {/* Agenda Preview */}
        <h4>Agenda:</h4>
        <p className={expanded ? styles.expanded : styles.collapsed}>
          {announcement.agenda}
        </p>
        {announcement.agenda.length > 150 && (
          <button 
            className={styles.expandButton}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Read More'}
          </button>
        )}

      {/* Call to Action */}
        <h4>Join Us:</h4>
        <p>{announcement.call_to_action}</p>
      

      {/* Additional Info */}
      <div className={styles.additionalInfo}>
        {announcement.contact_info && (
          <div className={styles.contactInfo}>
            <MdOutlineEmail /> {announcement.contact_info}
          </div>
        )}
      </div>
    </div>
  );
}