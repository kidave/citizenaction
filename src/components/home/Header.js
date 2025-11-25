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

  // 🔥 Prevent hydration mismatch: detect layout width on client
  const [isDesktop, setIsDesktop] = useState(null);

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth > 1024);
    };

    checkWidth(); // initial run on client
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

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

  const staticMenu = [{ label: "Home", path: "/" }];

  return (
    <header className={styles.header}>

      {/* Logo */}
      <div
        className={styles.logoContainer}
        onClick={() => router.push("/")}
      >
        <div className={styles.logo}>
          <img src="/wp_icon_sm.avif" alt="Logo" className={styles.logoIcon} />
          <img src="/wp_text_logo.avif" alt="Walking Project" className={styles.logoText} />
        </div>
      </div>

      {/* Layout hidden during SSR to avoid mobile→desktop jump */}
      {isDesktop === null ? null : (
        <>
          {/* DESKTOP NAV */}
          {isDesktop && (
            <nav className={styles.desktopNav}>
              {staticMenu.map((item) => (
                <button
                  key={item.label}
                  className={`${styles.navButton} ${isActive(item.path) ? styles.active : ""}`}
                  onClick={() => router.push(item.path)}
                >
                  {item.label}
                </button>
              ))}

              {Object.keys(dropdownItems).map((label) => (
                <div key={label} className={styles.dropdown}>
                  <button
                    className={`${styles.navButton} ${
                      dropdownItems[label].some((i) => isActive(i.path))
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => handleDropdownToggle(label)}
                  >
                    {label}
                    <FiChevronDown size={14} style={{ marginLeft: 5 }} />
                  </button>

                  {openDropdown === label && (
                    <div className={styles.dropdownContent}>
                      {dropdownItems[label].map((subItem) => (
                        <div
                          key={subItem.label}
                          className={`${styles.dropdownItem} ${
                            isActive(subItem.path) ? styles.active : ""
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

              {/* LOGIN / PROFILE */}
              {!user ? (
                <button
                  className={`${styles.navButton} ${
                    router.pathname === "/auth" ? styles.active : ""
                  }`}
                  onClick={() => router.push("/auth")}
                >
                  Login
                </button>
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
                <CommitteeButton inline={true} variant="secondary" />
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
