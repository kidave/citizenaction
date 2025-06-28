import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UpdateDetails from './UpdateDetails';
import styles from '../../../../styles/layout/timeline.module.css';

function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function TimelineItemUpdate({ item, autoExpand }) {
  const [active, setActive] = useState(!!autoExpand);

  useEffect(() => {
    setActive(!!autoExpand);
  }, [autoExpand]);

  return (
    <div className={styles.timelineItemUpdate}>
      <div className={styles.centeredDate}
        onClick={() => setActive(!active)}
        style={{ cursor: 'pointer' }} 
      >
        {formatDate(item.date)}
      </div>

      <div className={styles.fullWidthCard}>
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className={`${styles.timelineCard} ${styles.updateCard}`}
            >
              <div className={styles.cardHeader}>
                <h4 className={styles.timelineCardTitle}>{item.title}</h4>
                <span className={styles.cardTypeBadge}>Update</span>
              </div>
              <UpdateDetails item={item} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
