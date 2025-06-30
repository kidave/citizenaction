import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MeetingDetails from './MeetingDetails';
import styles from '../../../../styles/layout/timeline.module.css';
import { FaUsers } from 'react-icons/fa';

function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleDateString('en-US', { day:'numeric', month: 'long', year: 'numeric' });
}

export default function TimelineItemMeeting({ item, autoExpand, index }) {
  const [active, setActive] = useState(!!autoExpand);

  useEffect(() => {
    setActive(!!autoExpand);
  }, [autoExpand]);

  const isLeft = index % 2 === 0;

  const renderCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className={`${styles.timelineCard} ${styles.meetingCard}`}
    >
      <div className={styles.cardHeader}>
        <h4 className={styles.timelineCardTitle}>{item.title}</h4>
        <span className={styles.cardTypeBadge}>Meeting</span>
      </div>
      <MeetingDetails item={item} />
    </motion.div>
  );

  return (
    <div className={`${styles.timelineItemMeeting} ${isLeft ? styles.left : styles.right}`}>
      {/* Left container - card appears here when isLeft is true */}
      <div className={styles.timelineSide}>
        <AnimatePresence>
          {isLeft && active && renderCard()}
        </AnimatePresence>
      </div>

      {/* Center icon */}
      <div className={styles.timelineIconWrapper} onClick={() => setActive(!active)}>
        <FaUsers className={styles.timelineIconFa} />
        <div className={`${styles.timelineDateWrapper} ${isLeft ? styles.rightDate : styles.leftDate}`}>
          {formatDate(item.date)}
        </div>
      </div>

      {/* Right container - card appears here when isLeft is false */}
      <div className={styles.timelineSide}>
        <AnimatePresence>
          {!isLeft && active && renderCard()}
        </AnimatePresence>
      </div>
    </div>
  );
}
