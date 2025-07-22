import { useState } from 'react';
import styles from '../../styles/layout/bottombar.module.css';
import { useRouter } from 'next/router';
import { FiMenu } from 'react-icons/fi';
import { FaTimeline } from "react-icons/fa6";
import { TbTimelineEventFilled } from "react-icons/tb";
import { MdAssignment } from "react-icons/md";
import { useMediaQuery } from 'react-responsive';
import { useWardSelection } from '../../src/hooks/useWardSelection';

export default function WardBottomBar({
  activeTab,
  onTabChange,
  wardInfo,
}) {
  const router = useRouter();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isWardModalOpen, setWardModalOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Use the ward selection hook
  const {
    divisions,
    wards,
    currentDivision,
    loadingDivisions,
    loadingWards,
    handleDivisionChange,
    handleWardChange,
  } = useWardSelection();

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
        <div className={styles.hamburgerButton} onClick={() => router.push('/')}>
          <img src="/wp_icon_sm.png" alt="Home" width={24} />
        </div>
        <button
          className={`${styles.hamburgerButton} ${activeTab === 'meeting' ? styles.active : ''}`}
          onClick={() => handleTabChange('meeting')}
        >
          <FaTimeline />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === 'update' ? styles.active : ''}`}
          onClick={() => handleTabChange('update')}
        >
          <TbTimelineEventFilled />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === 'project' ? styles.active : ''}`}
          onClick={() => handleTabChange('project')}
        >
          <MdAssignment />
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
          <button onClick={() => handleTabChange('member')}>Members</button>
          <button onClick={() => setWardModalOpen(true)}>Select Ward</button>
        </div>
      )}

      {isWardModalOpen && (
        <div className={styles.wardModal} onClick={() => setWardModalOpen(false)}>
          <div className={styles.wardModalContent} onClick={e => e.stopPropagation()}>
            <h3>Select Ward</h3>
            <select 
              value={currentDivision || ''}
              onChange={(e) => handleDivisionChange(e.target.value)}
            >
              <option value="">Select Division</option>
              {divisions.map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
            <select 
              value={router.query.wardId || ''}
              onChange={(e) => handleWardChange(e.target.value)}
              disabled={!currentDivision || loadingWards}
            >
              <option value="">Select Ward</option>
              {wards.map(w => (
                <option key={w.code} value={w.code}>{w.name}</option>
              ))}
            </select>
            <button onClick={() => setWardModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}