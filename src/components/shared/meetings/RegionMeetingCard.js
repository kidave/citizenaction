// components/meetings/RegionMeetingCard.js
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendar,
  FaUsers,
  FaTasks,
  FaVideo,
  FaChevronDown,
  FaRegUser
} from "react-icons/fa";
import MediaVideoContainer from "components/shared/media/MediaVideoContainer";
import styles from "styles/tabs/meeting.module.css";

export default function RegionMeetingCard({
  meeting,
  expanded,
  onToggle,
  formatMeetingDate
}) {
  return (
    <motion.div 
      id={`meeting-${meeting.id}`}
      className={styles.timelineItem}
    >
      <motion.div
        className={`${styles.meetingCard} ${expanded ? styles.expanded : ""}`}
      >
        {/* Header */}
        <div className={styles.cardHeader} onClick={onToggle}>
          <div className={styles.headerTitle}>
            <h3 className={styles.meetingTitle}>{meeting.title}</h3>
            <div className={styles.headerBottom}>
              <span className={styles.meetingDate}>
                <FaCalendar className={styles.icon} />
                {formatMeetingDate(meeting.meeting_date)}
              </span>

              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                className={styles.expandIcon}
              >
                <FaChevronDown />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.cardContent}>
          {meeting.summary && (
            <div className={styles.summarySection}>
              <p className={styles.summaryText}>{meeting.summary}</p>
            </div>
          )}

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={styles.expandedContent}
              >
                {/* Attendees */}
                {meeting.attendees?.length > 0 && (
                  <div className={styles.detailSection}>
                    <div className={styles.sectionHeader}>
                      <FaUsers className={styles.sectionIcon} />
                      <h4>Attendees</h4>
                    </div>

                    <div className={styles.attendeeList}>
                      {meeting.attendees.map((a, i) => (
                        <div key={i} className={styles.attendeeWithAvatar}>
                          <div className={styles.attendeeAvatar}>
                            {a.avatar_url ? (
                              <img
                                src={a.avatar_url}
                                alt={a.attendee_name}
                                className={styles.avatarImage}
                              />
                            ) : (
                              <FaRegUser className={styles.defaultAvatar} />
                            )}
                          </div>
                          <span className={styles.attendeeTag}>
                            {a.attendee_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items – FULLY RESTORED */}
                {meeting.action_items &&
                  Array.isArray(meeting.action_items) &&
                  meeting.action_items.length > 0 && (
                    <div className={styles.detailSection}>
                      <div className={styles.sectionHeader}>
                        <FaTasks className={styles.sectionIcon} />
                        <h4>Action Items</h4>
                      </div>

                      <div className={styles.actionItems}>
                        {meeting.action_items.map((item, index) => {
                          const {
                            assignee_name,
                            assignee_designation,
                            avatar_url,
                            actions
                          } = item;

                          return (
                            <div
                              key={index}
                              className={styles.actionItem}
                            >
                              <div className={styles.assigneeWithAvatar}>
                                <div className={styles.assigneeAvatar}>
                                  {avatar_url ? (
                                    <img
                                      src={avatar_url}
                                      alt={assignee_name}
                                      className={styles.avatarImage}
                                    />
                                  ) : (
                                    <FaRegUser
                                      className={styles.defaultAvatar}
                                    />
                                  )}
                                </div>

                                <div className={styles.assigneeInfo}>
                                  <strong>{assignee_name}</strong>
                                  {assignee_designation && (
                                    <span
                                      className={styles.assigneeDesignation}
                                    >
                                      {assignee_designation}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {Array.isArray(actions) &&
                                actions.length > 0 && (
                                  <ul className={styles.taskList}>
                                    {actions.map((task, taskIndex) => (
                                      <li
                                        key={taskIndex}
                                        className={styles.task}
                                      >
                                        {task}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Recording */}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
