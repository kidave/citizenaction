// components/ward/WardSidebar.js
import styles from "styles/layout/sidebar.module.css";
import { useRouter } from "next/router";
import { FaMap, FaUsers, FaRoad } from "react-icons/fa";
import { FaTimeline } from "react-icons/fa6";
import { BsFillSignIntersectionSideFill } from "react-icons/bs";
import { TbTimelineEventFilled } from "react-icons/tb";
import { PiMapPinAreaFill } from "react-icons/pi";
import { MdAssignment } from "react-icons/md";
import { useWardTabs, WARD_TABS } from "hooks/useWardTabs";
import { useAuth } from "context/AuthContext";
import { useRegionData } from "hooks/useRegionData";

export default function WardSidebar({ disabledTabs = [] }) {
  const { user } = useAuth();
  const router = useRouter();
  const { wardId } = router.query;
  const { activeTab, navigateToTab } = useWardTabs();

  const {
    divisions,
    wards,
    selectedDivision,
    handleDivisionChange,
    handleWardChange
  } = useRegionData();

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
      {/* Dropdowns */}
      <div className={styles.selector}>
        <div className={styles.dropdownWrapper}>
          <FaMap className={styles.dropdownIcon} title="Division" />
          <select
            id="division-select"
            value={selectedDivision || ""}
            onChange={(e) => handleDivisionChange(e.target.value)}
            className={styles.dropdown}
            aria-label="Select Division"
          >
            <option value="">Select Division</option>
            {divisions.map((division) => (
              <option key={division.code} value={division.code}>
                {division.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.dropdownWrapper}>
          <PiMapPinAreaFill className={styles.dropdownIcon} title="Ward" />
          <select
            id="ward-select"
            value={wardId || ""}
            onChange={(e) => handleWardChange(e.target.value)}
            className={styles.dropdown}
            aria-label="Select Ward"
            disabled={!selectedDivision}
          >
            <option value="">Select Ward</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabContainer}>
        {renderTabButton(
          WARD_TABS.MEETING,
          <FaTimeline className={styles.tabIcon} />,
          "Minutes of Meeting",
        )}
        {renderTabButton(
          WARD_TABS.UPDATE,
          <TbTimelineEventFilled className={styles.tabIcon} />,
          "Monthly Update",
        )}
        {renderTabButton(
          WARD_TABS.COMMITTEE,
          <FaUsers className={styles.tabIcon} />,
          "Members",
        )}
        {renderTabButton(
          WARD_TABS.PROJECT,
          <MdAssignment className={styles.tabIcon} />,
          "Project Details",
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