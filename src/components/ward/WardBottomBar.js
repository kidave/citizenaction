// components/ward/WardBottomBar.js (simplified version)
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

  if (!isMobile) return null;

  return (
    <>
      <div className={styles.bottomBar}>
        <button
          className={`${styles.hamburgerButton} ${activeTab === "meeting" ? styles.active : ""}`}
          onClick={() => handleTabChange("meeting")}
          aria-label="Meetings"
        >
          <BsCardList />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === "update" ? styles.active : ""}`}
          onClick={() => handleTabChange("update")}
          aria-label="Updates"
        >
          <TbTimelineEvent />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === "project" ? styles.active : ""}`}
          onClick={() => handleTabChange("project")}
          aria-label="Projects Taken"
        >
          <MdOutlineAssignment />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === "committee" ? styles.active : ""}`}
          onClick={() => handleTabChange("committee")}
          aria-label="Committee Members"
        >
          <FaUsers />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === "road" ? styles.active : ""}`}
          onClick={() => handleTabChange("road")}
          aria-label="Route Identified"
        >
          <FaRoad />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === "junction" ? styles.active : ""}`}
          onClick={() => handleTabChange("junction")}
          aria-label="Junction Design"
        >
          <BsFillSignIntersectionSideFill />
        </button>
      </div>
    </>
  );
}