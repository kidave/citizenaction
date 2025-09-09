// components/shared/InlineEditableField.js
import { useState, useRef, useEffect } from "react";
import styles from "styles/layout/admin.module.css";

export default function InlineEditableField({ 
  value, 
  onSave, 
  fieldName, 
  placeholder = "",
  type = "text",
  rows = 1 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === "textarea") {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = inputRef.current.scrollHeight + "px";
      }
    }
  }, [isEditing, type]);

  const handleSave = () => {
    if (editedValue !== value) {
      onSave(editedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={styles.inlineEditContainer}>
        {type === "textarea" ? (
          <textarea
            ref={inputRef}
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={rows}
            className={styles.inlineTextarea}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={styles.inlineInput}
          />
        )}
        <div className={styles.inlineEditButtons}>
          <button onClick={handleSave} className={styles.inlineSaveBtn}>✓</button>
          <button onClick={handleCancel} className={styles.inlineCancelBtn}>✗</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={styles.inlineDisplay}
      onClick={() => setIsEditing(true)}
    >
      {value || placeholder}
      <span className={styles.editPencil}>✏️</span>
    </div>
  );
}