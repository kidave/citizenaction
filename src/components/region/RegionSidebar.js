// components/region/RegionSidebar.js
import styles from "styles/layout/sidebar.module.css";
import { FaRegNewspaper } from "react-icons/fa";
import { FaTimeline } from "react-icons/fa6";
import { TbTimelineEventFilled } from "react-icons/tb";
import { MdAssignment, MdPolicy } from "react-icons/md";
import { useRegionTabs, REGION_TABS } from "hooks/useRegionTabs";

export default function RegionSidebar() {
  const { activeTab, navigateToTab, regionCode } = useRegionTabs();

  if (!regionCode) return null;

  const tabs = [
    { key: REGION_TABS.NEWSLETTER, icon: <FaRegNewspaper className={styles.tabIcon} />, label: "Newsletters" },
    { key: REGION_TABS.MEETING, icon: <FaTimeline className={styles.tabIcon} />, label: "Meetings" },
    { key: REGION_TABS.UPDATE, icon: <TbTimelineEventFilled className={styles.tabIcon} />, label: "Updates" },
    { key: REGION_TABS.PROJECT, icon: <MdAssignment className={styles.tabIcon} />, label: "Projects" },
    { key: REGION_TABS.POLICY, icon: <MdPolicy className={styles.tabIcon} />, label: "Policies" }
  ];

  return (
    <div className={styles.topSidebar}>
      <div className={styles.tabContainer}>
        {tabs.map(({ key, icon, label }) => (
          <button
            key={key}
            className={`${styles.tab} ${activeTab === key ? styles.active : ""}`}
            onClick={() => navigateToTab(key)}
            title={label}
          >
            {icon}
            <span className={styles.tabText}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}