// components/shared/MoodVisualization.js
import styles from "styles/tabs/timeline.module.css";

export default function MoodVisualization({ rating }) {
  const getMoodColor = (rating) => {
    if (rating <= 3) return "#ff6b6b"; // Red for low mood
    if (rating <= 7) return "#ffa500"; // Orange for medium mood
    return "#4caf50"; // Green for high mood
  };

  const getMoodLabel = (rating) => {
    if (rating <= 3) return "Low";
    if (rating <= 7) return "Medium";
    return "High";
  };

  return (
    <div className={styles.moodVisualization}>
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