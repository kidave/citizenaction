// components/admin/AdminBottomBar.js
import { useState } from "react";
import styles from "styles/layout/bottombar.module.css";
import { useRouter } from "next/router";
import { FaUsers } from "react-icons/fa";
import { FiHome, FiMenu } from "react-icons/fi";
import { BsCardList } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment } from "react-icons/md";
import { useMediaQuery } from "react-responsive";

export default function AdminBottomBar({ activeTab, onTabChange }) {
  const router = useRouter();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleHamburgerClick = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
  };

  if (!isMobile) return null;

  return (
    <>
      <div className={styles.bottomBar}>
        <button
          className={styles.hamburgerButton}
          onClick={() => router.push("/")}
          aria-label="Home"
        >
          <FiHome />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === "meeting" ? styles.active : ""}`}
          onClick={() => onTabChange("meeting")}
          aria-label="Meetings"
        >
          <BsCardList />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === "update" ? styles.active : ""}`}
          onClick={() => onTabChange("update")}
          aria-label="Updates"
        >
          <TbTimelineEvent />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === "project" ? styles.active : ""}`}
          onClick={() => onTabChange("project")}
          aria-label="Projects"
        >
          <MdOutlineAssignment />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === "committee" ? styles.active : ""}`}
          onClick={() => onTabChange("committee")}
          aria-label="Committee"
        >
          <FaUsers />
        </button>
        <button
          className={styles.hamburgerButton}
          onClick={handleHamburgerClick}
          aria-label="Menu"
        >
          <FiMenu />
        </button>
      </div>
    </>
  );
}