import { useRouter } from "next/router";
import styles from "styles/components/Logo.module.css";

export default function Logo({ 
  logo = { 
    icon: "/wp_icon_sm.png", 
    text: "/wp_text_logo.png",
    homeLink: "/"
  },
  className = "",
  showIcon = true,
  showText = true
}) {
  const router = useRouter();

  return (
    <div
      className={`${styles.logoContainer} ${className}`}
      onClick={() => router.push(logo.homeLink)}
      aria-label="Home"
      role="button"
      tabIndex={0}
    >
      <div className={styles.logo}>
        {showIcon && (
          <img 
            src={logo.icon} 
            alt="Logo" 
            className={styles.logoIcon}
          />
        )}
        {showText && (
          <img
            src={logo.text}
            alt="Walking Project"
            className={styles.logoText}
          />
        )}
      </div>
    </div>
  );
}