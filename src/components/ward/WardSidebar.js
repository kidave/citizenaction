// components/ward/WardSidebar.js
import styles from "styles/layout/sidebar.module.css";
import { FaRoad } from "react-icons/fa";
import { BsCardList, BsSignIntersectionSide, BsPeople } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment } from "react-icons/md";
import { FaBullhorn } from "react-icons/fa";
import { useWardTabs, WARD_TABS } from "hooks/useWardTabs";

export default function WardSidebar({ disabledWardTabs = [] }) {
  const { activeWardTab, navigateToWardTab } = useWardTabs();

  const isWardTabDisabled = (wardTab) => disabledWardTabs.includes(wardTab);

  const renderWardTabButton = (wardTabName, wardTabIcon, wardTabLabel) => (
    <button
      className={`${styles.tab} ${activeWardTab === wardTabName ? styles.active : ""} ${isWardTabDisabled(wardTabName) ? styles.disabled : ""}`}
      onClick={() => navigateToWardTab(wardTabName)}
      title={wardTabLabel}
      disabled={isWardTabDisabled(wardTabName)}
    >
      {wardTabIcon}
      <span className={styles.tabText}>{wardTabLabel}</span>
    </button>
  );

  return (
    <div className={styles.topSidebar}>
      {/* Tabs */}
      <div className={styles.tabContainer}>
        {renderWardTabButton(
          WARD_TABS.ANNOUNCEMENT,
          <FaBullhorn className={styles.tabIcon} />,
          "Announcements",
        )}
        {renderWardTabButton(
          WARD_TABS.PROJECT,
          <MdOutlineAssignment className={styles.tabIcon} />,
          "Project Details",
        )}
        {renderWardTabButton(
          WARD_TABS.MEETING,
          <BsCardList className={styles.tabIcon} />,
          "Minutes of Meeting",
        )}
        {renderWardTabButton(
          WARD_TABS.UPDATE,
          <TbTimelineEvent className={styles.tabIcon} />,
          "Monthly Update",
        )}
        {renderWardTabButton(
          WARD_TABS.COMMITTEE,
          <BsPeople className={styles.tabIcon} />,
          "Members",
        )}
        {renderWardTabButton(
          WARD_TABS.JUNCTION,
          <BsSignIntersectionSide className={styles.tabIcon} />,
          "Junction Design",
        )}
        {renderWardTabButton(
          WARD_TABS.ROAD,
          <FaRoad className={styles.tabIcon} />,
          "Routes Identified",
        )}
        {/*
        {renderWardTabButton(
          WARD_TABS.DASHBOARD,
          <FaRoad className={styles.tabIcon} />,
          "Dashboard",
        )}
        */}
      </div>
    </div>
  );
}