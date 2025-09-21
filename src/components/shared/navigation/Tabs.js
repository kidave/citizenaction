import { useState } from "react";
import styles from "styles/components/Tabs.module.css";

export default function Tabs({ 
  tabs, 
  defaultActiveTab,
  onTabChange,
  variant = "default" // "default" or "accordion"
}) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.key);

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    onTabChange?.(tabKey);
  };

  return (
    <div className={`${styles.tabs} ${styles[variant]}`}>
      <div className={styles.tabList}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => handleTabClick(tab.key)}
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className={styles.tabContent}>
        {tabs.find(tab => tab.key === activeTab)?.content}
      </div>
    </div>
  );
}