import TimelineItemMeeting from './TimelineItemMeeting';
import styles from '../../../../styles/layout/timeline.module.css';

export default function TimelineMeeting({ meetings }) {
  if (meetings.length === 0) {
    return <p className={styles.emptyTimeline}>No meetings yet.</p>;
  }

  return (
    <div className={styles.timelineWrapper}>
      {meetings.map((item, index) => (
        <TimelineItemMeeting
          key={item.id}
          item={item}
          index={index}
          autoExpand={index === 0}
        />
      ))}
    </div>
  );
}
