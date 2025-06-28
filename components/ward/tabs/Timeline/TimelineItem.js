import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MeetingDetails from './MeetingDetails';
import UpdateDetails from './UpdateDetails';
import styles from '../../../../styles/layout/timeline.module.css';
import { FaUsers, FaRegEdit } from 'react-icons/fa';

function formatDate(date, type) {
  if (!(date instanceof Date)) date = new Date(date);
  if (type === 'meeting') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}

export default function TimelineItem({ item, isLast, autoExpand, index }) {
  const [active, setActive] = useState(!!autoExpand);

  useEffect(() => {
    setActive(!!autoExpand);
  }, [autoExpand]);

  const isMeeting = item.type === 'meeting';
  const isLeft = isMeeting && index % 2 === 0;

  const renderCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className={`${styles.timelineCard} ${isMeeting ? styles.meetingCard : styles.updateCard}`}
    >
      <div className={styles.cardHeader}>
        <h4 className={styles.timelineCardTitle}>{item.title}</h4>
        <span className={styles.cardTypeBadge}>
          {item.type === 'meeting' ? 'Meeting' : 'Update'}
        </span>
      </div>
      {isMeeting ? (
        <MeetingDetails item={item} />
      ) : (
        <UpdateDetails item={item} />
      )}
    </motion.div>
  );

  return (
    <div className={styles.timelineItem}>
      {/* Left Side (for left-aligned meetings) */}
      {isMeeting && isLeft && (
        <div className={styles.timelineSide}>
          <AnimatePresence>{active && renderCard()}</AnimatePresence>
        </div>
      )}

      {/* Center icon and date */}
      <div className={styles.timelineIconWrapper} onClick={() => setActive(!active)}>
        {isMeeting ? (
          <FaUsers className={styles.timelineIconFa} />
        ) : (
          <FaRegEdit className={styles.timelineIconFa} />
        )}

        {isMeeting && (
          <div
            className={`${styles.timelineDateWrapper} ${
              isLeft ? styles.rightDate : styles.leftDate
            }`}
          >
            {formatDate(item.date, item.type)}
          </div>
        )}
      </div>

      {/* Right Side (for right-aligned meetings and all updates) */}
      {(!isMeeting || !isLeft) && (
        <div className={styles.timelineSide}>
          <AnimatePresence>{active && renderCard()}</AnimatePresence>
        </div>
      )}
    </div>
  );
}
