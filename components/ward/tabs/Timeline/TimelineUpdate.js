import TimelineItemUpdate from './TimelineItemUpdate';
import styles from '../../../../styles/layout/timeline.module.css';

export default function TimelineUpdate({ updates, isConvenor }) {
  if (updates.length === 0) {
    return <p className={styles.emptyTimeline}>No updates yet.</p>;
  }

  return (
    <div className={styles.timelineWrapper}>
      {updates.map((item, index) => (
        <TimelineItemUpdate
          key={item.id}
          item={item}
          isConvenor={isConvenor}
        />
      ))}
    </div>
  );
}
