// components/ward/WardSidebar.js
import styles from "styles/layout/sidebar.module.css";
import { FaUsers, FaRoad } from "react-icons/fa";
import { BsCardList, BsFillSignIntersectionSideFill } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment } from "react-icons/md";
import { useWardTabs, WARD_TABS } from "hooks/useWardTabs";
import { useAuth } from "context/AuthContext";

export default function WardSidebar({ disabledTabs = [] }) {
  const { user } = useAuth();
  const { activeTab, navigateToTab } = useWardTabs();


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
          WARD_TABS.PROJECT,
          <MdOutlineAssignment className={styles.tabIcon} />,
          "Project Details",
        )}
        {renderTabButton(
          WARD_TABS.MEETING,
          <BsCardList className={styles.tabIcon} />,
          "Minutes of Meeting",
        )}
        {renderTabButton(
          WARD_TABS.UPDATE,
          <TbTimelineEvent className={styles.tabIcon} />,
          "Monthly Update",
        )}
        {renderTabButton(
          WARD_TABS.COMMITTEE,
          <FaUsers className={styles.tabIcon} />,
          "Members",
        )}
        {renderTabButton(
          WARD_TABS.ROAD,
          <FaRoad className={styles.tabIcon} />,
          "Routes Identified",
        )}
        {renderTabButton(
          WARD_TABS.JUNCTION,
          <BsFillSignIntersectionSideFill className={styles.tabIcon} />,
          "Junction Design",
        )}
      </div>
    </div>
  );
}