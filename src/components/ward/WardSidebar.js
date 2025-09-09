// components\ward\WardSidebar.js
import { useState } from "react";
import styles from "styles/layout/sidebar.module.css";
import { useRouter } from "next/router";
import { FaMap, FaUsers, FaRoad, FaUser } from "react-icons/fa";
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
  const [isHovered, setIsHovered] = useState(false);

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
      {isHovered && <span className={styles.tabText}>{label}</span>}
    </button>
  );

  const handleProfileNavigation = () => {
    if (!user) {
      localStorage.setItem("returnTo", router.asPath);
      router.push("/auth");
      return;
    }
    router.push("/profile");
  };

  return (
    <div
      className={`${styles.leftSidebar} ${isHovered ? styles.hovered : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={styles.logoContainer}
        onClick={() => router.push("/")}
        aria-label="Home"
        role="button"
        tabIndex={0}
        title="Home"
      >
        <div className={styles.logoContent}>
          <img
            src="/wp_icon_sm.png"
            alt="Walking Project Logo"
            className={styles.logoIcon}
          />
          {isHovered && (
            <img
              src="/wp_text_logo.png"
              alt="Walking Project"
              className={styles.logoText}
            />
          )}
        </div>
      </div>

      {/* Dropdowns */}
      <div className={styles.selector}>
        <div className={styles.dropdownWrapper}>
          <FaMap className={styles.dropdownIcon} title="Division" />
          {isHovered && (
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
          )}
        </div>

        <div className={styles.dropdownWrapper}>
          <PiMapPinAreaFill className={styles.dropdownIcon} title="Ward" />
          {isHovered && (
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
          )}
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
          "Ward Committee",
        )}
        {renderTabButton(
          WARD_TABS.PROJECT,
          <MdAssignment className={styles.tabIcon} />,
          "Project Taken",
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
        {renderTabButton(
          WARD_TABS.ACTION,
          <MdAssignment className={styles.tabIcon} />,
          "Actions Taken",
        )}
      </div>
      <div className={styles.profileButton}>
        <button
          className={`${styles.tab} ${router.pathname === "/profile" ? styles.active : ""}`}
          onClick={handleProfileNavigation}
          title="Profile"
        >
          <FaUser className={styles.tabIcon} />
          {isHovered && <span className={styles.tabText}>Profile</span>}
        </button>
      </div>
    </div>
  );
}