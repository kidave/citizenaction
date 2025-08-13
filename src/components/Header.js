import styles from "styles/layout/header.module.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "context/AuthContext";

export default function Header() {
  const router = useRouter();
  // You already have the logout function from the context
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

  // --- THIS IS THE FIX ---
  const handleLogout = async () => {
    // Call the logout function from the context.
    // It handles signing out, clearing state, and redirecting.
    await logout();
    setProfileOpen(false); // Close the dropdown after logout
  };
  // -----------------------

  const dropdownItems = {
    "Activities + Projects": [
      {
        label: "Annual SV Road Walk",
        path: "https://www.walkingproject.org/activities-projects/annual-sv-road-walk",
      },
      {
        label: "Manifesto",
        path: "https://www.walkingproject.org/activities-projects/manifesto",
      },
      { label: "Community Forum", path: "/forum" },
      {
        label: "Community Walks",
        path: "https://www.walkingproject.org/activities-projects/community-walks",
      },
      {
        label: "Community Talks",
        path: "https://www.walkingproject.org/activities-projects/community-talks",
      },
      {
        label: "AQ Mapping",
        path: "https://www.walkingproject.org/activities-projects/aq-mapping",
      },
      {
        label: "Ward Map",
        path: "https://www.walkingproject.org/activities-projects/wardmap",
      },
      {
        label: "Student Engagement",
        path: "https://www.walkingproject.org/activities-projects/student-engagement",
      },
      {
        label: "Temperature Mapping",
        path: "https://www.walkingproject.org/activities-projects/temperature-mapping",
      },
      {
        label: "Footpath Mapping",
        path: "https://www.walkingproject.org/activities-projects/footpath-mapping",
      },
      {
        label: "In The News",
        path: "https://www.walkingproject.org/activities-projects/in-the-news",
      },
    ],
    More: [
      {
        label: "Participate",
        path: "https://www.walkingproject.org/participate",
      },
      { label: "Resources", path: "https://www.walkingproject.org/resources" },
    ],
  };

  const staticMenu = [
    { label: "Home", path: "/" },
    { label: "About us", path: "https://www.walkingproject.org/about-us" },
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.profileWrapper}`)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <span className={styles.topBarText}>
          Donations help us carry out our work!
        </span>
        <button
          className={styles.donateNow}
          onClick={() => router.push("https://www.walkingproject.org/donate")}
        >
          Donate Now!
        </button>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.logo}>
          <button
            className={styles.logoButton}
            onClick={() => router.push("https://www.walkingproject.org")}
          >
            <img src="/wp_icon_sm.png" alt="Logo" className={styles.logo} />
          </button>
          <span className={styles.bottomBarText}>Walking Project</span>
        </div>

        <nav className={styles.desktopNav}>
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
                <FiChevronDown size={14} style={{ marginLeft: "5px" }} />
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
                    className={styles.dropdownItem}
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
        </nav>
        <button
          className={styles.mobileMenuButton}
          onClick={() => setMobileOpen(true)}
        >
          <FiMenu size={24} />
        </button>
        {mobileOpen && (
          <div
            className={styles.mobileOverlay}
            onClick={() => setMobileOpen(false)}
          >
            <div
              className={styles.mobileSidebar}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeButton}
                onClick={() => setMobileOpen(false)}
              >
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
                      onClick={() => {
                        router.push("/profile");
                        setMobileOpen(false);
                      }}
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
      </div>
    </header>
  );
}
