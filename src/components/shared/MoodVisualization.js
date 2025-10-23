// components/shared/MoodVisualization.js
import styles from "styles/tabs/timeline.module.css";

export default function MoodVisualization({ rating, inline = false }) {
  const getMoodColor = (rating) => {
    if (rating <= 3) return "#ff6b6b";
    if (rating <= 7) return "#ffa500";
    return "#4caf50";
  };

  const getMoodLabel = (rating) => {
    if (rating <= 3) return "Low";
    if (rating <= 7) return "Medium";
    return "High";
  };

  return (
    <div className={`${styles.moodVisualization} ${inline ? styles.inlineMood : ''}`}>
      <div className={styles.moodBarContainer}>
        <div 
          className={styles.moodBar}
          style={{
            width: `${rating * 10}%`,
            backgroundColor: getMoodColor(rating)
          }}
        ></div>
      </div>
      <div className={styles.moodLabel}>{getMoodLabel(rating)}</div>
    </div>
  );
}