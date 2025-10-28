// components/RegionMeetingTab.js
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MediaVideoContainer from "components/shared/media/MediaVideoContainer";
import { FaCalendar, FaUsers, FaTasks, FaVideo, FaExternalLinkAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import useRegionMeetings from "hooks/useRegionMeetings";
import { useRegion } from "context/RegionContext";
import { useAlert } from "hooks/useAlert";
import styles from "styles/tabs/meeting.module.css";
import Spinner from "components/shared/ui/Spinner";

export default function RegionMeetingTab() {
  const { regionCode } = useRegion();
  const { meetings, loading, error } = useRegionMeetings(regionCode);
  const [expandedCards, setExpandedCards] = useState({});
  const { showErrorAlert } = useAlert();

  useEffect(() => {
    if (meetings.length > 0) {
      setExpandedCards(prev => ({
        ...prev,
        [meetings[0].id]: true
      }));
    }
  }, [meetings]);

  const toggleCardExpansion = (meetingId) => {
    setExpandedCards(prev => ({
      ...prev,
      [meetingId]: !prev[meetingId]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Error handling
  if (error) {
    showErrorAlert({ 
      message: "Error loading meetings", 
      errorDetails: error 
    });
    return <div>Error loading meetings</div>;
  }

  if (loading) return <Spinner mode="inline" />;

  if (!meetings.length) return (
    <div className={styles.emptyState}>
      <FaCalendar size={48} />
      <h3>No meetings found</h3>
      <p>There are no meetings scheduled for this region yet.</p>
    </div>
  );

  return (
    <div className={styles.meetingTimeline}>
      <AnimatePresence>
        {meetings.map((meeting, index) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={styles.timelineItem}
          >
            <motion.div 
              className={`${styles.meetingCard} ${expandedCards[meeting.id] ? styles.expanded : ''}`}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Make the entire header clickable */}
              <div 
                className={styles.cardHeader}
                onClick={() => toggleCardExpansion(meeting.id)}
              >
                <div className={styles.headerContent}>
                  <h3 className={styles.meetingTitle}>{meeting.title}</h3>
                  <div className={styles.headerBottom}>
                    <span className={styles.meetingDate}>
                      <FaCalendar className={styles.icon} />
                      {formatDate(meeting.meeting_date)}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedCards[meeting.id] ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={styles.expandIcon}
                    >
                      <FaChevronDown />
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className={styles.cardContent}>
                {meeting.summary && (
                  <div className={styles.summarySection}>
                    <p className={styles.summaryText}>{meeting.summary}</p>
                  </div>
                )}

                <AnimatePresence>
                  {expandedCards[meeting.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className={styles.expandedContent}
                    >
                      {meeting.attendees?.length > 0 && (
                        <div className={styles.detailSection}>
                          <div className={styles.sectionHeader}>
                            <FaUsers className={styles.sectionIcon} />
                            <h4>Attendees</h4>
                          </div>
                          <div className={styles.attendeeList}>
                            {meeting.attendees.map((attendee, idx) => (
                              <span key={idx} className={styles.attendeeTag}>
                                {attendee}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {meeting.action_items && Array.isArray(meeting.action_items) && meeting.action_items.length > 0 && (
                        <div className={styles.detailSection}>
                          <div className={styles.sectionHeader}>
                            <FaTasks className={styles.sectionIcon} />
                            <h4>Action Items</h4>
                          </div>
                          <div className={styles.actionItems}>
                            {meeting.action_items.map((item, index) => (
                              <div key={index} className={styles.actionItem}>
                                <div className={styles.assignee}>
                                  <strong>{item.assignee}:</strong>
                                </div>
                                {Array.isArray(item.tasks) && item.tasks.length > 0 && (
                                  <ul className={styles.taskList}>
                                    {item.tasks.map((task, taskIndex) => (
                                      <li key={taskIndex} className={styles.task}>
                                        {task}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {meeting.recording_url && (
                        <div className={styles.detailSection}>
                          <div className={styles.sectionHeader}>
                            <FaVideo className={styles.sectionIcon} />
                            <h4>Recording</h4>
                          </div>
                          <MediaVideoContainer 
                            videoUrl={meeting.recording_url} 
                            title={meeting.title} 
                          />
                        </div>
                      )}

                      {meeting.meet_link && (
                        <div className={styles.detailSection}>
                          <div className={styles.sectionHeader}>
                            <FaExternalLinkAlt className={styles.sectionIcon} />
                            <h4>Meeting Link</h4>
                          </div>
                          <a 
                            href={meeting.meet_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.meetLink}
                          >
                            Join Google Meet
                            <FaExternalLinkAlt size={12} />
                          </a>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}