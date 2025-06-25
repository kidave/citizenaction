// TimelineTab.js
import { useState } from 'react';
import TimelineItem from './Timeline/TimelineItem';
import styles from '../../../styles/layout/timeline.module.css';

export default function TimelineTab({ timelines }) {
  const [filter, setFilter] = useState('meetings');
  
  if (!timelines || timelines.length === 0) {
    return (
      <div className={styles.timelineContainer}>
        <div className={styles.emptyTimeline}>
          <p>No timeline entries found.</p>
          <p>Start adding meetings and updates to track your ward's progress!</p>
        </div>
      </div>
    );
  }

  const filteredTimeline = timelines.filter(item => {
    if (filter === 'meetings') return item.type === 'meeting';
    if (filter === 'updates') return item.type === 'update';
    return true;
  });

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.filterButtons}>
        <button 
          className={`${styles.filterButton} ${filter === 'meetings' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('meetings')}
        >
          Meetings
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'updates' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('updates')}
        >
          Updates
        </button>
      </div>
      
      <div className={styles.snakeTimelineWrapper}>
        {filteredTimeline.map((item, index) => (
          <TimelineItem 
            key={item.id} 
            item={item} 
            index={index} 
            isLast={index === filteredTimeline.length - 1}
            autoExpand={index === 0}
          />
        ))}
      </div>
    </div>
  );
}