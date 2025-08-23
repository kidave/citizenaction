// components\ward\tabs\Timeline\UpdateDetails.js
import { useState } from "react";
import styles from "styles/layout/timeline.module.css";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

function renderDiscussion(label, str) {
  if (!str) return null;

  const points = Array.isArray(str)
    ? str
    : str.split("\n").filter((s) => s.trim());

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
}

export default function UpdateDetails({
  item,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  showEdit,
}) {
  const [editedItem, setEditedItem] = useState({ ...item });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({ ...prev, [name]: value }));
  };

  if (isEditing) {
    return (
      <div className={styles.updateDetails}>
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
          <label>Key Operations</label>
          <textarea
            name="operation"
            value={editedItem.operation || ""}
            onChange={handleChange}
            rows={4}
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            name="description"
            value={editedItem.description || ""}
            onChange={handleChange}
            rows={4}
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Support Needed</label>
          <textarea
            name="support"
            value={editedItem.support || ""}
            onChange={handleChange}
            rows={4}
            className={styles.textarea}
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
    <div className={styles.updateDetails}>
      {renderDiscussion("Key Operations", item.operation)}
      {renderDiscussion("Description", item.description)}
      {renderDiscussion("Support Needed", item.support)}

      {showEdit && (
        <div className={styles.editActions}>
          <button onClick={onEdit} className={styles.editButton}>
            <FaEdit /> Edit
          </button>
        </div>
      )}
    </div>
  );
}
