// components/shared/ui/Spinner.js
import styles from "styles/components/spinner.module.css";

export default function Spinner({ size = "medium", mode = "fullscreen" }) {
  const sizeClass = styles[size] || styles.medium;
  const spinner = <div className={`${styles.spinner} ${sizeClass}`} />;

  if (mode === "fullscreen") {
    return <div className={styles.fullscreen}>{spinner}</div>;
  }

  if (mode === "inline") {
    return <div className={styles.inline}>{spinner}</div>;
  }

  return spinner; // fallback
}
