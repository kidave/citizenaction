// components/shared/card/AnnouncementCard.js
import { useState } from "react";
import styles from "styles/tabs/announcement.module.css";
import { MdOutlineEmail } from "react-icons/md";
import { FaMapMarkerAlt, FaRoute, FaCalendar, FaBullhorn, FaImages } from "react-icons/fa";
import { ImageButton } from "../ui/Buttons";
import ImageStackPopup from "components/shared/image/ImageStackPopup";

export default function AnnouncementCard({ 
  announcement,
}) {
  const [expanded, setExpanded] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupFiles, setPopupFiles] = useState([]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasLocationInfo = announcement.landmark_start || announcement.landmark_end;
  const hasImages = announcement.files && announcement.files.length > 0;
  const shouldShowExpand = announcement.agenda && announcement.agenda.length > 120;

  const handleViewImages = () => {
    console.log('🖱️ View Images clicked for:', announcement.title);
    console.log('📁 Raw files data:', announcement.files);
    
    if (announcement.files && announcement.files.length > 0) {
      // Extract just the file paths for the popup
      const filePaths = announcement.files.map(file => file.path);
      console.log('🖼️ File paths to display:', filePaths);
      
      setPopupFiles(filePaths);
      setIsPopupOpen(true);
    } else {
      console.log('❌ No files found for this announcement');
    }
  };

  // Debug: Log the files when component renders
  console.log('🔍 AnnouncementCard rendering:', {
    title: announcement.title,
    hasImages,
    filesCount: announcement.files?.length || 0,
    files: announcement.files
  });

  return (
    <div className={styles.announcementCardDetail}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.actionType}>
          <FaBullhorn />
          <span className={styles.actionLabel}>
            {announcement.action_type}
          </span>
        </div>
        {announcement.scheduled_date && (
          <div className={styles.scheduledDate}>
            <FaCalendar /> {formatDate(announcement.scheduled_date)}
          </div>
        )}
      </div>

      {/* Title */}
      <h4 className={styles.title}>
        {announcement.title}
      </h4>

      {/* Location Information */}
      {hasLocationInfo && (
        <div className={styles.locationInfo}>
          {announcement.landmark_start && announcement.landmark_end && (
            <div className={styles.route}>
              <FaRoute /> {announcement.landmark_start} → {announcement.landmark_end}
            </div>
          )}
          {announcement.meeting_point && (
            <div className={styles.meetingPoint}>
              <FaMapMarkerAlt /> Meet at: {announcement.meeting_point}
            </div>
          )}
        </div>
      )}

      {/* Content Wrapper with Flex Grow */}
      <div className={styles.cardContent}>
        {/* Agenda Preview */}
        <div className={styles.agenda}>
          <h4>Agenda:</h4>
          <div className={styles.agendaContent}>
            <p className={`${styles.agendaText} ${expanded ? styles.expanded : styles.collapsed}`}>
              {announcement.agenda}
            </p>
            {shouldShowExpand && (
              <button 
                className={styles.expandButton}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className={styles.callToAction}>
          <h4>Join Us:</h4>
          <p>{announcement.call_to_action}</p>
        </div>
      </div>

      {/* Additional Info & Actions */}
      <div className={styles.cardFooter}>
        <div className={styles.additionalInfo}>
          {announcement.contact_info && (
            <div className={styles.contactInfo}>
              <MdOutlineEmail /> {announcement.contact_info}
            </div>
          )}
        </div>
        
        {/* View Images Button - FIXED: Added content */}
        {hasImages && (
          <ImageButton 
            onClick={handleViewImages}
            size="small"
          > 
          View Poster
          </ImageButton>
        )}
      </div>

      {/* Image Stack Popup - DEBUG: Log when it renders */}
      {isPopupOpen && (
        <>
          {console.log('🎪 ImageStackPopup rendering with files:', popupFiles)}
          <ImageStackPopup 
            files={popupFiles} 
            onClose={() => setIsPopupOpen(false)} 
          />
        </>
      )}
    </div>
  );
}