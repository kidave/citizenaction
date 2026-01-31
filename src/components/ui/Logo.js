// components/home/Logo.js
import Link from "next/link";
import styles from "styles/components/ui/Logo.module.css";

export default function Logo() {
  return (
    <Link href="/" className={styles.logoContainer}>
      <div className={styles.logo}>
        <img
          src="/wp_icon_sm.avif"
          alt="Logo"
          className={styles.logoIcon}
        />
        <img
          src="/wp_text_logo.avif"
          alt="Walking Project"
          className={styles.logoText}
        />
      </div>
    </Link>
  );
}
