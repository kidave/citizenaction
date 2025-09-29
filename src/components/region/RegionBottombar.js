// components/region/RegionBottombar.js
import styles from "styles/layout/bottombar.module.css";
import { useRouter } from "next/router";
import { FaRegNewspaper } from "react-icons/fa";
import { BsCardList } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment, MdOutlinePolicy } from "react-icons/md";
import { useMediaQuery } from "react-responsive";

export default function RegionBottombar({ activeTab }) {
  const router = useRouter();
  const { regionCode } = router.query;
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });

  const handleTabChange = (tab) => {
    if (regionCode) {
      router.push(`/region/${regionCode}/${tab}`);
    }
  };

  // Don't show on desktop
  if (!isMobile && !isTablet) return null;

  return (
    <>
      <div className={styles.bottomBar}>
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
          className={`${styles.bottomBarButton} ${activeTab === "newsletter" ? styles.active : ""}`}
          onClick={() => handleTabChange("newsletter")}
          aria-label="Newsletters"
        >
          <FaRegNewspaper className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Newsletters</span>
        </button>
                <button
          className={`${styles.bottomBarButton} ${activeTab === "policy" ? styles.active : ""}`}
          onClick={() => handleTabChange("policy")}
          aria-label="Policies"
        >
          <MdOutlinePolicy className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Policies</span>
        </button>
      </div>
    </>
  );
}