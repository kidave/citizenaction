// components/shared/card/CommitteeForm.js
import { useState } from "react";
import styles from "styles/components/design/card.module.css";
import ButtonGroup from "components/shared/ui/ButtonGroup";
import { SaveButton, ViewButton } from "components/shared/ui/Buttons";
import Image from "next/image";

export default function CommitteeForm({ 
  form, 
  onAssign,
  processing, 
  showActions = true
}) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return styles.statusApproved;
      case 'rejected': return styles.statusRejected;
      default: return styles.statusPending;
    }
  };

  const getAvatarUrl = (avatarUrl) => avatarUrl ? avatarUrl : "/user.png";

  const getUserName = () => {
    if (form.name) return form.name;
    if (form.profile?.name) return form.profile.name;
    return 'Unknown User';
  };

  const getUserEmail = () => {
    if (form.email) return form.email;
    if (form.profile?.email) return form.profile.email;
    return 'No email available';
  };

  const getStakeholderName = () => {
    if (form.stakeholder_name) return form.stakeholder_name;
    if (form.stakeholder?.name) return form.stakeholder.name;
    if (form.stakeholder_id) return `Stakeholder ID: ${form.stakeholder_id}`;
    return 'Not specified';
  };

  const isApproved = form.application_status === 'approved';

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.userInfo}>
          <div className={styles.avatarContainer}>
            <Image
              src={getAvatarUrl(form.profile?.avatar_url)}
              alt={`${form.user_name}'s avatar`}
              width={50}
              height={50}
              className={styles.avatar}
              onError={(e) => { e.target.src = "/user.png"; }}
            />
          </div>
          <div>
            <h5>{getUserName()}</h5>
            <h5 className={styles.label}>{getStakeholderName()}</h5>
          </div>
        </div>
        <div className={`${styles.status} ${getStatusColor(form.application_status)}`}>
          {form.application_status}
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{getUserEmail()}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Mobile:</span>
          <span className={styles.value}>{form.country_code} +{form.mobile}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Designation:</span>
          <span className={styles.value}>{form.designation || 'Not specified'}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Locality:</span>
          <span className={styles.value}>{form.locality || 'Not specified'}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Applied:</span>
          <span className={styles.value}>
            {new Date(form.created_at).toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Show assigned scope for approved applications */}
        {isApproved && form.scope_code && (
          <div className={styles.assignedInfo}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Assigned Scope:</span>
              <span className={styles.value}>
                {form.scope_type}: {form.scope_code}
              </span>
            </div>
            {form.scope_role && (
              <div className={styles.detailRow}>
                <span className={styles.label}>Role:</span>
                <span className={styles.value}>{form.scope_role}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showDetails && (
        <div className={styles.cardContent}>
          <div className={styles.detailRow}>
            <span className={styles.label}>User ID:</span>
            <span className={styles.value}>{form.user_id}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Form ID:</span>
            <span className={styles.value}>{form.id}</span>
          </div>
        </div>
      )}

      <div className={styles.cardFooter}>
        <ButtonGroup>
          {showActions && form.application_status === 'pending' && (
            <SaveButton
              onClick={onAssign}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Assign Member'}
            </SaveButton>
          )}
          <ViewButton
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </ViewButton>
        </ButtonGroup>
      </div>
    </div>
  );
}