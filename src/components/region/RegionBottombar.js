// components/region/RegionBottombar.js
import styles from "styles/layout/bottombar.module.css";
import { useRouter } from "next/router";
import { FaRegNewspaper } from "react-icons/fa";
import { BsCardList } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment, MdOutlinePolicy } from "react-icons/md";
import { useMediaQuery } from "react-responsive";

export default function RegionBottombar({ activeRegionTab }) {
  const router = useRouter();
  const { regionCode } = router.query;
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });

  const navigateToRegionTab = (regionTabName) => {
    if (regionCode) {
      router.push(`/region/${regionCode}/${regionTabName}`);
    }
  };

  // Don't show on desktop
  if (!isMobile && !isTablet) return null;

  return (
    <>
      <div className={styles.bottomBar}>
        <button
          className={`${styles.bottomBarButton} ${activeRegionTab === "meeting" ? styles.active : ""}`}
          onClick={() => navigateToRegionTab("meeting")}
          aria-label="Meetings"
        >
          <BsCardList className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Meetings</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeRegionTab === "update" ? styles.active : ""}`}
          onClick={() => navigateToRegionTab("update")}
          aria-label="Updates"
        >
          <TbTimelineEvent className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Updates</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeRegionTab === "project" ? styles.active : ""}`}
          onClick={() => navigateToRegionTab("project")}
          aria-label="Projects"
        >
          <MdOutlineAssignment className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Projects</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeRegionTab === "newsletter" ? styles.active : ""}`}
          onClick={() => navigateToRegionTab("newsletter")}
          aria-label="Newsletters"
        >
          <FaRegNewspaper className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Newsletters</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeRegionTab === "policy" ? styles.active : ""}`}
          onClick={() => navigateToRegionTab("policy")}
          aria-label="Policies"
        >
          <MdOutlinePolicy className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Policies</span>
        </button>
      </div>
    </>
  );
}