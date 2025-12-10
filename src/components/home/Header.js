// components/home/Header.js
import styles from "styles/layout/header.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "context/AuthContext";
import Logo from "components/shared/design/Logo";
import CommitteeButton from "components/shared/ui/CommitteeButton";

export default function Header() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Track client-side mounting

  // Initialize state safely for SSR
  const [isDesktop, setIsDesktop] = useState(true); // Default to true for SSR

  useEffect(() => {
    setIsMounted(true); // Component is now mounted on client
    setIsDesktop(window.innerWidth > 1024);
    
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleProfileDropdown = () => {
    setProfileOpen(!profileOpen);
  };

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
  };

  const isExternalLink = (path) => path.startsWith("http");

  const isActive = (path) => {
    if (isExternalLink(path)) return false;
    if (router.pathname === path) return true;
    if (path !== "/" && router.pathname.startsWith(path)) return true;
    return false;
  };

  const dropdownItems = {
    Region: [
      { label: "Mumbai Metropolitan Region", path: "/region/MH-MMR" },
    ],
    Community: [
      { label: "Manifesto", path: "https://www.walkingproject.org/activities-projects/manifesto" },
      { label: "Community Connect", path: "/forum" },
      { label: "Community Walks", path: "https://www.walkingproject.org/activities-projects/community-walks" },
      { label: "Community Talks", path: "https://www.walkingproject.org/activities-projects/community-talks" },
      { label: "Student Engagement", path: "https://www.walkingproject.org/activities-projects/student-engagement" },
    ],
  };

  return (
    <header className={styles.header}>
      <Logo />

      {/* Only render navigation after component is mounted on client */}
      {isMounted && (
        <>
          {/* DESKTOP NAV */}
          {isDesktop && (
            <nav className={styles.desktopNav}>
              {Object.keys(dropdownItems).map((label) => (
                <div key={label} className={styles.dropdown}>
                  <div className={styles.dropdownTrigger} tabIndex="0">
                    {label}
                    <FiChevronDown size={14} />
                  </div>
                  <div className={styles.dropdownContent}>
                    {dropdownItems[label].map((subItem) => (
                      <Link 
                        key={subItem.label}
                        href={subItem.path}
                        className={styles.dropdownItem}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {/* LOGIN / PROFILE */}
              {!user ? (
                <Link href="/auth" className={styles.navButton}>
                  Login
                </Link>
              ) : (
                <div className={styles.profileWrapper} onClick={toggleProfileDropdown}>
                  <img
                    src={
                      profile?.avatar_url ||
                      user.user_metadata?.avatar_url ||
                      "/user1.png"
                    }
                    alt="avatar"
                    className={styles.avatar}
                    onError={(e) => (e.target.src = "/user1.png")}
                  />
                  {profileOpen && (
                    <div className={styles.profileDropdown}>
                      <div
                        className={`${styles.dropdownItem} ${
                          router.pathname === "/profile" ? styles.active : ""
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
                <CommitteeButton inline={true} />
              </div>
            </nav>
          )}

          {/* MOBILE NAV BUTTON */}
          {!isDesktop && (
            <button
              className={styles.mobileMenuButton}
              onClick={() => setMobileOpen(true)}
            >
              <FiMenu size={24} />
            </button>
          )}

          {/* MOBILE SIDEBAR */}
          {mobileOpen && !isDesktop && (
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
                  <div className={styles.mobileCommitteeButton}>
                    <CommitteeButton inline={true} />
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
        </>
      )}
    </header>
  );
}