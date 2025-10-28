// components/ward/WardBottomBar.js
import styles from "styles/layout/bottombar.module.css";
import { useRouter } from "next/router";
import { FaRoad } from "react-icons/fa";
import { BsCardList, BsSignIntersectionSide, BsPeople } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment } from "react-icons/md";
import { useMediaQuery } from "react-responsive";

export default function WardBottomBar({ activeWardTab }) {
  const router = useRouter();
  const { wardCode } = router.query;
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });

  const navigateToWardTab = (wardTabName) => {
    if (wardCode) {
      router.push(`/ward/${wardCode}/${wardTabName}`);
    }
  };

  // Don't show on desktop
  if (!isMobile && !isTablet) return null;

  return (
    <>
      <div className={styles.bottomBar}>
        <button
          className={`${styles.bottomBarButton} ${activeWardTab === "meeting" ? styles.active : ""}`}
          onClick={() => navigateToWardTab("meeting")}
          aria-label="Meetings"
        >
          <BsCardList className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Meetings</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeWardTab === "update" ? styles.active : ""}`}
          onClick={() => navigateToWardTab("update")}
          aria-label="Updates"
        >
          <TbTimelineEvent className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Updates</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeWardTab === "project" ? styles.active : ""}`}
          onClick={() => navigateToWardTab("project")}
          aria-label="Projects"
        >
          <MdOutlineAssignment className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Projects</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeWardTab === "committee" ? styles.active : ""}`}
          onClick={() => navigateToWardTab("committee")}
          aria-label="Members"
        >
          <BsPeople className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Members</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeWardTab === "junction" ? styles.active : ""}`}
          onClick={() => navigateToWardTab("junction")}
          aria-label="Junctions"
        >
          <BsSignIntersectionSide className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Junctions</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeWardTab === "road" ? styles.active : ""}`}
          onClick={() => navigateToWardTab("road")}
          aria-label="Routes"
        >
          <FaRoad className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Routes</span>
        </button>
      </div>
    </>
  );
}