// components/admin/MeetingAdmin.js
import { useState } from "react";
import { motion } from "framer-motion";
import { useWard } from "context/WardContext";
import { useAdmin } from "context/AdminContext";
import { useAlert } from "hooks/useAlert";
import useWardCRUD from "hooks/useWardCRUD";
import { useAdminWardMeetings } from "hooks/useWardData";
import { useMeetingImages } from "hooks/useImages";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import MeetingCard from "components/shared/card/MeetingCard";
import MeetingImageManager from "components/admin/MeetingImageManager";
import ButtonGroup from "components/shared/ui/ButtonGroup";
import { AddButton, ImageButton } from "components/shared/ui/Buttons";
import styles from "styles/tabs/timeline.module.css";

export default function MeetingAdmin() {
  const { wardId } = useWard();
  const { isAdmin } = useAdmin();
  const { create, update, remove } = useWardCRUD("meeting", wardId);
  const { showConfirmAlert, showSuccessAlert, showErrorAlert, AlertComponent } = useAlert();

  const { data: meetings, loading, error, refresh } = useAdminWardMeetings(wardId);
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupFiles, setPopupFiles] = useState([]);
  const [newMeeting, setNewMeeting] = useState(null);
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);
  const [publishingStates, setPublishingStates] = useState({});
  const [deletingMeetingId, setDeletingMeetingId] = useState(null);

  const handleCreate = async (formData) => {
    try {
      await create(formData);
      setNewMeeting(null);
      showSuccessAlert({ message: "Meeting created successfully!" });
      await refresh();
    } catch (err) {
      showErrorAlert({ 
        message: "Failed to create meeting", 
        errorDetails: err.message 
      });
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await update(id, formData);
      showSuccessAlert({ message: "Meeting updated successfully!" });
      await refresh();
    } catch (err) {
      showErrorAlert({ 
        message: "Failed to update meeting", 
        errorDetails: err.message 
      });
    }
  };

  const handleDelete = async (id) => {
    setDeletingMeetingId(id);
    showConfirmAlert({
      title: "Delete Meeting",
      message: "Are you sure you want to delete this meeting and all its files?",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await remove(id);
          showSuccessAlert({ message: "Meeting deleted successfully!" });
          await refresh();
        } catch (err) {
          showErrorAlert({ 
            message: "Failed to delete meeting", 
            errorDetails: err.message 
          });
        } finally {
          setDeletingMeetingId(null);
        }
      },
      onCancel: () => {
        setDeletingMeetingId(null);
      }
    });
  };

  const handlePublish = async (meetingId, publishState) => {
    try {
      setPublishingStates(prev => ({ ...prev, [meetingId]: true }));
      // Use update function to change is_published status
      await update(meetingId, { is_published: publishState });
      showSuccessAlert({ 
        message: `Meeting ${publishState ? 'published' : 'unpublished'} successfully!` 
      });
      await refresh();
    } catch (err) {
      showErrorAlert({ 
        message: `Failed to ${publishState ? 'publish' : 'unpublish'} meeting`, 
        errorDetails: err.message 
      });
    } finally {
      setPublishingStates(prev => ({ ...prev, [meetingId]: false }));
    }
  };

  const toggleImageManager = (meetingId) => {
    setExpandedMeetingId(expandedMeetingId === meetingId ? null : meetingId);
  };

  if (!isAdmin) {
    return (
      <div className={styles.adminPanel}>
        <AlertComponent />
        <div className={styles.errorMessage}>
          You don't have access to manage meetings.
        </div>
      </div>
    );
  }

  if (loading) return <div className={styles.loading}>Loading meetings...</div>;
  if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

  return (
    <>
      <AlertComponent />

      {/* Add meeting button */}
      <div className={styles.addButtonContainer}>
        <AddButton
          onClick={() => {
            setNewMeeting({
              id: "new",
              title: "",
              date: new Date().toISOString().split('T')[0],
              location: "",
              notable_attendees: "",
              discussion: "",
              mood_rating: 5,
            });
          }}
          variant="outline"
          disabled={loading}
        >
          Add Meeting
        </AddButton>
      </div>

      {/* New meeting card */}
      {newMeeting && (
        <MeetingCard
          item={newMeeting}
          index={-1}
          editable={true}
          onUpdate={(id, formData) => {
            handleCreate(formData);
          }}
          onDelete={() => {
            setNewMeeting(null);
          }}
          isNew={true}
          deleting={false}
        />
      )}

      {/* Timeline View */}
      <div className={styles.timelineWrapper}>
        {meetings && meetings.length === 0 && !newMeeting ? (
          <p className={styles.emptyTimeline}>No meetings yet.</p>
        ) : (
          meetings?.map((item, index) => (
            <div key={item.id} className={`${styles.timelineItemMeeting} ${index % 2 === 0 ? styles.left : styles.right}`}>
              <div className={styles.timelineSide}>
                {index % 2 === 0 ? (
                  <MeetingCard
                    item={item}
                    index={index}
                    editable={true}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onPublish={handlePublish}
                    publishingStates={publishingStates}
                    deleting={deletingMeetingId === item.id}
                  />
                ) : (
                  <>
                    <div className={styles.imageManagerToggle}>
                      <ImageButton 
                        onClick={() => toggleImageManager(item.id)}
                      >
                        {expandedMeetingId === item.id ? "Hide Files" : "Manage Files"}
                      </ImageButton>
                    </div>
                    {expandedMeetingId === item.id && (
                      <MeetingImageManager meetingId={item.id} wardId={wardId} refresh={refresh} />
                    )}
                    <FileContainer 
                      meetingId={item.id} 
                      onFileClick={(files) => {
                        setPopupFiles(files);
                        setIsPopupOpen(true);
                      }}
                    />
                  </>
                )}
              </div>

              <div className={styles.timelineSide}>
                {index % 2 !== 0 ? (
                  <>
                    <MeetingCard
                      item={item}
                      index={index}
                      editable={true}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      onPublish={handlePublish}
                      publishingStates={publishingStates}
                      deleting={deletingMeetingId === item.id}
                    />
                  </>
                ) : (
                  <>
                    <div className={styles.imageManagerToggle}>
                      <ImageButton 
                        onClick={() => toggleImageManager(item.id)}
                      >
                        {expandedMeetingId === item.id ? "Hide Files" : "Manage Files"}
                      </ImageButton>
                    </div>
                    {expandedMeetingId === item.id && (
                      <MeetingImageManager meetingId={item.id} wardId={wardId} refresh={refresh} />
                    )}
                    <FileContainer 
                      meetingId={item.id} 
                      onFileClick={(files) => {
                        setPopupFiles(files);
                        setIsPopupOpen(true);
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isPopupOpen && (
        <ImageStackPopup
          files={popupFiles}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  );
}

// Helper component for files
function FileContainer({ meetingId, onFileClick }) {
  const { files, resolveUrl } = useMeetingImages(meetingId);
  
  const handleClick = () => {
    onFileClick(files.map(file => resolveUrl(file.path)));
  };

  return (
    <motion.div
      className={styles.imageContainer}
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
    >
      <div className={styles.imageThumbs}>
        {files.length > 0 ? (
          <>
            {files.slice(0, 1).map((file, idx) => (
              <div key={idx} className={styles.imageWrapper}>
                <img
                  src={resolveUrl(file.path)}
                  alt=""
                  onClick={handleClick}
                />
              </div>
            ))}
            {files.length > 1 && (
              <div
                className={styles.moreImages}
                onClick={handleClick}
              >
                +{files.length - 1}
              </div>
            )}
          </>
        ) : (
          <p className={styles.noImagesPreview}>No files</p>
        )}
      </div>
    </motion.div>
  );
}