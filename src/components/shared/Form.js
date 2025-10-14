// components/shared/Form.js
import { useState } from "react";
import { 
  SaveButton, 
  CancelButton,
  DeleteButton 
} from "components/shared/ui/Buttons";
import styles from "styles/components/data/form.module.css";

export default function Form({
  title,
  onSubmit,
  onCancel,
  onDelete,
  children,
  saving = false,
  showDelete = false,
  deleteLoading = false
}) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit();
  };

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formBackdrop} onClick={onCancel}></div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formHeader}>
          <h3>{title}</h3>
          <div className={styles.formActions}>
            <SaveButton saving={saving} type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </SaveButton>
            {showDelete && (
              <DeleteButton 
                deleting={deleteLoading}
                onClick={onDelete}
                type="button"
              >
                Delete
              </DeleteButton>
            )}
            <CancelButton type="button" onClick={onCancel}>
              Cancel
            </CancelButton>
          </div>
        </div>
        
        <div className={styles.formContent}>
          {children}
        </div>
      </form>
    </div>
  );
}

// Form Section Component
export function FormSection({ title, children, className = "" }) {
  return (
    <div className={`${styles.formSection} ${className}`}>
      {title && (
        <div className={styles.sectionHeader}>
          <h4>{title}</h4>
        </div>
      )}
      {children}
    </div>
  );
}

// Form Group Component
export function FormGroup({ label, children, required = false }) {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {children}
    </div>
  );
}

// Form Row Component
export function FormRow({ children, compact = false }) {
  return (
    <div className={`${styles.formRow} ${compact ? styles.compact : ''}`}>
      {children}
    </div>
  );
}