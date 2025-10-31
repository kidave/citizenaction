// components/ward/tabs/MeetingTab.js
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
    const safeImages = item.images || [];
    const thumbnails = safeImages.slice(0, 1);

    const handleImageClick = (clickedIndex = 0) => {
      const imageUrls = safeImages.map((img) => img.path);
      setPopupImages(imageUrls);
      setStartImageIndex(clickedIndex);
      setIsPopupOpen(true);
    };

    const renderImageContainer = () => (
      <motion.div
        className={styles.imageContainer}
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.imageThumbs}>
          {safeImages.length > 0 ? (
            <>
              {thumbnails.map((img, idx) => (
                <div key={img.id || idx} className={styles.imageWrapper}>
                  <img src={img.path} alt="" onClick={() => handleImageClick(idx)} />
                </div>
              ))}
              {safeImages.length > thumbnails.length && (
                <div className={styles.moreImages} onClick={() => handleImageClick(0)}>
                  +{safeImages.length - thumbnails.length}
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
            renderImageContainer()
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
            renderImageContainer()
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Meeting Information Sections */}
      <MeetingInfo />

      {/* Actual Meetings Timeline */}
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