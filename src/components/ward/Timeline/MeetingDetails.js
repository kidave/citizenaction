// components\ward\tabs\Timeline\MeetingDetails.js
import styles from "styles/layout/timeline.module.css";
import {
  FaMapMarkerAlt,
  FaUserFriends,
  FaStar,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { useState } from "react";

export default function MeetingDetails({
  item,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  showEdit,
}) {
  const [editedItem, setEditedItem] = useState({
    ...item,
    id: Number(item.id),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({ ...prev, [name]: value }));
  };

  const renderDiscussion = () => {
    if (!item.discussion) return null;

    const points = Array.isArray(item.discussion)
      ? item.discussion
      : item.discussion.split("\n").filter((s) => s.trim());

    return (
      <div className={styles.discussionSection}>
        <h5 className={styles.sectionTitle}>Discussion Points</h5>
        <ul className={styles.discussionList}>
          {points.map((pt, i) => (
            <li key={i} className={styles.discussionPoint}>
              <span className={styles.bullet}>•</span>
              {pt}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (isEditing) {
    return (
      <div className={styles.meetingDetails}>
        <div className={styles.formGroup}>
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={editedItem.date || ""}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Title</label>
          <input
            name="title"
            value={editedItem.title || ""}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Location</label>
          <input
            name="location"
            value={editedItem.location || ""}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Attendees</label>
          <input
            name="notable_attendees"
            value={editedItem.notable_attendees || ""}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Discussion (one per line)</label>
          <textarea
            name="discussion"
            value={editedItem.discussion || ""}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Mood Rating</label>
          <input
            type="range"
            name="mood_rating"
            min="1"
            max="10"
            value={editedItem.mood_rating || 5}
            onChange={handleChange}
          />
        </div>

        <div className={styles.editActions}>
          <button
            onClick={() => onSave(editedItem)}
            className={styles.saveButton}
          >
            <FaSave /> Save
          </button>
          <button onClick={onCancel} className={styles.cancelButton}>
            <FaTimes /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.meetingDetails}>
      {item.location && (
        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>
            <FaMapMarkerAlt color="#e53935" />
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
            <FaUserFriends color="#333" />
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
            {item.mood_rating}/10
          </span>
        </div>
      )}
      {renderDiscussion()}
      {showEdit && (
        <button onClick={onEdit} className={styles.editButton}>
          <FaEdit /> Edit
        </button>
      )}
    </div>
  );
}
