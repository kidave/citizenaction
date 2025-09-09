// components/admin/MeetingAdmin.js
import { useState } from "react";
import { motion } from "framer-motion";
import { useWard } from "context/WardContext";
import { useAuth } from "context/AuthContext";
import useAdminMeetings from "hooks/useAdminMeetings";
import useWardCRUD from "hooks/useWardCRUD";
import useMeetingImages from "hooks/useMeetingImages";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import MeetingCard from "components/shared/MeetingCard";
import ImageManager from "components/admin/ImageManager";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/layout/timeline.module.css";
import { FaUsers, FaPlus } from "react-icons/fa";

export default function MeetingAdmin() {
  const { wardId } = useWard();
  const { getAccessToken } = useAuth();
  const { meetings, loading, error, setMeetings } = useAdminMeetings(wardId);
  const { create, update, remove } = useWardCRUD("meeting", wardId);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImages, setPopupImages] = useState([]);
  const [newMeeting, setNewMeeting] = useState(null);
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);

  const refreshMeetings = async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/ward/${wardId}/meeting/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setMeetings(data || []);
      }
    } catch (err) {
      console.error("Failed to refresh meetings:", err);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await create(formData);
      setNewMeeting(null);
      refreshMeetings();
    } catch (err) {
      console.error("Failed to create meeting:", err);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await update(id, formData);
      refreshMeetings();
    } catch (err) {
      console.error("Failed to update meeting:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this meeting and all its images?")) {
      try {
        await remove(id);
        refreshMeetings();
      } catch (err) {
        console.error("Failed to delete meeting:", err);
      }
    }
  };

  const toggleImageManager = (meetingId) => {
    setExpandedMeetingId(expandedMeetingId === meetingId ? null : meetingId);
  };

  if (loading) return <Spinner />;
  if (error) return <div>Error loading meetings: {error}</div>;

  return (
    <>
      {/* Add meeting button */}
      <div className={styles.addButtonContainer}>
        <motion.button 
          className={styles.addButton}
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
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        > 
          <FaPlus className={styles.addButtonIconFa} />
          <div className={styles.addButtonText}>Add Meeting</div>
        </motion.button>
      </div>

      {/* New meeting card */}
      {newMeeting && (
        <MeetingCard
          item={newMeeting}
          index={-1}
          onUpdate={(id, formData) => {
            handleCreate(formData);
          }}
          onDelete={() => {
            setNewMeeting(null);
          }}
          isNew={true}
        />
      )}

      {/* Timeline View */}
      <div className={styles.timelineWrapper}>
        {meetings.length === 0 && !newMeeting ? (
          <p className={styles.emptyTimeline}>No meetings yet.</p>
        ) : (
          meetings.map((item, index) => (
            <div key={item.id} className={`${styles.timelineItemMeeting} ${index % 2 === 0 ? styles.left : styles.right}`}>
              <div className={styles.timelineSide}>
                {index % 2 === 0 ? (
                  <>
                    <MeetingCard
                      item={item}
                      index={index}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  </>
                ) : (
                  <>
                    <div className={styles.imageManagerToggle}>
                      <button 
                        onClick={() => toggleImageManager(item.id)}
                        className={styles.toggleButton}
                      >
                        {expandedMeetingId === item.id ? "Hide Images" : "Manage Images"}
                      </button>
                    </div>
                    {expandedMeetingId === item.id && (
                      <ImageManager meetingId={item.id} wardId={wardId} />
                    )}
                    <ImageContainer 
                      meetingId={item.id} 
                      wardId={wardId}
                      onImageClick={(images) => {
                        setPopupImages(images);
                        setIsPopupOpen(true);
                      }}
                    />
                  </>
                )}
              </div>

              <div className={styles.timelineIconWrapper}>
                <FaUsers className={styles.timelineIconFa} />
              </div>

              <div className={styles.timelineSide}>
                {index % 2 !== 0 ? (
                  <>
                    <MeetingCard
                      item={item}
                      index={index}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  </>
                ) : (
                  <>
                    <div className={styles.imageManagerToggle}>
                      <button 
                        onClick={() => toggleImageManager(item.id)}
                        className={styles.toggleButton}
                      >
                        {expandedMeetingId === item.id ? "Hide Images" : "Manage Images"}
                      </button>
                    </div>
                    {expandedMeetingId === item.id && (
                      <ImageManager meetingId={item.id} wardId={wardId} />
                    )}
                    <ImageContainer 
                      meetingId={item.id} 
                      wardId={wardId}
                      onImageClick={(images) => {
                        setPopupImages(images);
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
          images={popupImages}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  );
}

// Helper component for images
function ImageContainer({ meetingId, wardId, onImageClick }) {
  const { images, resolveUrl } = useMeetingImages(meetingId);
  
  const handleClick = () => {
    onImageClick(images.map(img => resolveUrl(img.path)));
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
        {images.length > 0 ? (
          <>
            {images.slice(0, 1).map((img, idx) => (
              <div key={idx} className={styles.imageWrapper}>
                <img
                  src={resolveUrl(img.path)}
                  alt=""
                  onClick={handleClick}
                />
              </div>
            ))}
            {images.length > 1 && (
              <div
                className={styles.moreImages}
                onClick={handleClick}
              >
                +{images.length - 1}
              </div>
            )}
          </>
        ) : (
          <p className={styles.noImagesPreview}>No images</p>
        )}
      </div>
    </motion.div>
  );
}