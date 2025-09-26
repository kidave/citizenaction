// components/shared/MeetingCard.js
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaMapMarkerAlt, 
  FaUserFriends, 
  FaStar, 
  FaEdit,
  FaTrash
} from "react-icons/fa";
import MeetingForm from "./MeetingForm";
import MoodVisualization from "./MoodVisualization";
import styles from "styles/layout/timeline.module.css";

const MeetingDetails = ({ item }) => (
  <div className={styles.meetingDetails}>
    {item.location && (
      <div className={styles.detailItem}>
        <span className={styles.detailIcon}>
          <FaMapMarkerAlt color="lightcoral" />
        </span>
        <span className={styles.detailText}>
          <strong>Location: </strong>
          {item.location}
        </span>
      </div>
    )}
    {item.notable_attendees && (
      <div className={styles.detailItem}>
        <span className={styles.detailIcon}>
          <FaUserFriends color="black" />
        </span>
        <span className={styles.detailText}>
          <strong>Key Attendees: </strong>
          {item.notable_attendees}
        </span>
      </div>
    )}
    {item.mood_rating && (
      <div className={styles.detailItem}>
        <span className={styles.detailIcon}>
          <FaStar />
        </span>
        <span className={styles.detailText}>
          <strong>Mood: </strong>
          <MoodVisualization rating={item.mood_rating} />
        </span>
      </div>
    )}
    {item.discussion && (
      <div className={styles.discussionSection}>
        <h5 className={styles.sectionTitle}>Discussion Points</h5>
        <ul className={styles.discussionList}>
          {item.discussion.split("\n").filter(s => s.trim()).map((pt, i) => (
            <li key={i} className={styles.discussionPoint}>
              <span className={styles.bullet}>•</span>
              {pt}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default function MeetingCard({ 
  item, 
  index, 
  onUpdate,
  onDelete,
  isNew = false
}) {
  const [isEditing, setIsEditing] = useState(isNew);

  const handleSave = async (formData) => {
    await onUpdate(item.id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (isNew) {
      onDelete();
    }
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${styles.timelineCard} ${styles.meetingCard} ${styles.editingCard}`}
      >
        <MeetingForm
          meeting={item}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={`${styles.timelineCard} ${styles.meetingCard}`}
    >
      <div className={styles.cardHeader}>
        <h4 className={styles.timelineCardTitle}>{item.title}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={styles.cardTypeBadge}>
            {new Date(item.date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <button 
            onClick={() => setIsEditing(true)}
            className={styles.editButton}
            aria-label="Edit"
          >
            <FaEdit className={styles.addButtonIconFa} />
          </button>
          <button 
            onClick={() => onDelete(item.id)}
            className={styles.deleteButton}
            aria-label="Delete"
          >
            <FaTrash className={styles.deleteButtonIconFa} />
          </button>
        </div>
      </div>
      <MeetingDetails item={item} />
    </motion.div>
  );
}