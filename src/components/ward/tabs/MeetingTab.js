// components/ward/tabs/MeetingTab
import { useState } from "react";
import { motion } from "framer-motion";
import { useWard } from "context/WardContext";
import { useWardMeetings } from "hooks/useWardData";
import MeetingCard from "components/shared/card/MeetingCard";
import MeetingInfo from "components/shared/card/MeetingInfo";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import styles from "styles/tabs/timeline.module.css";

export default function MeetingTab() {
  const { wardCode } = useWard();
  const { data: meetings, loading, error } = useWardMeetings(wardCode);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImages, setPopupImages] = useState([]);
  const [startImageIndex, setStartImageIndex] = useState(0);

  if (loading) return <div>Loading meetings...</div>;
  if (error) return <div>Error loading meetings: {error.message}</div>;

  const TimelineItemMeeting = ({ item, index }) => {
    const isLeft = index % 2 === 0;
    
    const safeFiles = item.files || [];
    const thumbnails = safeFiles.slice(0, 1);

    const handleImageClick = (clickedIndex = 0) => {
      const imageUrls = safeFiles.map((file) => file.path);
      setPopupImages(imageUrls);
      setStartImageIndex(clickedIndex);
      setIsPopupOpen(true);
    };

    const renderFileContainer = () => (
      <motion.div
        className={styles.imageContainer}
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.imageThumbs}>
          {safeFiles.length > 0 ? (
            <>
              {thumbnails.map((file, idx) => (
                <div key={file.id || idx} className={styles.imageWrapper}>
                  <img src={file.path} alt="" onClick={() => handleImageClick(idx)} />
                </div>
              ))}
              {safeFiles.length > thumbnails.length && (
                <div className={styles.moreImages} onClick={() => handleImageClick(0)}>
                  +{safeFiles.length - thumbnails.length}
                </div>
              )}
            </>
          ) : <p></p>}
        </div>
      </motion.div>
    );

    return (
      <div className={`${styles.timelineItemMeeting} ${isLeft ? styles.left : styles.right}`}>
        <div className={styles.timelineSide}>
          {isLeft ? (
            <MeetingCard
              item={item}
              index={index}
              editable={false}
            />
          ) : (
            renderFileContainer()
          )}
        </div>

        <div className={styles.timelineSide}>
          {!isLeft ? (
            <MeetingCard
              item={item}
              index={index}
              editable={false}
            />
          ) : (
            renderFileContainer()
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <MeetingInfo />

      {!meetings || meetings.length === 0 ? (
        <p className={styles.emptyTimeline}>No meetings yet.</p>
      ) : (
        <>
          <div className={styles.timelineWrapper}>
            {meetings.map((item, index) => (
              <TimelineItemMeeting key={item.id} item={item} index={index} />
            ))}
          </div>

          {isPopupOpen && (
            <ImageStackPopup
              files={popupImages}
              startIndex={startImageIndex}
              onClose={() => setIsPopupOpen(false)}
            />
          )}
        </>
      )}
    </>
  );
}