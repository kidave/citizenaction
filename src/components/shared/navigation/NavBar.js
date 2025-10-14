import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "context/AuthContext";
import styles from "styles/components/navigation/NavBar.module.css";

export default function NavBar({ 
  menuItems = [],
  dropdownItems = {},
  showAuth = false, // Default to false since it's optional
  showProfile = false, // Control profile visibility separately
  className = ""
}) {
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
    <nav className={`${styles.navbar} ${className}`}>
      <div className={styles.navbarContainer}>
        <div className={styles.navContent}>
          {/* Navigation items */}
          <div className={styles.desktopNav}>
            {menuItems.map((item) => (
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
          </div>

          {/* Auth section - only shown if enabled */}
          {showAuth && (
            <div className={styles.authSection}>
              {!user ? (
                <button
                  className={styles.navButton}
                  onClick={() => router.push("/auth")}
                >
                  Login
                </button>
              ) : (
                showProfile && (
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
                )
              )}
            </div>
          )}
        </div>
        
        {/* Mobile menu button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setMobileOpen(true)}
        >
          <FiMenu size={24} />
        </button>
        
        {/* Mobile sidebar */}
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
                {menuItems.map((item) => (
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

                {showAuth && !user ? (
                  <div
                    className={styles.mobileNavItem}
                    onClick={() => {
                      router.push("/auth");
                      setMobileOpen(false);
                    }}
                  >
                    Login
                  </div>
                ) : showAuth && showProfile && (
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
      </div>
    </nav>
  );
}