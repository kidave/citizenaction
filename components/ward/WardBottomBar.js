// components/ward/WardBottomBar.js
import { useState, useEffect } from 'react';
import styles from '../../styles/layout/bottombar.module.css';
import { useRouter } from 'next/router';
import { FaUsers } from "react-icons/fa";
import { FiHome, FiMenu } from 'react-icons/fi';
import { BsCardList } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { MdOutlineAssignment } from "react-icons/md";
import { useMediaQuery } from 'react-responsive';
import { supabase } from '../../utils/supabaseClient';

export default function WardBottomBar({
  activeTab,
  onTabChange,
  wardInfo,
  onShowForm = () => {} // Default empty function
}) {
  const router = useRouter();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    // Check auth state on mount
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTabChange = (tab) => {
    onTabChange(tab);
    setIsHamburgerOpen(false);
  };

  const handleHamburgerClick = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
  };

  const handleShowForm = () => {
    if (!user) {
      // Store current path for redirect after login
      localStorage.setItem('returnTo', router.asPath);
      router.push('/auth');
      return;
    }
    onShowForm();
    setIsHamburgerOpen(false);
  };

  const handleProfileNavigation = () => {
    if (!user) {
      // Store current path for redirect after login
      localStorage.setItem('returnTo', router.asPath);
      router.push('/auth');
      return;
    }
    router.push('/profile');
    setIsHamburgerOpen(false);
  };

  if (!isMobile) return null;

  return (
    <>
      <div className={styles.bottomBar}>
        <button
          className={styles.hamburgerButton} 
          onClick={() => router.push('/')}
          aria-label="Home"
        >
          <FiHome />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === 'meeting' ? styles.active : ''}`}
          onClick={() => handleTabChange('meeting')}
          aria-label="Meetings"
        >
          <BsCardList />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === 'update' ? styles.active : ''}`}
          onClick={() => handleTabChange('update')}
          aria-label="Updates"
        >
          <TbTimelineEvent />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === 'project' ? styles.active : ''}`}
          onClick={() => handleTabChange('project')}
          aria-label="Projects"
        >
          <MdOutlineAssignment />
        </button>
        <button
          className={`${styles.hamburgerButton} ${activeTab === 'member' ? styles.active : ''}`}
          onClick={() => handleTabChange('member')}
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

      {isHamburgerOpen && (
        <div className={styles.hamburgerDropdown}>
          <button 
            onClick={() => {
              handleTabChange('road');
              setIsHamburgerOpen(false);
            }}
            aria-label="Road"
          >
            Road
          </button>
          <button 
            onClick={() => {
              handleTabChange('junction');
              setIsHamburgerOpen(false);
            }}
            aria-label="Junction"
          >
            Junction
          </button>
          <button 
            onClick={handleShowForm}
            aria-label="Join Committee"
          >
            {user ? 'Join Committee' : 'Login to Join'}
          </button>
          <button 
            onClick={handleProfileNavigation}
            aria-label="Profile"
          >
            {user ? 'Profile' : 'Login'}
          </button>
        </div>
      )}
    </>
  );
}