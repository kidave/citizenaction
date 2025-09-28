// components/ward/WardBottomBar.js (updated)
import { useState, useEffect } from "react";
import styles from "styles/layout/bottombar.module.css";
import { useRouter } from "next/router";
import { FaRoad, FaUsers } from "react-icons/fa";
import { BsCardList, BsFillSignIntersectionSideFill } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment } from "react-icons/md";
import { useMediaQuery } from "react-responsive";
import { supabase } from "utils/supabaseClient";

export default function WardBottomBar({ activeTab }) {
  const router = useRouter();
  const { wardId } = router.query;
  const [user, setUser] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });

  useEffect(() => {
    // Check auth state on mount
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    checkAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTabChange = (tab) => {
    if (wardId) {
      router.push(`/ward/${wardId}/${tab}`);
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
          className={`${styles.bottomBarButton} ${activeTab === "committee" ? styles.active : ""}`}
          onClick={() => handleTabChange("committee")}
          aria-label="Members"
        >
          <FaUsers className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Members</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeTab === "road" ? styles.active : ""}`}
          onClick={() => handleTabChange("road")}
          aria-label="Routes"
        >
          <FaRoad className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Routes</span>
        </button>
        <button
          className={`${styles.bottomBarButton} ${activeTab === "junction" ? styles.active : ""}`}
          onClick={() => handleTabChange("junction")}
          aria-label="Junctions"
        >
          <BsFillSignIntersectionSideFill className={styles.bottomBarIcon} />
          <span className={styles.bottomBarLabel}>Junctions</span>
        </button>
      </div>
    </>
  );
}