// components/shared/card/CommitteeMember.js
import { useState, useEffect } from "react";
import Image from "next/image";
import ButtonGroup from "components/shared/ui/ButtonGroup";
import { EditButton, DeleteButton, SaveButton, CancelButton } from "components/shared/ui/Buttons";
import { useScopes } from "hooks/useCommitteeData";
import styles from "styles/components/design/card.module.css";

export default function CommitteeMember({ 
  member, 
  onUpdate, 
  onRemove, 
  processing, 
  roles = []
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    scope_code: member.scope_code,
    scope_type: member.scope_type,
    scope_role: member.scope_role
  });

  // Get scopes dynamically based on selected scope_type in edit mode
  const { data: scopes } = useScopes(isEditing ? editData.scope_type : member.scope_type);

  // Reset scope_code when scope_type changes in edit mode
  useEffect(() => {
    if (isEditing) {
      setEditData(prev => ({ ...prev, scope_code: '' }));
    }
  }, [editData.scope_type, isEditing]);

  const getAvatarUrl = (avatarUrl) => avatarUrl ? avatarUrl : "/user.png";
  const getScopeName = (scopeCode) => scopes?.find(s => s.scope_code === scopeCode)?.name || scopeCode;

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      scope_code: member.scope_code,
      scope_type: member.scope_type,
      scope_role: member.scope_role
    });
    setIsEditing(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.userInfo}>
          <div className={styles.avatarContainer}>
            <Image
              src={getAvatarUrl(member.avatar_url)}
              alt={`${member.user_name}'s avatar`}
              width={50}
              height={50}
              className={styles.avatar}
              onError={(e) => { e.target.src = "/user.png"; }}
            />
          </div>
          <div>
            <h3 className={styles.userName}>{member.name || 'Unknown User'}</h3>
            <h5 className={styles.label}>{member.stakeholder_name || 'N/A'}</h5>
          </div>
        </div>
      </div>

      <div className={styles.cardContent}>
        {!isEditing ? (
          // View Mode
          <>
            <div className={styles.detailRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{member.email || 'N/A'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Role:</span>
              <span className={styles.value}>{member.scope_type} {member.scope_role}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Scope Name:</span>
              <span className={styles.value}>
                {getScopeName(member.ward_code)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Joined:</span>
              <span className={styles.value}>
                {new Date(member.joined_at).toLocaleDateString()}
              </span>
            </div>
            {member.designation && (
              <div className={styles.detailRow}>
                <span className={styles.label}>Designation:</span>
                <span className={styles.value}>{member.designation}</span>
              </div>
            )}
          </>
        ) : (
          // Edit Mode
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>Scope Type:</label>
              <select
                value={editData.scope_type}
                onChange={(e) => setEditData(prev => ({ ...prev, scope_type: e.target.value }))}
                className={styles.select}
              >
                <option value="Ward">Ward</option>
                <option value="City">City</option>
                <option value="Region">Region</option>
                <option value="State">State</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {editData.scope_type}:
              </label>
              <select
                value={editData.scope_code}
                onChange={(e) => setEditData(prev => ({ ...prev, scope_code: e.target.value }))}
                className={styles.select}
                disabled={!scopes}
              >
                <option value="">Select {editData.scope_type}</option>
                {scopes?.map(scope => (
                  <option key={scope.scope_code} value={scope.scope_code}>
                    {scope.name} ({scope.scope_code})
                  </option>
                ))}
              </select>
              {!scopes && (
                <div className={styles.loadingText}>Loading {editData.scope_type}s...</div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Role:</label>
              <select
                value={editData.scope_role}
                onChange={(e) => setEditData(prev => ({ ...prev, scope_role: e.target.value }))}
                className={styles.select}
              >
                <option value="Member">Member</option>
                <option value="Co Convenor">Co-Convenor</option>
                <option value="Convenor">Convenor</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.footerContent}>
          {member.assigned_by_name && (
            <div className={styles.assignedBy}>
              Assigned by: {member.assigned_by_name}
            </div>
          )}
          
          <ButtonGroup>
            {!isEditing ? (
              <>
                <EditButton
                  size="small"
                  onClick={() => setIsEditing(true)}
                  disabled={processing}
                />
                <DeleteButton
                  size="small"
                  onClick={onRemove}
                  disabled={processing}
                  loading={processing}
                />
              </>
            ) : (
              <>
                <SaveButton
                  size="small"
                  onClick={handleSave}
                  disabled={processing || !editData.scope_code}
                  loading={processing}
                />
                <CancelButton
                  size="small"
                  onClick={handleCancel}
                  disabled={processing}
                />
              </>
            )}
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}