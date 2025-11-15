// components/admin/tabs/AnnouncementAdmin.js
import { useState, useEffect } from "react";
import { useWard } from "context/WardContext";
import { useAdmin } from "context/AdminContext";
import { useAlert } from "hooks/useAlert";
import useWardCRUD from "hooks/useWardCRUD";
import { useAdminWardAnnouncements } from "hooks/useWardData";
import { AddButton, EditButton, PublishButton, DeleteButton, SaveButton, CancelButton } from "components/shared/ui/Buttons";
import ButtonGroup from "components/shared/ui/ButtonGroup";
import AnnouncementFileManager from "components/admin/AnnouncementFileManager";
import StatusBadge from 'components/shared/card/StatusBadge';
import styles from "styles/tabs/announcement.module.css";
import { FaBullhorn } from "react-icons/fa";

export default function AnnouncementAdmin() {
  const { wardCode } = useWard();
  const { isAdmin } = useAdmin();
  const { create, update, remove } = useWardCRUD("ward_announcement", wardCode);
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();

  const { data: announcements, loading, error, refresh } = useAdminWardAnnouncements(wardCode);
  
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
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
  });
  const [saving, setSaving] = useState(false);
  const [publishingStates, setPublishingStates] = useState({});
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState(null);

  const actionTypes = [
    { value: "Community Walk", label: "Community Walk" },
    { value: "Community Talk", label: "Community Talk" },
    { value: "Student Engagement", label: "Student Engagement" },
    { value: "Survey", label: "Survey" },
    { value: "Documentation", label: "Documentation" },
    { value: "Mapping", label: "Mapping" }
  ];

  // Reset form when editing changes
  useEffect(() => {
    if (editing) {
      // Remove the 'files' field if it exists to avoid schema issues
      const { files, ...cleanEditing } = editing;
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
        ...cleanEditing
      });
    }
  }, [editing]);

  const handleCreate = async (announcementData) => {
    try {
      // Clean the data before sending - remove any non-table fields
      const cleanData = Object.fromEntries(
        Object.entries(announcementData).filter(([key, v]) => 
          v !== undefined && 
          v !== null && 
          key !== 'files' && // Remove files field
          key !== 'id' // Remove ID for new announcements
        )
      );
      
      const result = await create(cleanData);
      showSuccessAlert({ message: "Announcement created successfully!" });
      await refresh();
      return result;
    } catch (err) {
      showErrorAlert({ 
        message: "Failed to create announcement", 
        errorDetails: err.message 
      });
      throw err;
    }
  };

  const handleUpdate = async (id, announcementData) => {
    try {
      // Clean the data before sending - remove any non-table fields
      const cleanData = Object.fromEntries(
        Object.entries(announcementData).filter(([key, v]) => 
          v !== undefined && 
          v !== null && 
          key !== 'files' && // Remove files field
          key !== 'id' // Keep ID for updates but don't send it in data
        )
      );
      
      await update(id, cleanData);
      showSuccessAlert({ message: "Announcement updated successfully!" });
      await refresh();
    } catch (err) {
      showErrorAlert({ 
        message: "Failed to update announcement", 
        errorDetails: err.message 
      });
      throw err;
    }
  };

  const handleDelete = async (id) => {
    setDeletingAnnouncementId(id);
    showConfirmAlert({
      title: "Delete Announcement?",
      message: "This will remove the announcement and all its files.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await remove(id);
          showSuccessAlert({ message: "Announcement deleted successfully!" });
          if (editing && editing.id === id) setEditing(null);
          await refresh();
        } catch (err) {
          showErrorAlert({ 
            message: "Failed to delete announcement", 
            errorDetails: err.message 
          });
        } finally {
          setDeletingAnnouncementId(null);
        }
      },
      onCancel: () => {
        setDeletingAnnouncementId(null);
      }
    });
  };

  const handlePublish = async (announcementId, publishState) => {
    try {
      setPublishingStates(prev => ({ ...prev, [announcementId]: true }));
      // Only send the is_published field for publish operations
      await update(announcementId, { is_published: publishState });
      showSuccessAlert({ 
        message: `Announcement ${publishState ? 'published' : 'unpublished'} successfully!` 
      });
      await refresh();
    } catch (err) {
      showErrorAlert({ 
        message: `Failed to ${publishState ? 'publish' : 'unpublish'} announcement`, 
        errorDetails: err.message 
      });
    } finally {
      setPublishingStates(prev => ({ ...prev, [announcementId]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (form.id) {
        await handleUpdate(form.id, form);
        setEditing(null);
      } else {
        await handleCreate(form);
        setEditing(null);
      }
    } catch (error) {
      // Error handled in individual methods
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(null);
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
    });
  };

  if (!isAdmin) {
    return (
      <div className={styles.adminPanel}>
        <AlertComponent />
        <div className={styles.errorMessage}>
          You don't have access to manage announcements.
        </div>
      </div>
    );
  }

  if (loading) return <div className={styles.loading}>Loading announcements...</div>;
  if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

  return (
    <div className={styles.adminPanel}>
      <AlertComponent />

      <ButtonGroup>
        <AddButton
          variant="outline"
          onClick={() => setEditing({})}
          disabled={loading}
        >
          New Announcement
        </AddButton>
      </ButtonGroup>

      {/* Announcements List */}
      <div className={styles.adminList}>
        {announcements && announcements.length === 0 && !editing ? (
          <div className={styles.emptyState}>
            <p>No announcements yet. Create your first announcement to invite community members to action!</p>
          </div>
        ) : (
          announcements?.map((announcement) => (
            <div key={announcement.id} className={styles.adminAnnouncementItem}>
              <div className={styles.announcementPreview}>
                <h4><FaBullhorn /> {announcement.title}</h4>
                <div className={styles.announcementMeta}>
                  <span className={styles.actionType}>{announcement.action_type}</span>
                  <span className={styles.scheduledDate}>
                    {announcement.scheduled_date ? 
                      new Date(announcement.scheduled_date).toLocaleDateString() : 
                      'No date set'
                    }
                  </span>
                  <StatusBadge 
                    status={announcement.is_published ? 'published' : 'draft'}
                    variant="badge"
                    customLabel={announcement.is_published ? 'Published' : 'Draft'}
                  />
                </div>
              </div>
              <ButtonGroup>
                <EditButton
                  onClick={() => setEditing(announcement)}
                />
                <PublishButton
                  published={announcement.is_published}
                  publishing={publishingStates[announcement.id]}
                  onClick={() => handlePublish(announcement.id, !announcement.is_published)}
                  disabled={publishingStates[announcement.id]}
                />
                <DeleteButton
                  onClick={() => handleDelete(announcement.id)}
                  disabled={deletingAnnouncementId === announcement.id}
                />
              </ButtonGroup>
            </div>
          ))
        )}
      </div>

      {/* Announcement Form */}
      {editing !== null && (
        <form onSubmit={handleSubmit} className={styles.announcementForm}>
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

          {/* File Manager - Only show for existing announcements */}
          {form.id && wardCode && (
            <AnnouncementFileManager 
              announcementId={form.id}
              wardCode={wardCode}
            />        
          )}

          {/* Form Actions */}
          <div className={styles.formActions}>
            <ButtonGroup>
              <SaveButton saving={saving} type="submit" disabled={saving}>
                {saving ? 'Saving...' : (form.id ? 'Update Announcement' : 'Save Announcement')}
              </SaveButton>
              
              <CancelButton onClick={handleCancel} />
            </ButtonGroup>
          </div>

          {!form.id && (
            <div className={styles.helperNote}>
              <p>💡 <strong>Note:</strong> You'll be able to upload files after saving the announcement.</p>
            </div>
          )}
        </form>
      )}      
    </div>
  );
}