import { useRouter } from "next/router";
import styles from "styles/components/navigation/Sidebar.module.css";

export default function Sidebar({ 
  tabs = [], 
  activeTab, 
  onTabChange,
  showLogo = true,
  logo = { text: "/wp_text_logo.avif" }
}) {
  const router = useRouter();

  return (
    <div className={styles.sidebar}>
      {showLogo && (
        <div
          className={styles.logoContainer}
          onClick={() => router.push("/")}
          aria-label="Home"
          role="button"
          tabIndex={0}
        >
          <div className={styles.logoContent}>
            <img
              src={logo.text}
              alt="Logo"
              className={styles.logoText}
            />
          </div>
        </div>
      )}
      
      <div className={styles.tabContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.active : ""} ${tab.disabled ? styles.disabled : ""}`}
            onClick={() => !tab.disabled && onTabChange(tab.key)}
            title={tab.label}
            disabled={tab.disabled}
          >
            {tab.icon}
            <span className={styles.tabText}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}