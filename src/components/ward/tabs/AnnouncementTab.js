// components/ward/tabs/AnnouncementTab.js
import { useState } from "react";
import { motion } from "framer-motion";
import { useWard } from "context/WardContext";
import { useWardAnnouncements } from "hooks/useWardData";
import AnnouncementCard from "components/shared/card/AnnouncementCard";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import styles from "styles/tabs/announcement.module.css";

export default function AnnouncementTab() {
  const { wardCode } = useWard();
  const { data: announcements, loading, error } = useWardAnnouncements(wardCode);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupFiles, setPopupFiles] = useState([]);

  if (loading) return <p>Loading announcements...</p>;
  if (error) return <div>Error loading announcements: {error.message}</div>;

  return (
    <div className={styles.announcementContainer}>
      {!announcements || announcements.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No upcoming announcements</h3>
          <p>Check back later for community actions and events in your ward.</p>
        </div>
      ) : (
        <div className={styles.announcementList}>
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              className={styles.announcementRow}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={styles.infoSection}>
                <AnnouncementCard
                  announcement={announcement}
                />
              </div>
              
              {/* Image Section */}
              {announcement.files && announcement.files.length > 0 && (
                <div className={styles.imageSection}>
                  <div 
                    className={styles.mainImage}
                    onClick={() => {
                      setPopupFiles(announcement.files);
                      setIsPopupOpen(true);
                    }}
                  >
                    <img
                      src={announcement.files[0].path}
                      alt={announcement.files[0].caption || 'Announcement image'}
                      className={styles.responsiveImage}
                    />
                    {announcement.files.length > 1 && (
                      <div className={styles.imageCount}>
                        +{announcement.files.length - 1}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {isPopupOpen && (
        <ImageStackPopup 
          files={popupFiles} 
          onClose={() => setIsPopupOpen(false)} 
        />
      )}
    </div>
  );
}