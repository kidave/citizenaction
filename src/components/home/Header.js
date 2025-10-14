// components/home/Header.js
import styles from "styles/layout/header.module.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "context/AuthContext";
import CommitteeButton from "components/shared/ui/CommitteeButton";

export default function Header() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDropdownToggle = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const toggleProfileDropdown = () => {
    setProfileOpen(!profileOpen);
  };

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
  };

  // Check if a path is external (starts with http)
  const isExternalLink = (path) => {
    return path.startsWith('http');
  };

  // Check if a navigation item is active
  const isActive = (path) => {
    if (isExternalLink(path)) return false;
    
    // For exact matches
    if (router.pathname === path) return true;
    
    // For nested routes (e.g., /forum/thread should highlight /forum)
    if (path !== '/' && router.pathname.startsWith(path)) return true;
    
    return false;
  };

  const dropdownItems = {
    Region: [
      {
        label: "Mumbai Metropolitan Region",
        path: "/region/MMR",
      },
    ],
    Community: [
      {
        label: "Manifesto",
        path: "https://www.walkingproject.org/activities-projects/manifesto",
      },
      { 
        label: "Community Forum", 
        path: "/forum" 
      },
      {
        label: "Community Walks",
        path: "https://www.walkingproject.org/activities-projects/community-walks",
      },
      {
        label: "Community Talks",
        path: "https://www.walkingproject.org/activities-projects/community-talks",
      },
      {
        label: "Student Engagement",
        path: "https://www.walkingproject.org/activities-projects/student-engagement",
      },
    ],
  };

  const staticMenu = [
    { label: "Home", path: "/" },
  ];

  return (
    <header className={styles.header}>
      
        <div
          className={styles.logoContainer}
          onClick={() => router.push("https://www.walkingproject.org")}
          aria-label="Home"
          role="button"
          tabIndex={0}
          title="Home"
        >
          <div className={styles.logo}>
            <img 
              src="/wp_icon_sm.png" 
              alt="Logo" 
              className={styles.logoIcon}
              style={{ width: '32px', height: '40px' }}
            />
            <img
              src="/wp_text_logo.png"
              alt="Walking Project"
              className={styles.logoText}
              style={{ height: '40px' }}
            />
          </div>
        </div>
        
        <nav className={styles.desktopNav}>
          {staticMenu.map((item) => (
            <button
              key={item.label}
              className={`${styles.navButton} ${
                isActive(item.path) ? styles.active : ''
              }`}
              onClick={() => router.push(item.path)}
            >
              {item.label}
            </button>
          ))}

          {Object.keys(dropdownItems).map((label) => (
            <div key={label} className={styles.dropdown}>
              <button
                className={`${styles.navButton} ${
                  dropdownItems[label].some(item => isActive(item.path)) ? styles.active : ''
                }`}
                onClick={() => handleDropdownToggle(label)}
              >
                {label}
                <FiChevronDown size={14} style={{ marginLeft: "5px" }} />
              </button>
              {openDropdown === label && (
                <div className={styles.dropdownContent}>
                  {dropdownItems[label].map((subItem) => (
                    <div
                      key={subItem.label}
                      className={`${styles.dropdownItem} ${
                        isActive(subItem.path) ? styles.active : ''
                      }`}
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
              className={`${styles.navButton} ${
                router.pathname === '/auth' ? styles.active : ''
              }`}
              onClick={() => router.push("/auth")}
            >
              Login
            </button>
          ) : (
            <div
              className={styles.profileWrapper}
              onClick={toggleProfileDropdown}
            >
              <img
                src={
                  profile?.avatar_url ||
                  user.user_metadata?.avatar_url ||
                  "/user1.png"
                }
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
                    className={`${styles.dropdownItem} ${
                      router.pathname === '/profile' ? styles.active : ''
                    }`}
                    onClick={() => router.push("/profile")}
                  >
                    My Profile
                  </div>
                  <div className={styles.dropdownItem} onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
          <div className={styles.committeeButtonWrapper}>
            <CommitteeButton inline={true} variant="secondary" />
          </div>
        </nav>

        <button
          className={styles.mobileMenuButton}
          onClick={() => setMobileOpen(true)}
        >
          <FiMenu size={24} />
        </button>
        
        {mobileOpen && (
          <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)}>
            <div className={styles.mobileSidebar} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={() => setMobileOpen(false)}>
                <FiX size={24} />
              </button>
              <div className={styles.mobileNavContent}>
                {staticMenu.map((item) => (
                  <div
                    key={item.label}
                    className={styles.mobileNavItem}
                    onClick={() => {
                      router.push(item.path);
                      setMobileOpen(false);
                    }}
                  >
                    {item.label}
                  </div>
                ))}

                {/* Mobile version of CommitteeButton */}
                <div className={styles.mobileCommitteeButton}>
                  <CommitteeButton inline={true} variant="secondary" />
                </div>

                {Object.keys(dropdownItems).map((label) => (
                  <div key={label} className={styles.mobileNavSection}>
                    <strong>{label}</strong>
                    {dropdownItems[label].map((sub) => (
                      <div
                        key={sub.label}
                        className={styles.mobileNavSubItem}
                        onClick={() => {
                          router.push(sub.path);
                          setMobileOpen(false);
                        }}
                      >
                        {sub.label}
                      </div>
                    ))}
                  </div>
                ))}

                {!user ? (
                  <div
                    className={styles.mobileNavItem}
                    onClick={() => {
                      router.push("/auth");
                      setMobileOpen(false);
                    }}
                  >
                    Login
                  </div>
                ) : (
                  <>
                    <div
                      className={styles.mobileNavItem}
                      onClick={() => router.push("/profile")}
                    >
                      My Profile
                    </div>
                    <div
                      className={styles.mobileNavItem}
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                    >
                      Logout
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
    </header>
  );
}