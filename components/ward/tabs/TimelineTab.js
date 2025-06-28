import { useState } from 'react';
import TimelineMeeting from './Timeline/TimelineMeeting';
import TimelineUpdate from './Timeline/TimelineUpdate';
import styles from '../../../styles/layout/timeline.module.css';

export default function TimelineTab({ timelines }) {
  const [filter, setFilter] = useState('meetings');

  const meetings = timelines.filter(t => t.type === 'meeting');
  const updates = timelines.filter(t => t.type === 'update');

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

      {filter === 'meetings' ? (
        <TimelineMeeting meetings={meetings} />
      ) : (
        <TimelineUpdate updates={updates} />
      )}
    </div>
  );
}
