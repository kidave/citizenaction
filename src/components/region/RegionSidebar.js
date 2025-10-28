// components/region/RegionSidebar.js
import styles from "styles/layout/sidebar.module.css";
import { FaRegNewspaper } from "react-icons/fa";
import { BsCardList } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment, MdOutlinePolicy } from "react-icons/md";
import { useRegionTabs, REGION_TABS } from "hooks/useRegionTabs";

export default function RegionSidebar({ disabledRegionTabs = [] }) {
  const { activeRegionTab, navigateToRegionTab, regionCode } = useRegionTabs();

  if (!regionCode) return null;

  const isRegionTabDisabled = (regionTab) => disabledRegionTabs.includes(regionTab);

  const renderRegionTabButton = (regionTabName, regionTabIcon, regionTabLabel) => (
    <button
      className={`${styles.tab} ${activeRegionTab === regionTabName ? styles.active : ""} ${isRegionTabDisabled(regionTabName) ? styles.disabled : ""}`}
      onClick={() => navigateToRegionTab(regionTabName)}
      title={regionTabLabel}
      disabled={isRegionTabDisabled(regionTabName)}
    >
      {regionTabIcon}
      <span className={styles.tabText}>{regionTabLabel}</span>
    </button>
  );

  return (
    <div className={styles.topSidebar}>
      {/* Tabs */}
      <div className={styles.tabContainer}>
        {renderRegionTabButton(
          REGION_TABS.MEETING,
          <BsCardList className={styles.tabIcon} />,
          "Weekly Meetings",
        )}
        {renderRegionTabButton(
          REGION_TABS.UPDATE,
          <TbTimelineEvent className={styles.tabIcon} />,
          "Monthly Updates",
        )}
        {renderRegionTabButton(
          REGION_TABS.PROJECT,
          <MdOutlineAssignment className={styles.tabIcon} />,
          "Project Details",
        )}
        {renderRegionTabButton(
          REGION_TABS.NEWSLETTER,
          <FaRegNewspaper className={styles.tabIcon} />,
          "Newsletters",
        )}
        {renderRegionTabButton(
          REGION_TABS.POLICY,
          <MdOutlinePolicy className={styles.tabIcon} />,
          "Policies",
        )}
      </div>
    </div>
  );
}