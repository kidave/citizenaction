// components/profile/ProfileView.jsx
import { useState, useEffect } from "react";
import { useAuth } from "context/AuthContext";
import { BaseButton, EditButton, SaveButton, CancelButton } from "components/ui/button";
import { FiEdit2 } from "react-icons/fi";
import styles from "./ProfileView.module.css";

export default function ProfileView({ userId, isEditable = true }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
      const data = await response.json();
      setProfile(data);
      setFormData(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!profile) return <div className={styles.notFound}>Profile not found</div>;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Profile Information</h2>
        {isEditable && !isEditing && (
          <EditButton
            onClick={() => setIsEditing(true)}
            showIcon={true}
            icon={<FiEdit2 />}
          >
            Edit Profile
          </EditButton>
        )}
      </div>

      <div className={styles.profileContent}>
        <ProfileField
          label="Name"
          value={profile.name}
          isEditing={isEditing}
          field="name"
          formData={formData}
          onChange={setFormData}
        />
        <ProfileField
          label="Email"
          value={user?.email}
          isEditing={false}
        />
        <ProfileField
          label="Phone"
          value={profile.mobile}
          isEditing={isEditing}
          field="mobile"
          formData={formData}
          onChange={setFormData}
        />
        <ProfileField
          label="Designation"
          value={profile.designation}
          isEditing={isEditing}
          field="designation"
          formData={formData}
          onChange={setFormData}
        />
        <ProfileField
          label="Locality"
          value={profile.locality}
          isEditing={isEditing}
          field="locality"
          formData={formData}
          onChange={setFormData}
        />
      </div>

      {isEditing && (
        <div className={styles.actionButtons}>
          <SaveButton onClick={handleSave}>Save Changes</SaveButton>
          <CancelButton onClick={() => setIsEditing(false)}>Cancel</CancelButton>
        </div>
      )}
    </div>
  );
}

function ProfileField({ label, value, isEditing, field, formData, onChange }) {
  if (isEditing && field) {
    return (
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{label}</label>
        <input
          type="text"
          value={formData[field] || ""}
          onChange={(e) => onChange({ ...formData, [field]: e.target.value })}
          className={styles.fieldInput}
        />
      </div>
    );
  }

  return (
    <div className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{label}:</span>
      <span className={styles.fieldValue}>{value || "Not provided"}</span>
    </div>
  );
}