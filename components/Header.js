import styles from '../styles/layout/header.module.css';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { supabase } from '../utils/supabaseClient';

export default function Header() {
  const router = useRouter();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleDropdownToggle = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const toggleProfileDropdown = () => {
    setProfileOpen(!profileOpen);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error.message);
    } else {
      setUser(null);
      setProfileOpen(false);
      // If on a forum page, redirect to /forum, otherwise redirect to home
      if (router.pathname.startsWith('/forum')) {
        router.push('/forum');
      } else {
        router.push('/');
      }
    }
  };

  const dropdownItems = {
    'Activities + Projects': [
      { label: 'Annual SV Road Walk', path: 'https://www.walkingproject.org/activities-projects/annual-sv-road-walk' },
      { label: 'Manifesto', path: 'https://www.walkingproject.org/activities-projects/manifesto' },
      { label: 'Community Forum', path: '/forum' },
      { label: 'Community Walks', path: 'https://www.walkingproject.org/activities-projects/community-walks' },
      { label: 'Community Talks', path: 'https://www.walkingproject.org/activities-projects/community-talks' },
      { label: 'AQ Mapping', path: 'https://www.walkingproject.org/activities-projects/aq-mapping' },
      { label: 'Ward Map', path: 'https://www.walkingproject.org/activities-projects/wardmap' },
      { label: 'Student Engagement', path: 'https://www.walkingproject.org/activities-projects/student-engagement' },
      { label: 'Temperature Mapping', path: 'https://www.walkingproject.org/activities-projects/temperature-mapping' },
      { label: 'Footpath Mapping', path: 'https://www.walkingproject.org/activities-projects/footpath-mapping' },
      { label: 'In The News', path: 'https://www.walkingproject.org/activities-projects/in-the-news' },
    ],
    More: [
      { label: 'Participate', path: 'https://www.walkingproject.org/participate' },
      { label: 'Resources', path: 'https://www.walkingproject.org/resources' },
    ],
  };

  const staticMenu = [
    { label: 'Home', path: 'https://www.walkingproject.org/home' },
    { label: 'About us', path: 'https://www.walkingproject.org/about-us' },
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.profileWrapper}`)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <span className={styles.topBarText}>Donations help us carry out our work!</span>
        <button
          className={styles.donateNow}
          onClick={() => router.push('https://www.walkingproject.org/donate')}
        >
          Donate Now!
        </button>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.logo}>
          <button
            className={styles.logoButton}
            onClick={() => router.push('/')}
          >
            <img src="/wp_icon_sm.png" alt="Logo" className={styles.logo} />
          </button>
          <span className={styles.bottomBarText}>Walking Project | Ward Committee Dashboard</span>
        </div>

        <nav className={styles.nav}>
          {staticMenu.map((item) => (
            <button
              key={item.label}
              className={styles.navButton}
              onClick={() => router.push(item.path)}
            >
              {item.label}
            </button>
          ))}

          {Object.keys(dropdownItems).map((label) => (
            <div key={label} className={styles.dropdown}>
              <button
                className={styles.navButton}
                onClick={() => handleDropdownToggle(label)}
              >
                {label}
                <FiChevronDown size={14} style={{ marginLeft: '5px' }} />
              </button>
              {openDropdown === label && (
                <div className={styles.dropdownContent}>
                  {dropdownItems[label].map((subItem) => (
                    <div
                      key={subItem.label}
                      className={styles.dropdownItem}
                      onClick={() => router.push(subItem.path)}
                    >
                      {subItem.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {!user ? (
            <button
              className={styles.navButton}
              onClick={() => router.push('/login')}
            >
              Login
            </button>
          ) : (
            <div
              className={styles.profileWrapper}
              onClick={toggleProfileDropdown}
            >
              <img
                src={user.user_metadata?.avatar_url || "/user1.png"}
                alt="avatar"
                className={styles.avatar}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/user1.png";
                }}
              />
              {profileOpen && (
                <div className={styles.profileDropdown}>
                  <div
                    className={styles.dropdownItem}
                    onClick={() => router.push('/profile')}
                  >
                    My Profile
                  </div>
                  <div
                    className={styles.dropdownItem}
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}