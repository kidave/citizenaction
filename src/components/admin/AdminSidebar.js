// components/admin/AdminSidebar.js
import styles from "styles/layout/sidebar.module.css";
import { useRouter } from "next/router";
import { BsCardList, BsPeople } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment } from "react-icons/md";
import { WARD_TABS } from "hooks/useWardTabs";

export default function AdminSidebar({ wardCode, activeTab }) {
  const router = useRouter();

  const navigateToTab = (tabName) => {
    router.push(`/admin/${wardCode}/${tabName}`);
  };

  const renderTabButton = (tabKey, icon, label) => (
    <button
      className={`${styles.tab} ${activeTab === tabKey ? styles.active : ""}`}
      onClick={() => navigateToTab(tabKey)}
      title={label}
    >
      {icon}
      <span className={styles.tabText}>{label}</span>
    </button>
  );

  return (
    <div className={styles.topSidebar}>
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
            src="/wp_text_logo.png"
            alt="Walking Project"
            className={styles.logoText}
          />
        </div>
      </div>
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
          <BsPeople className={styles.tabIcon} />,
          "Members",
        )}
      </div>
    </div>
  );
}