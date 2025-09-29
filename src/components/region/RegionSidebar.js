// components/region/RegionSidebar.js
import styles from "styles/layout/sidebar.module.css";
import { FaRegNewspaper } from "react-icons/fa";
import { BsCardList } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment, MdOutlinePolicy } from "react-icons/md";
import { useRegionTabs, REGION_TABS } from "hooks/useRegionTabs";

export default function RegionSidebar({ disabledTabs = [] }) {
  const { activeTab, navigateToTab, regionCode } = useRegionTabs();

  if (!regionCode) return null;

  const isTabDisabled = (tab) => disabledTabs.includes(tab);

  const renderTabButton = (tabKey, icon, label) => (
    <button
      className={`${styles.tab} ${activeTab === tabKey ? styles.active : ""} ${isTabDisabled(tabKey) ? styles.disabled : ""}`}
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
      {/* Tabs */}
      <div className={styles.tabContainer}>
        {renderTabButton(
          REGION_TABS.MEETING,
          <BsCardList className={styles.tabIcon} />,
          "Weekly Meetings",
        )}
        {renderTabButton(
          REGION_TABS.UPDATE,
          <TbTimelineEvent className={styles.tabIcon} />,
          "Monthly Updates",
        )}
        {renderTabButton(
          REGION_TABS.PROJECT,
          <MdOutlineAssignment className={styles.tabIcon} />,
          "Project Details",
        )}
        {renderTabButton(
          REGION_TABS.NEWSLETTER,
          <FaRegNewspaper className={styles.tabIcon} />,
          "Newsletters",
        )}
        {renderTabButton(
          REGION_TABS.POLICY,
          <MdOutlinePolicy className={styles.tabIcon} />,
          "Policies",
        )}
      </div>
    </div>
  );
}