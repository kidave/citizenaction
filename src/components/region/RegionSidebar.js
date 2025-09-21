// components/region/RegionSidebar.js
import styles from "styles/layout/sidebar.module.css";
import { useRouter } from "next/router";
import { FaGlobeAsia, FaUsers, FaRegNewspaper } from "react-icons/fa";
import { FaTimeline } from "react-icons/fa6";
import { TbTimelineEventFilled } from "react-icons/tb";
import { MdAssignment } from "react-icons/md";
import { useAuth } from "context/AuthContext";
import { useRegionTabs, REGION_TABS } from "hooks/useRegionTabs";

export default function RegionSidebar({ disabledTabs = [] }) {
  const { user } = useAuth();
  const router = useRouter();
  const { regionCode } = router.query;
  const { activeTab, navigateToTab } = useRegionTabs();

  const isTabDisabled = (tab) => disabledTabs.includes(tab);

  const renderTabButton = (tabKey, icon, label) => (
    <button
      key={tabKey}
      className={`${styles.tab} ${activeTab === tabKey ? styles.active : ""} ${
        isTabDisabled(tabKey) ? styles.disabled : ""
      }`}
      onClick={() => navigateToTab(tabKey)}
      title={label}
      disabled={isTabDisabled(tabKey)}
    >
      {icon}
      <span className={styles.tabText}>{label}</span>
    </button>
  );

  return (
    <div className={styles.topSidebar}>
      <div className={styles.tabContainer}>
        {renderTabButton(
          REGION_TABS.NEWSLETTER,
          <FaRegNewspaper className={styles.tabIcon} />,
          "Newsletters"
        )}
        {renderTabButton(
          REGION_TABS.MEETING,
          <FaTimeline className={styles.tabIcon} />,
          "Meetings"
        )}
        {renderTabButton(
          REGION_TABS.UPDATE,
          <TbTimelineEventFilled className={styles.tabIcon} />,
          "Updates"
        )}
        {renderTabButton(
          REGION_TABS.PROJECT,
          <MdAssignment className={styles.tabIcon} />,
          "Projects"
        )}
      </div>
    </div>
  );
}
