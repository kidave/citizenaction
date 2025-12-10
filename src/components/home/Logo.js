// components/home/Logo.js
import styles from "styles/components/design/Logo.module.css";

export default function Logo({ onClick }) {
  return (
    <div className={styles.logoContainer} onClick={onClick}>
      <div className={styles.logo}>
        <img src="/wp_icon_sm.avif" alt="Logo" className={styles.logoIcon} />
        <img src="/wp_text_logo.avif" alt="Walking Project" className={styles.logoText} />
      </div>
    </div>
  );
}
