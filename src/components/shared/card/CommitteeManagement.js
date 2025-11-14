// components/shared/card/CommitteeManagement.js
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "styles/components/design/card.module.css";
import { useScopes } from "hooks/useCommitteeData";

export default function CommitteeManagement({ form, onAssign, onClose }) {
  const [assignmentData, setAssignmentData] = useState({
    formId: form.id,
    scope_type: 'Ward',
    scope_role: 'Member',
    scope_code: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Get scopes dynamically based on selected scope_type
  const { data: scopes } = useScopes(assignmentData.scope_type);

  // Reset scope_code when scope_type changes
  useEffect(() => {
    setAssignmentData(prev => ({ ...prev, scope_code: '' }));
  }, [assignmentData.scope_type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignmentData.scope_code || !assignmentData.scope_role) {
      alert('Please select both scope and role');
      return;
    }

    setSubmitting(true);
    try {
      await onAssign(assignmentData);
    } catch (error) {
      console.error('Assignment error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Assign Committee Member</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          {/* Applicant Information */}
          <div className={styles.applicantInfo}>
            <h3>Applicant Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Name:</span>
                <span className={styles.infoValue}>{form.profile?.name || 'Unknown'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{form.profile?.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Mobile:</span>
                <span className={styles.infoValue}>+{form.country_code} {form.mobile}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Stakeholder:</span>
                <span className={styles.infoValue}>{form.stakeholder?.name || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Designation:</span>
                <span className={styles.infoValue}>{form.designation || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Locality:</span>
                <span className={styles.infoValue}>{form.locality || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Assignment Form */}
          <form onSubmit={handleSubmit} className={styles.assignmentForm}>
            <div className={styles.formGroup}>
              <label htmlFor="scope_type" className={styles.label}>
                Scope Type *
              </label>
              <select
                id="scope_type"
                value={assignmentData.scope_type}
                onChange={(e) => setAssignmentData(prev => ({ 
                  ...prev, 
                  scope_type: e.target.value
                }))}
                className={styles.select}
                required
              >
                <option value="Ward">Ward</option>
                <option value="City">City</option>
                <option value="Region">Region</option>
                <option value="State">State</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="scope_code" className={styles.label}>
                {assignmentData.scope_type.charAt(0).toUpperCase() + assignmentData.scope_type.slice(1)} *
              </label>
              <select
                id="scope_code"
                value={assignmentData.scope_code}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, scope_code: e.target.value }))}
                className={styles.select}
                required
                disabled={!scopes}
              >
                <option value="">Select a {assignmentData.scope_type}</option>
                {scopes?.map(scope => (
                  <option key={scope.scope_code} value={scope.scope_code}>
                    {scope.name} ({scope.scope_code})
                  </option>
                ))}
              </select>
              {!scopes && (
                <div className={styles.loadingText}>Loading {assignmentData.scope_type}s...</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="scope_role" className={styles.label}>
                Role *
              </label>
              <select
                id="scope_role"
                value={assignmentData.scope_role}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, scope_role: e.target.value }))}
                className={styles.select}
                required
              >
                <option value="Member">Member</option>
                <option value="Co Convener">Co Convener</option>
                <option value="Convener">Convener</option>
              </select>
            </div>
          </form>
        </div>

        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={submitting || !assignmentData.scope_code || !assignmentData.scope_role}
          >
            {submitting ? 'Assigning...' : 'Assign Member'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}