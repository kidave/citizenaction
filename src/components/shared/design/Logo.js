import Link from "next/link";
import styles from "styles/components/design/Logo.module.css";

export default function Logo({
  logo = { 
    icon: "/wp_icon_sm.avif",
    text: "/wp_text_logo.avif",
    homeLink: "/"
  },
  className = "",
  showIcon = true,
  showText = true
}) {
  return (
    <Link href={logo.homeLink} className={`${styles.logoContainer} ${className}`}>
      <div className={styles.logo}>
        {showIcon && (
          <img 
            src={logo.icon} 
            alt="Logo Icon"
            className={styles.logoIcon}
          />
        )}
        {showText && (
          <img
            src={logo.text}
            alt="Walking Project Logo Text"
            className={styles.logoText}
          />
        )}
      </div>
    </Link>
  );
}
