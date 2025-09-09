// components/shared/UpdateCard.js
import { useState } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaTrash } from "react-icons/fa";
import UpdateForm from "./UpdateForm";
import styles from "styles/layout/timeline.module.css";

// Helper function to render discussion points
const renderDiscussion = (label, content) => {
  if (!content) return null;

  const points = Array.isArray(content)
    ? content
    : content.split("\n").filter((s) => s.trim());

  return (
    <div className={styles.operationSection}>
      <h5 className={styles.sectionTitle}>{label}</h5>
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

export default function UpdateCard({ 
  item, 
  index, 
  isAdmin = false, 
  onUpdate,
  onDelete,
  onCancelEdit 
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (formData) => {
    await onUpdate(item.id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    onCancelEdit && onCancelEdit();
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${styles.timelineCard} ${styles.updateCard} ${styles.editingCard}`}
      >
        <UpdateForm
          update={item}
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
      className={`${styles.timelineCard} ${styles.updateCard}`}
    >
      <div className={styles.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={styles.cardTypeBadge}>
            {new Date(item.date).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
          {isAdmin && (
            <>
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
            </>
          )}
        </div>
      </div>
      <div className={styles.updateDetails}>
        {renderDiscussion("Key Operations", item.operation)}
        {renderDiscussion("Description", item.description)}
        {renderDiscussion("Support Needed", item.support)}
      </div>
    </motion.div>
  );
}