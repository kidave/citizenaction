// components/admin/AdminBottomBar.js
import styles from "styles/layout/bottombar.module.css";
import { useRouter } from "next/router";
import { BsCardList, BsPeople } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment } from "react-icons/md";
import { FaBullhorn } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";

export default function AdminBottomBar({ activeTab }) {
  const router = useRouter();
  const { wardCode } = router.query;
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  
  const handleTabChange = (tab) => {
    if (wardCode) {
      router.push(`/admin/ward/${wardCode}/${tab}`);
    }
  };
  
  // Don't show on desktop
  if (!isMobile && !isTablet) return null;

  return (
    <>
      <div className={styles.bottomBar}>
        <button
          className={`${styles.bottomBarButton} ${activeTab === "announcement" ? styles.active : ""}`}
          onClick={() => handleTabChange("announcement")}
          aria-label="Announcement"
        >
          <FaBullhorn className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Announcement</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeTab === "meeting" ? styles.active : ""}`}
          onClick={() => handleTabChange("meeting")}
          aria-label="Meetings"
        >
          <BsCardList className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Meetings</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeTab === "update" ? styles.active : ""}`}
          onClick={() => handleTabChange("update")}
          aria-label="Updates"
        >
          <TbTimelineEvent className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Updates</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeTab === "project" ? styles.active : ""}`}
          onClick={() => handleTabChange("project")}
          aria-label="Projects"
        >
          <MdOutlineAssignment className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Projects</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeTab === "committee" ? styles.active : ""}`}
          onClick={() => handleTabChange("committee")}
          aria-label="Members"
        >
          <BsPeople className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Members</span>
        </button>
      </div>
    </>
  );
}