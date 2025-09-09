// components/ward/tabs/MeetingTab.js
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useWard } from "context/WardContext";
import useWardMeetings from "hooks/useWardMeetings";
import useMeetingImages from "hooks/useMeetingImages";
import ImageStackPopup from "components/shared/image/ImageStackPopup";
import Spinner from "components/shared/ui/Spinner";
import styles from "styles/layout/timeline.module.css";
import { 
  FaMapMarkerAlt, 
  FaUserFriends, 
  FaStar, 
  FaUsers 
} from "react-icons/fa";

export default function MeetingTab() {
  const { wardId } = useWard();
  const { meetings, loading, error } = useWardMeetings(wardId);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImages, setPopupImages] = useState([]);

  if (loading) return <Spinner />;
  if (error) return <div>Error loading meetings: {error.message}</div>;

  // Helper function to format dates
  const formatDate = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper function to render discussion points
  const renderDiscussion = (discussion) => {
    if (!discussion) return null;

    const points = Array.isArray(discussion)
      ? discussion
      : discussion.split("\n").filter((s) => s.trim());

    return (
      <div className={styles.discussionSection}>
        <h5 className={styles.sectionTitle}>Discussion Points</h5>
        <ul className={styles.discussionList}>
          {points.map((pt, i) => (
            <li key={i} className={styles.discussionPoint}>
              <span className={styles.bullet}>•</span>
              {pt}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Helper function to render meeting details
  const MeetingDetails = ({ item }) => (
    <div className={styles.meetingDetails}>
      {item.location && (
        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>
            <FaMapMarkerAlt color="#e53935" />
          </span>
          <span className={styles.detailText}>
            <strong>Location: </strong>
            {item.location}
          </span>
        </div>
      )}
      {item.notable_attendees && (
        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>
            <FaUserFriends color="#333" />
          </span>
          <span className={styles.detailText}>
            <strong>Key Attendees: </strong>
            {item.notable_attendees}
          </span>
        </div>
      )}
      {item.mood_rating && (
        <div className={styles.detailItem}>
          <span className={styles.detailIcon}>
            <FaStar />
          </span>
          <span className={styles.detailText}>
            <strong>Mood: </strong>
            {item.mood_rating}/10
          </span>
        </div>
      )}
      {renderDiscussion(item.discussion)}
    </div>
  );

  // Component for individual timeline items (desktop view)
  const TimelineItemMeeting = ({ item, index }) => {
    const { images, resolveUrl } = useMeetingImages(item.id);
    const isLeft = index % 2 === 0;

    const thumbnailsToShow = useMemo(() => {
      if (images.length <= 1) return images;
      return [...images].sort(() => 0.5 - Math.random()).slice(0, 1);
    }, [images]);

    const handleImageClick = () => {
      setPopupImages(images.map(img => resolveUrl(img.path)));
      setIsPopupOpen(true);
    };

    const renderCard = () => (
      <motion.div
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, delay: index * 0.1 }}
        className={`${styles.timelineCard} ${styles.meetingCard}`}
      >
        <div className={styles.cardHeader}>
          <h4 className={styles.timelineCardTitle}>{item.title}</h4>
          <span className={styles.cardTypeBadge}>{formatDate(item.date)}</span>
        </div>
        <MeetingDetails item={item} />
      </motion.div>
    );

    const renderImageContainer = () => (
      <motion.div
        className={styles.imageContainer}
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, delay: index * 0.1 }}
      >
        <div className={styles.imageHeader}></div>
        <div className={styles.imageThumbs}>
          {images.length > 0 ? (
            <>
              {thumbnailsToShow.map((img, idx) => (
                <div key={idx} className={styles.imageWrapper}>
                  <img
                    src={resolveUrl(img.path)}
                    alt=""
                    onClick={handleImageClick}
                  />
                </div>
              ))}
              {images.length > thumbnailsToShow.length && (
                <div
                  className={styles.moreImages}
                  onClick={handleImageClick}
                >
                  +{images.length - thumbnailsToShow.length}
                </div>
              )}
            </>
          ) : (
            <p></p>
          )}
        </div>
      </motion.div>
    );

    return (
      <div className={`${styles.timelineItemMeeting} ${isLeft ? styles.left : styles.right}`}>
        <div className={styles.timelineSide}>
          {isLeft ? renderCard() : renderImageContainer()}
        </div>

        <div className={styles.timelineIconWrapper}>
          <FaUsers className={styles.timelineIconFa} />
        </div>

        <div className={styles.timelineSide}>
          {!isLeft ? renderCard() : renderImageContainer()}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop View */}
      <div className={styles.timelineWrapper}>
        {meetings.length === 0 ? (
          <p className={styles.emptyTimeline}>No meetings yet.</p>
        ) : (
          meetings.map((item, index) => (
            <TimelineItemMeeting
              key={item.id}
              item={item}
              index={index}
            />
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