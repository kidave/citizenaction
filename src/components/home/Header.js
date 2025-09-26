// components/home/Header.js
import styles from "styles/layout/header.module.css";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { FiChevronDown, FiMenu, FiX, FiChevronRight } from "react-icons/fi";
import { useAuth } from "context/AuthContext";
import { REGION_DATA, REGION_STATUS, RegionService } from "data/regions";

export default function Header() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('MUM'); // Default to Mumbai
  const [selectedDivision, setSelectedDivision] = useState(null);
  
  const regionDropdownRef = useRef(null);

  const handleDropdownToggle = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const toggleProfileDropdown = () => {
    setProfileOpen(!profileOpen);
  };

  const toggleRegionDropdown = () => {
    setRegionDropdownOpen(!regionDropdownOpen);
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

  // Handle ward selection
  const handleWardSelect = (wardCode) => {
    router.push(`/ward/${wardCode}`);
    setRegionDropdownOpen(false);
  };

  // Handle city selection
  const handleCitySelect = (cityCode) => {
    setSelectedCity(cityCode);
    setSelectedDivision(null);
  };

  // Handle division selection
  const handleDivisionSelect = (divisionCode) => {
    setSelectedDivision(divisionCode === selectedDivision ? null : divisionCode);
  };

  // Get current city data
  const currentCity = RegionService.getCityByCode(selectedCity);
  const cityDivisions = RegionService.getDivisionsByCity(selectedCity);
  const currentDivision = selectedDivision ? RegionService.getDivisionByCode(selectedDivision) : null;
  const divisionWards = selectedDivision ? RegionService.getWardsByDivision(selectedDivision) : [];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close profile dropdown
      if (!e.target.closest(`.${styles.profileWrapper}`)) {
        setProfileOpen(false);
      }
      
      // Close region dropdown
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(e.target)) {
        setRegionDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const dropdownItems = {
    More: [
      {
        label: "Annual SV Road Walk",
        path: "https://www.walkingproject.org/activities-projects/annual-sv-road-walk",
      },
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
      {
        label: "Participate",
        path: "https://www.walkingproject.org/participate",
      },
      { 
        label: "Resources", 
        path: "https://www.walkingproject.org/resources" 
      },
    ],
  };

  const staticMenu = [
    { label: "Home", path: "/" },
    { label: "Join Committee", path: "/joincommittee" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.bottomBar}>
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
        </nav>

        {/* Mobile menu button and sidebar remain the same */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setMobileOpen(true)}
        >
          <FiMenu size={24} />
        </button>
        
        {/* Mobile sidebar implementation remains the same */}
        {mobileOpen && (
          <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)}>
            <div className={styles.mobileSidebar} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={() => setMobileOpen(false)}>
                <FiX size={24} />
              </button>
              <div className={styles.mobileNavContent}>
                {/* Mobile navigation content remains the same */}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// Export your existing data (keep this at the bottom)
export { REGION_DATA, REGION_STATUS, RegionService };