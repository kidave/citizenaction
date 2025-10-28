// components/shared/card/MeetingCard.js
import { useState } from "react";
import { motion } from "framer-motion";
import MoodVisualization from "components/shared/MoodVisualization";
import StatusBadge from 'components/shared/card/StatusBadge';
import { ButtonGroup } from "components/shared/ui/ButtonGroup";
import { EditButton, DeleteButton, SaveButton, CancelButton, PublishButton } from "components/shared/ui/Buttons";
import styles from "styles/tabs/timeline.module.css";
import { FaMapMarkerAlt, FaUserFriends, FaStar } from "react-icons/fa";

export default function MeetingCard({ 
  item, 
  index, 
  editable = false, 
  onUpdate, 
  onDelete,
  onPublish,
  publishingStates = {},
  isNew = false,
  deleting = false
}) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [form, setForm] = useState({
    title: item.title || "",
    date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    location: item.location || "",
    notable_attendees: item.notable_attendees || "",
    discussion: item.discussion || "",
    mood_rating: item.mood_rating || 5,
    is_published: item.is_published || false
  });

  const handleSave = async () => {
    try {
      await onUpdate(item.id, form);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save meeting:", error);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      onDelete();
    } else {
      setIsEditing(false);
      setForm({
        title: item.title || "",
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        location: item.location || "",
        notable_attendees: item.notable_attendees || "",
        discussion: item.discussion || "",
        mood_rating: item.mood_rating || 5,
        is_published: item.is_published || false
      });
    }
  };

  const handleDelete = () => {
    console.log('MeetingCard: Delete button clicked for meeting:', item.id);
    console.log('MeetingCard: onDelete function available:', !!onDelete);
    
    if (!onDelete) {
      console.error('MeetingCard: onDelete handler is not provided!');
      return;
    }
    
    console.log('MeetingCard: Calling onDelete with id:', item.id);
    onDelete(item.id);
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish(item.id, !item.is_published);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const renderDiscussion = (discussion) => {
    if (!discussion) return null;
    const points = discussion.split("\n").filter((s) => s.trim());
    return (
      <div className={styles.discussionSection}>
        <h5 className={styles.sectionTitle}>Discussion</h5>
        <ul className={styles.discussionList}>
          {points.map((pt, i) => (
            <li key={i} className={styles.discussionPoint}>{pt}</li>
          ))}
        </ul>
      </div>
    );
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${styles.timelineCard} ${styles.meetingCard} ${styles.editingCard}`}
      >
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>Title:</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Meeting Title"
              className={styles.editInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Meeting Date:</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={styles.editInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Location:</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Meeting location"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Notable Attendees:</label>
            <textarea
              value={form.notable_attendees}
              onChange={(e) => setForm({ ...form, notable_attendees: e.target.value })}
              placeholder="Notable attendees (one per line)"
              rows="2"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Discussion Points:</label>
            <textarea
              value={form.discussion}
              onChange={(e) => setForm({ ...form, discussion: e.target.value })}
              placeholder="Discussion points (one per line)"
              rows="3"
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.moodInlineRow}>
              <strong>Mood: </strong>
              <MoodVisualization rating={form.mood_rating} inline={true} />
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={form.mood_rating}
              onChange={(e) => setForm({ ...form, mood_rating: parseInt(e.target.value) })}
            />
          </div>

          <ButtonGroup>
            <SaveButton onClick={handleSave}>
              {isNew ? "Create" : "Save"}
            </SaveButton>
            <CancelButton onClick={handleCancel}/>
          </ButtonGroup>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`${styles.timelineCard} ${styles.meetingCard}`}
    >
      <div className={styles.cardHeader}>
        {/* First Row: Publish Status and Action Buttons */}
        <div className={styles.cardHeaderRow}>
          <div className={styles.cardHeaderLeft}>
            {editable && (
              <StatusBadge 
                status={item.is_published ? 'published' : 'draft'}
                variant="badge"
                customLabel={item.is_published ? 'Published' : 'Draft'}
              />
            )}
          </div>
          <div className={styles.cardHeaderRight}>
            {editable && (
              <ButtonGroup>
                <PublishButton
                  size="small"
                  published={item.is_published}
                  publishing={publishingStates[item.id]}
                  onClick={handlePublish}
                />
                <EditButton 
                  size="small"
                  onClick={() => setIsEditing(true)}
                />
                <DeleteButton
                  size="small"
                  onClick={handleDelete}
                  disabled={deleting}
                  loading={deleting}
                />
              </ButtonGroup>
            )}
          </div>
        </div>

        {/* Second Row: Title and Date */}
        <div className={styles.cardHeaderRow}>
          <div className={styles.cardHeaderLeft}>
            <h4 className={styles.timelineCardTitle}>{item.title || "Untitled Meeting"}</h4>
          </div>
          <div className={styles.cardHeaderRight}>
            <StatusBadge 
              status="planned"
              customLabel={formatDate(item.date)}
            />
          </div>
        </div>
      </div>

      <div className={styles.meetingDetails}>
        {item.location && (
          <div className={styles.detailItem}>
            <FaMapMarkerAlt color="lightcoral" className={styles.detailIcon} />
            <span><strong>Location:</strong> {item.location}</span>
          </div>
        )}
        {item.notable_attendees && (
          <div className={styles.detailItem}>
            <FaUserFriends color="black" className={styles.detailIcon} />
            <span><strong>Key Attendees:</strong> {item.notable_attendees}</span>
          </div>
        )}
        {item.mood_rating && (
          <div className={styles.detailItem}>
            <FaStar color="gold" className={styles.detailIcon} />
            <div className={styles.moodInlineRow}>
              <strong>Mood:</strong>
              <MoodVisualization rating={item.mood_rating} />
            </div>
          </div>
        )}
        {renderDiscussion(item.discussion)}
      </div>
    </motion.div>
  );
}