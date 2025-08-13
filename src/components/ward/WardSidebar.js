// components/ward/WardSidebar.js
import { useState, useEffect } from "react";
import styles from "../../styles/layout/sidebar.module.css";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import { FaMap, FaUsers, FaRoad, FaUser } from "react-icons/fa";
import { FaTimeline } from "react-icons/fa6";
import { BsFillSignIntersectionSideFill } from "react-icons/bs";
import { TbTimelineEventFilled } from "react-icons/tb";
import { PiMapPinAreaFill } from "react-icons/pi";
import { MdAssignment } from "react-icons/md";
import { useWardTabs, WARD_TABS } from "hooks/useWardTabs";
import { useAuth } from "context/AuthContext";

export default function WardSidebar({ disabledTabs = [] }) {
  const { user } = useAuth();
  const router = useRouter();
  const { wardId } = router.query;
  const { activeTab, navigateToTab } = useWardTabs();
  const [isHovered, setIsHovered] = useState(false);

  // State for ward selection
  const [divisions, setDivisions] = useState([]);
  const [wards, setWards] = useState([]);
  const [currentDivision, setCurrentDivision] = useState(null);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const isTabDisabled = (tab) => disabledTabs.includes(tab);

  // Fetch all divisions on mount
  useEffect(() => {
    const fetchDivisions = async () => {
      setLoadingDivisions(true);
      try {
        const { data, error } = await supabase
          .from("division")
          .select("code, name")
          .order("code", { ascending: true });
        if (error) throw error;
        setDivisions(data || []);
      } finally {
        setLoadingDivisions(false);
      }
    };
    fetchDivisions();
  }, []);

  // Fetch division for current ward
  useEffect(() => {
    if (!wardId) return;

    const fetchDivisionForWard = async () => {
      try {
        const { data, error } = await supabase
          .from("ward")
          .select("division_code")
          .eq("code", wardId)
          .single();

        if (!error && data) {
          setCurrentDivision(data.division_code);
        }
      } catch (err) {
        console.error("Error getting ward division:", err);
      }
    };

    fetchDivisionForWard();
  }, [wardId]);

  // Fetch wards for current division
  useEffect(() => {
    if (!currentDivision) return;

    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const { data, error } = await supabase
          .from("ward")
          .select("code, name")
          .eq("division_code", currentDivision)
          .order("name", { ascending: true });
        if (error) throw error;
        setWards(data || []);
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [currentDivision]);

  const handleDivisionChange = (divisionCode) => {
    setCurrentDivision(divisionCode);
    setWards([]);
  };

  const handleWardChange = (newWardId) => {
    if (newWardId) {
      router.push(`/ward/${newWardId}/${activeTab}`);
    }
  };

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
              value={currentDivision || ""}
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
              disabled={!currentDivision || loadingWards}
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
          "Meetings",
        )}
        {renderTabButton(
          WARD_TABS.UPDATE,
          <TbTimelineEventFilled className={styles.tabIcon} />,
          "Updates",
        )}
        {renderTabButton(
          WARD_TABS.COMMITTEE,
          <FaUsers className={styles.tabIcon} />,
          "Committee",
        )}
        {renderTabButton(
          WARD_TABS.PROJECT,
          <MdAssignment className={styles.tabIcon} />,
          "Project",
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
