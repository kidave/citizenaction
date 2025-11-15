// components/admin/AnnouncementForm.js
import { useState, useEffect } from "react";
import { useAlert } from "hooks/useAlert";
import { SaveButton, CancelButton, PublishButton } from "components/shared/ui/Buttons";
import ButtonGroup from "components/shared/ui/ButtonGroup";
import AnnouncementFileManager from "components/admin/AnnouncementFileManager";
import styles from "styles/tabs/announcement.module.css";

export default function AnnouncementForm({ 
  wardCode,
  announcement = {}, 
  onSave, 
  onCancel,
}) {
  const { showErrorAlert, AlertComponent } = useAlert();
  
  const [form, setForm] = useState(() => ({
    title: "",
    action_type: "Community Walk",
    agenda: "",
    call_to_action: "",
    landmark_start: "",
    landmark_end: "",
    roads_fid: null,
    junction_fid: null,
    scheduled_date: "",
    meeting_point: "",
    contact_info: "",
    is_published: false,
    ...announcement
  }));

  const [saving, setSaving] = useState(false);
  const [savedAnnouncement, setSavedAnnouncement] = useState(null);

  useEffect(() => {
    setForm({ 
      title: "",
      action_type: "Community Walk",
      agenda: "",
      call_to_action: "",
      landmark_start: "",
      landmark_end: "",
      roads_fid: null,
      junction_fid: null,
      scheduled_date: "",
      meeting_point: "",
      contact_info: "",
      is_published: false,
      ...announcement 
    });
    if (announcement.id) {
        setSavedAnnouncement(announcement);
      }
  }, [announcement]);

  const actionTypes = [
    { value: "Community Walk", label: "Community Walk" },
    { value: "Community Talk", label: "Community Talk" },
    { value: "Student Engagement", label: "Student Engagement" },
    { value: "Survey", label: "Survey" },
    { value: "Documentation", label: "Documentation" },
    { value: "Mapping", label: "Mapping" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const result = await onSave(form);
      // If this is a new announcement, set the saved announcement with ID
      if (!announcement.id && result && result.id) {
        setSavedAnnouncement(result);
      }
    } catch (error) {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  const announcementId = savedAnnouncement?.id || announcement.id || null;

  return (
    <form onSubmit={handleSubmit} className={styles.announcementForm}>
      <AlertComponent />

      <div className={styles.formGrid}>
        {/* Basic Information */}
        <div className={styles.formSection}>
          <h4>Basic Information</h4>
          
          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter announcement title"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Action Type *</label>
            <select
              value={form.action_type}
              onChange={(e) => setForm({ ...form, action_type: e.target.value })}
              required
            >
              {actionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Agenda *</label>
            <textarea
              value={form.agenda}
              onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              placeholder="Describe what will happen during this action..."
              rows={4}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Call to Action *</label>
            <textarea
              value={form.call_to_action}
              onChange={(e) => setForm({ ...form, call_to_action: e.target.value })}
              placeholder="How can people join? What should they bring?"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Location & Timing */}
        <div className={styles.formSection}>
          <h4>Location & Timing</h4>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Landmark Start</label>
              <input
                type="text"
                value={form.landmark_start}
                onChange={(e) => setForm({ ...form, landmark_start: e.target.value })}
                placeholder="Starting point landmark"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Landmark End</label>
              <input
                type="text"
                value={form.landmark_end}
                onChange={(e) => setForm({ ...form, landmark_end: e.target.value })}
                placeholder="Ending point landmark"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Meeting Point</label>
            <input
              type="text"
              value={form.meeting_point}
              onChange={(e) => setForm({ ...form, meeting_point: e.target.value })}
              placeholder="Where should people gather?"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={form.scheduled_date}
              onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Contact Information</label>
            <input
              type="text"
              value={form.contact_info}
              onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
              placeholder="Phone number, email, or contact person"
            />
          </div>
        </div>
      </div>
      {announcementId && wardCode && (
        <AnnouncementFileManager 
          announcementId={announcementId}
          wardCode={wardCode}
        />
      )}

      {/* Form Actions */}
      <ButtonGroup>
        <SaveButton saving={saving} type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Announcement'}
        </SaveButton>
        
        <CancelButton onClick={onCancel} />
      </ButtonGroup>
    </form>
  );
}