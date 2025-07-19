import { useState } from 'react';
import styles from '../../../../styles/layout/timeline.module.css';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

function formatPoints(str) {
  if (!str) return [];
  return str.split(/\d+\.|\n/).filter(s => s.trim());
}

export default function UpdateDetails({
  item,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  showEdit
}) {
  const [editedItem, setEditedItem] = useState({ ...item });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({ ...prev, [name]: value }));
  };

  if (isEditing) {
    return (
      <div className={styles.updateDetails}>
        <div className={styles.formGroup}>
          <label>Key Operations</label>
          <textarea
            name="operation"
            value={editedItem.operation}
            onChange={handleChange}
            rows={4}
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            name="description"
            value={editedItem.description}
            onChange={handleChange}
            rows={4}
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Support Needed</label>
          <textarea
            name="support"
            value={editedItem.support}
            onChange={handleChange}
            rows={4}
            className={styles.textarea}
          />
        </div>

        <div className={styles.editActions}>
          <button onClick={() => onSave(editedItem)} className={styles.saveButton}>
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
      {item.operation && (
        <div className={styles.operationSection}>
          <h5 className={styles.sectionTitle}>Key Operations</h5>
          <ul className={styles.discussionList}>
            {formatPoints(item.operation).map((op, i) => (
              <li key={i} className={styles.discussionPoint}>
                <span className={styles.bullet}>•</span>
                {op}
              </li>
            ))}
          </ul>
        </div>
      )}
      {item.description && (
        <div className={styles.descriptionSection}>
          <h5 className={styles.sectionTitle}>Description</h5>
          <ul className={styles.discussionList}>
            {formatPoints(item.description).map((desc, i) => (
              <li key={i} className={styles.discussionPoint}>
                <span className={styles.bullet}>•</span>
                {desc}
              </li>
            ))}
          </ul>
        </div>
      )}
      {item.support && (
        <div className={styles.supportSection}>
          <h5 className={styles.sectionTitle}>Support Needed</h5>
          <ul className={styles.discussionList}>
            {formatPoints(item.support).map((sup, i) => (
              <li key={i} className={styles.discussionPoint}>
                <span className={styles.bullet}>•</span>
                {sup}
              </li>
            ))}
          </ul>
        </div>
      )}

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
