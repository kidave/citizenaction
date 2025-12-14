// components/RegionMeetingTab.js
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  nextMonday, 
  setHours, 
  setMinutes, 
  setSeconds, 
  format,
  isBefore,
  isAfter,
  parseISO
} from 'date-fns';
import { useRouter } from 'next/router';
import MediaVideoContainer from "components/shared/media/MediaVideoContainer";
import { 
  FaCalendar, 
  FaUsers, 
  FaTasks, 
  FaVideo, 
  FaExternalLinkAlt, 
  FaChevronDown,
  FaClock,
  FaCircle,
  FaCheck,
  FaTimes,
  FaRegUser,
  FaUserCheck,
  FaUserPlus
} from "react-icons/fa";
import useRegionMeetings from "hooks/useRegionMeetings";
import useMeetingAttendance from "hooks/useMeetingAttendance";
import { useRegion } from "context/RegionContext";
import { useAlert } from "hooks/useAlert";
import { useAuth } from "context/AuthContext";
import styles from "styles/tabs/meeting.module.css";
import Spinner from "components/shared/ui/Spinner";
import CountdownTimer from "components/shared/ui/CountdownTimer";

export default function RegionMeetingTab() {
  const router = useRouter();
  const { regionCode } = useRegion();
  const { meetings, loading, error } = useRegionMeetings(regionCode);
  const { user } = useAuth();
  const [expandedCards, setExpandedCards] = useState({});
  const [meetingStatus, setMeetingStatus] = useState("upcoming");
  const { showErrorAlert, showSuccessAlert } = useAlert();

  // Find the next upcoming meeting
  const findNextMeeting = useCallback(() => {
    if (!meetings.length) return null;
    
    const now = new Date();
    
    // Find the first meeting that is in the future
    const futureMeetings = meetings.filter(meeting => {
      const meetingDate = parseISO(meeting.meeting_date);
      const meetingDateTime = setHours(setMinutes(setSeconds(meetingDate, 0), 0), 19); // 7:00 PM
      return isAfter(meetingDateTime, now);
    });
    
    return futureMeetings.length > 0 ? futureMeetings[0] : meetings[0];
  }, [meetings]);

  const currentMeeting = findNextMeeting();
  
  // Hook for attendance (for upcoming meetings)
  const { 
    attendance, 
    currentUserAttendance,
    loading: attendanceLoading, 
    toggleAttendance, 
    refresh: refreshAttendance
  } = useMeetingAttendance(currentMeeting?.id, regionCode);

  // Get next Monday at 7 PM
  const getNextMondayAt7PM = () => {
    const now = new Date();
    let nextMondayDate = nextMonday(now);
    nextMondayDate = setHours(nextMondayDate, 19);
    nextMondayDate = setMinutes(nextMondayDate, 0);
    nextMondayDate = setSeconds(nextMondayDate, 0);
    return nextMondayDate;
  };

  // Get meeting date as Date object set to 7:00 PM
  const getMeetingDateTime = useCallback(() => {
    if (!currentMeeting?.meeting_date) return null;
    
    const meetingDate = parseISO(currentMeeting.meeting_date);
    const meetingDateTime = setHours(setMinutes(setSeconds(meetingDate, 0), 0), 19);
    return meetingDateTime;
  }, [currentMeeting]);

  // Calculate meeting status
  const calculateMeetingStatus = useCallback(() => {
    const meetingDateTime = getMeetingDateTime();
    if (!meetingDateTime) return;

    const now = new Date();
    const diffMs = meetingDateTime - now;
    const meetingEnd = new Date(meetingDateTime.getTime() + (90 * 60 * 1000));
    
    if (diffMs <= 0 && now < meetingEnd) {
      setMeetingStatus("live");
    } else if (diffMs > 0 && diffMs <= (15 * 60 * 1000)) {
      setMeetingStatus("startingSoon");
    } else if (diffMs > 0) {
      setMeetingStatus("upcoming");
    } else {
      setMeetingStatus("ended");
    }
  }, [getMeetingDateTime]);

  useEffect(() => {
    if (meetings.length > 0) {
      setExpandedCards({
        [meetings[1].id]: true
      });
    }
  }, [meetings]);

  useEffect(() => {
    calculateMeetingStatus();
    const interval = setInterval(calculateMeetingStatus, 30000);
    return () => clearInterval(interval);
  }, [calculateMeetingStatus]);

  const toggleCardExpansion = (meetingId) => {
    setExpandedCards(prev => ({
      ...prev,
      [meetingId]: !prev[meetingId]
    }));
  };

  const formatMeetingDate = (dateString) => {
    const date = parseISO(dateString);
    const dateTime = setHours(setMinutes(setSeconds(date, 0), 0), 19);
    
    return format(dateTime, "EEEE, MMMM do 'at' h:mm a");
  };

  const getStatusColor = () => {
    switch(meetingStatus) {
      case "live": return "#10B981";
      case "startingSoon": return "#F59E0B";
      case "upcoming": return "#3B82F6";
      case "ended": return "#6B7280";
      default: return "#667eea";
    }
  };

  const getStatusText = () => {
    switch(meetingStatus) {
      case "live": return "Live Now";
      case "startingSoon": return "Starting Soon";
      case "upcoming": return "Upcoming";
      case "ended": return "Ended";
      default: return "Scheduled";
    }
  };

  // Handle attendance toggle
  const handleAttendanceToggle = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    try {
      await toggleAttendance();
      showSuccessAlert({ 
        message: currentUserAttendance 
          ? "You're no longer attending" 
          : "You're now attending!"
      });
    } catch (err) {
      showErrorAlert({ message: err.message });
    }
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    router.push('/auth');
  };

  const renderAttendees = (attendees) => {
    if (!Array.isArray(attendees)) return null;

    return (
      <div className={styles.attendeeList}>
        {attendees.map((attendee, idx) => {
          const {
            attendee_name,
            avatar_url
          } = attendee;

          return (
            <div key={idx} className={styles.attendeeWithAvatar}>
              <div className={styles.attendeeAvatar}>
                {avatar_url ? (
                  <img
                    src={avatar_url}
                    alt={attendee_name}
                    className={styles.avatarImage}
                  />
                ) : (
                  <FaRegUser className={styles.defaultAvatar} />
                )}
              </div>

              <span className={styles.attendeeTag}>
                {attendee_name}
              </span>
            </div>
          );
        })}
      </div>
    );
  };



  // Helper to render action items with assignee avatars
  const renderActionItems = (actionItems) => {
    if (!Array.isArray(actionItems)) return null;

    return (
      <div className={styles.actionItems}>
        {actionItems.map((item, index) => {
          const {
            assignee_name,
            assignee_designation,
            avatar_url,
            actions
          } = item;

          return (
            <div key={index} className={styles.actionItem}>
              <div className={styles.assigneeWithAvatar}>
                <div className={styles.assigneeAvatar}>
                  {avatar_url ? (
                    <img
                      src={avatar_url}
                      alt={assignee_name}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <FaRegUser className={styles.defaultAvatar} />
                  )}
                </div>

                <div className={styles.assigneeInfo}>
                  <strong>{assignee_name}</strong>
                  {assignee_designation && (
                    <span className={styles.assigneeDesignation}>
                      {assignee_designation}
                    </span>
                  )}
                </div>
              </div>

              {Array.isArray(actions) && actions.length > 0 && (
                <ul className={styles.taskList}>
                  {actions.map((task, taskIndex) => (
                    <li key={taskIndex} className={styles.task}>
                      {task}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
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

  const nextMeetingDateTime = currentMeeting ? getMeetingDateTime() : getNextMondayAt7PM();

  return (
    <div className={styles.meetingTimeline}>
      {/* Meeting Link Section */}
      <div className={styles.meetingLinkSection}>        
        {/* Meeting Status and Countdown */}
        <div className={styles.meetingStatusContainer}>
            <div className={styles.headerTitle}>
              <div className={styles.headerTop}>
                <FaVideo className={styles.sectionIcon} />
                <h3 className={styles.meetingTitle}>Weekly Regional Meeting</h3>
              </div>
              <div className={styles.headerBottom}>
                <span className={styles.meetingDate}>
                  <FaClock className={styles.sectionIcon} />
                  Every Monday at 7:00 PM
                </span>
              </div>
          </div>
          <div className={styles.statusIndicator} style={{ color: getStatusColor() }}>
            <FaCircle className={styles.statusDot} />
            <span className={styles.statusText}>{getStatusText()}</span>
          </div>
          
          {nextMeetingDateTime && (
            <CountdownTimer 
              targetDate={nextMeetingDateTime.toISOString()}
              liveText="Meeting in progress"
              endedText="Meeting ended"
              noMeetingText="No meeting scheduled"
            />
          )}
        </div>

        {/* Attendance Section - Same as before */}
        <div className={styles.attendanceSection}>
          <div className={styles.attendanceHeader}>
            <h5>
              <FaUsers className={styles.attendanceTitleIcon} />
              Who's Attending ({attendance.length})
            </h5>
            
            <div className={styles.attendanceToggleContainer}>
              {user ? (
                <button 
                  onClick={handleAttendanceToggle}
                  className={`${styles.attendanceToggle} ${
                    currentUserAttendance ? styles.attending : styles.notAttending
                  }`}
                  disabled={attendanceLoading}
                >
                  {attendanceLoading ? (
                    <Spinner mode="inline" size="small" />
                  ) : currentUserAttendance ? (
                    <>
                      <FaUserCheck className={styles.toggleIcon} />
                      <span>Attending</span>
                      <FaTimes className={styles.toggleCloseIcon} />
                    </>
                  ) : (
                    <>
                      <FaUserPlus className={styles.toggleIcon} />
                      <span>Mark Attendance</span>
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={handleLoginRedirect}
                  className={styles.loginButton}
                >
                  <FaUserPlus className={styles.loginIcon} />
                  <span>Login to RSVP</span>
                </button>
              )}
            </div>
          </div>
          
          {attendance.length > 0 ? (
            <div className={styles.attendeeGrid}>
              {attendance.map((item) => (
                <div key={item.id} className={styles.attendeeItem}>
                  <div className={styles.avatar}>
                    {item.avatar_url ? (
                      <img
                        src={item.avatar_url}
                        alt={item.attendee_name}
                        className={styles.avatarImage}
                      />
                    ) : (
                      <FaRegUser className={styles.defaultAvatar} />
                    )}
                    {item.user_id === user?.id && (
                      <div className={styles.currentUserBadge}>
                        <FaCheck className={styles.badgeIcon} />
                      </div>
                    )}
                  </div>

                  <div className={styles.attendeeInfo}>
                    <span className={styles.attendeeName}>
                      {item.attendee_name}
                      {item.user_id === user?.id && (
                        <span className={styles.youBadge}> (You)</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}

            </div>
          ) : (
            <div className={styles.noAttendees}>
              <FaUsers className={styles.noAttendeesIcon} />
              <p>No one has marked attendance yet. Be the first!</p>
            </div>
          )}
        </div>

        <div className={styles.joinSection}>
          <a 
            href={currentMeeting?.meet_link || meetings[0]?.meet_link}
            target="_blank" 
            rel="noopener noreferrer"
            className={`${styles.meetLink} ${meetingStatus === 'live' ? styles.meetLinkLive : ''}`}
          >
            {meetingStatus === 'live' ? 'Join Live Meeting' : 'Join Google Meet'}
            <FaExternalLinkAlt size={12} />
          </a>
          
          {nextMeetingDateTime && (
            <p className={styles.nextMeetingInfo}>
              Next meeting: {format(nextMeetingDateTime, "EEEE, MMMM do 'at' h:mm a")}
            </p>
          )}
        </div>
      </div>

      {/* Past Meetings Timeline */}
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
              <div 
                className={styles.cardHeader}
                onClick={() => toggleCardExpansion(meeting.id)}
              >
                <div className={styles.headerTitle}>
                  <h3 className={styles.meetingTitle}>{meeting.title}</h3>
                  <div className={styles.headerBottom}>
                    <span className={styles.meetingDate}>
                      <FaCalendar className={styles.icon} />
                      {formatMeetingDate(meeting.meeting_date)}
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
                      {/* Attendees section with avatars */}
                      {meeting.attendees && meeting.attendees.length > 0 && (
                        <div className={styles.detailSection}>
                          <div className={styles.sectionHeader}>
                            <FaUsers className={styles.sectionIcon} />
                            <h4>Attendees</h4>
                          </div>
                          {renderAttendees(meeting.attendees)}
                        </div>
                      )}

                      {/* Action Items with assignee avatars */}
                      {meeting.action_items && Array.isArray(meeting.action_items) && meeting.action_items.length > 0 && (
                        <div className={styles.detailSection}>
                          <div className={styles.sectionHeader}>
                            <FaTasks className={styles.sectionIcon} />
                            <h4>Action Items</h4>
                          </div>
                          {renderActionItems(meeting.action_items)}
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