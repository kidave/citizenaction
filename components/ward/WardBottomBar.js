import { useState } from 'react';
import styles from '../../styles/layout/bottombar.module.css';
import { useRouter } from 'next/router';
import { FaUsers } from "react-icons/fa";
import { FiHome, FiMenu } from 'react-icons/fi';
import { BsCardList } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment } from "react-icons/md";
import { useMediaQuery } from 'react-responsive';

export default function WardBottomBar({
  activeTab,
  onTabChange,
}) {
  const router = useRouter();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleTabChange = (tab) => {
    onTabChange(tab);
    setIsHamburgerOpen(false);
  };

  const handleHamburgerClick = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
  };

  if (!isMobile) return null;

  return (
    <>
      <div className={styles.bottomBar}>
        <button
          className={styles.hamburgerButton} 
          onClick={() => router.push('/')}>
          <FiHome />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === 'meeting' ? styles.active : ''}`}
          onClick={() => handleTabChange('meeting')}
        >
          <BsCardList />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === 'update' ? styles.active : ''}`}
          onClick={() => handleTabChange('update')}
        >
          <TbTimelineEvent />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === 'project' ? styles.active : ''}`}
          onClick={() => handleTabChange('project')}
        >
          <MdOutlineAssignment />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === 'member' ? styles.active : ''}`}
          onClick={() => handleTabChange('member')}
        >
          <FaUsers />
        </button>
        <button
          className={styles.hamburgerButton}
          onClick={handleHamburgerClick}
        >
          <FiMenu />
        </button>
      </div>

      {isHamburgerOpen && (
        <div className={styles.hamburgerDropdown}>
          <button onClick={() => handleTabChange('road')}>Road</button>
          <button onClick={() => handleTabChange('junction')}>Junction</button>
        </div>
      )}
    </>
  );
}