// components/Region.js
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "utils/supabaseClient";
import styles from "styles/layout/region.module.css";
import { FiMap, FiMapPin, FiCrosshair, FiCheck, FiNavigation } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useLocationData } from "hooks/useLocation";
import WardTooltip from "components/shared/ui/WardTooltip";

function Region() {
  const {
    cities,
    divisions,
    wards,
    selectedCity,
    selectedDivision,
    statusConfig,
    handleCityChange,
    handleDivisionChange,
    handleWardChange,
    navigatingWard,
  } = useLocationData();

  const [detecting, setDetecting] = useState(false);
  const [detectedWard, setDetectedWard] = useState(null);
  const wardButtonsRef = useRef({});
  const divisionViewRef = useRef(null);
  const [currentDivisionIdx, setCurrentDivisionIdx] = useState(0);
  

  // Tooltip state
  const [hoverWard, setHoverWard] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);

  const closeTooltip = useCallback(() => {
    setHoverWard(null);
    setAnchorRect(null);
  }, []);


  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") {
        setCurrentDivisionIdx((i) => Math.max(0, i - 1));
      }
      if (e.key === "ArrowRight") {
        setCurrentDivisionIdx((i) => Math.min(divisions.length - 1, i + 1));
      }
      if (e.key === "Enter" && divisions[currentDivisionIdx]) {
        handleDivisionChange(divisions[currentDivisionIdx].code);
      }
      if (e.key === "Escape") {
        closeTooltip();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [divisions, currentDivisionIdx, handleDivisionChange, closeTooltip]);

  const detectMyWard = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in your browser.");
      return;
    }
    setDetecting(true);
    setDetectedWard(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data, error } = await supabase.rpc("get_ward_by_point", {
            lng: coords.longitude,
            lat: coords.latitude,
          });

          setDetecting(false);

          if (error || !data) {
            alert("Could not detect your ward.");
            return;
          }

          const row = Array.isArray(data) ? data[0] : data;
          const wardId = row?.ward_code;
          const divisionId = row?.division_code;
          const cityId = row?.city_code;

          if (!wardId || !divisionId || !cityId) {
            alert("Ward / Division / City not found in response");
            return;
          }

          // update selections
          setDetectedWard(wardId);
          handleCityChange(cityId);
          handleDivisionChange(divisionId);

          // sync carousel index so useEffect won't override
          setCurrentDivisionIdx(
            divisions.findIndex((d) => d.code === divisionId) || 0
          );

          // wait for wards to load then highlight
          setTimeout(() => {
            const button = wardButtonsRef.current[wardId];
            if (button) {
              button.scrollIntoView({ behavior: "smooth", block: "nearest" });
              button.classList.add("highlighted-ward");
              setTimeout(() => button.classList.remove("highlighted-ward"), 3000);
            }
          }, 400);
        } catch (e) {
          setDetecting(false);
          alert("Could not detect your ward.");
        }
      },
      () => {
        setDetecting(false);
        alert("Location permission denied.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [handleCityChange, handleDivisionChange]);

  useEffect(() => {
    if (divisions.length > 0 && currentDivisionIdx < divisions.length) {
      const activeDivision = divisions[currentDivisionIdx];
      if (activeDivision?.code !== selectedDivision) {
        handleDivisionChange(activeDivision.code);
      }
    }
  }, [divisions, currentDivisionIdx, handleDivisionChange, selectedDivision]);
  

  return (
    <div className={styles.regionContainer}>
      <div className={styles.floatingElement}></div>
      <div className={styles.floatingElement}></div>
      <div className={styles.floatingElement}></div>
      
      {/* Detect my ward - UPDATED STYLING */}
      <div className={styles.detectWardContainer}>
        <motion.button
          className={`${styles.detectWardButton} ${detecting ? styles.detecting : ''} ${detectedWard ? styles.detected : ''}`}
          onClick={detectMyWard}
          disabled={detecting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={styles.buttonContent}>
            {detecting ? (
              <motion.div 
                className={styles.spinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiNavigation />
              </motion.div>
            ) : detectedWard ? (
              <FiCheck className={styles.successIcon} />
            ) : (
              <FiCrosshair className={styles.crosshairIcon} />
            )}
            <span className={styles.buttonText}>
              {detecting ? "Locating..." : detectedWard ? "Location Found" : "Locate My Ward"}
            </span>
          </span>
          {!detecting && !detectedWard && (
            <span className={styles.pulseRing}></span>
          )}
        </motion.button>

        {detectedWard && (
          <motion.div 
            className={styles.detectedWardResult}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className={styles.resultLabel}>Your Ward:</span>
            <span className={styles.wardName}>
              {wards.find((w) => w.code === detectedWard)?.name}
            </span>
          </motion.div>
        )}
      </div>

      {/* Cities */}
      <div className={styles.scrollContainer}>
        {cities.map((city) => {
          const config = statusConfig[city.status] || statusConfig.pending;
          return (
            <div
              key={city.code}
              className={`${styles.scrollCard} ${selectedCity === city.code ? styles.active : ""}`}
              style={{
                backgroundImage: `url(/images/city/${city.code}.jpg)`,
                opacity: config.disabled ? 0.4 : 1,
                cursor: config.disabled ? "not-allowed" : "pointer",
              }}
              onClick={() => !config.disabled && handleCityChange(city.code)}
            >
              
              <div className={styles.scrollOverlay}>
                {city.name}
                {config.disabled && (
                  <span className={styles.statusBadge} style={{ backgroundColor: config.color }}>
                    {config.label}
                  </span>
                )}
              </div>
              
            </div>
          );
        })}
      </div>


      {/* Divisions */}
        {selectedCity && (
          <>            
            <div className={styles.divisionCarouselContainer}>
              <button
                className={`${styles.divisionNavButton} ${styles.left}`}
                onClick={() => setCurrentDivisionIdx(i => Math.max(0, i - 1))}
                disabled={currentDivisionIdx === 0}
              >
                <FaChevronLeft />
              </button>
              
              <div className={styles.divisionCarousel}>
                <div className={styles.divisionView} ref={divisionViewRef}>
                  <AnimatePresence mode="wait" initial={false}>
                    {divisions.length > 0 && (
                      <motion.div
                        key={divisions[currentDivisionIdx].code}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          backgroundImage: `url(/images/division/${divisions[currentDivisionIdx].code}.jpg)`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          width: "100%",
                          height: "100%",
                          borderRadius: "16px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleDivisionChange(divisions[currentDivisionIdx].code)}
                      >
                        <div className={styles.scrollOverlay}>
                          {divisions[currentDivisionIdx].name}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <button
                className={`${styles.divisionNavButton} ${styles.right}`}
                onClick={() =>
                  setCurrentDivisionIdx(i => Math.min(divisions.length - 1, i + 1))
                }
                disabled={currentDivisionIdx === divisions.length - 1}
              >
                <FaChevronRight />
              </button>
            </div>
          </>
        )}


      {/* Wards */}
      {selectedDivision && (
        <>
          <div className={styles.sectionTitle}>
            <FiMapPin className={styles.sectionIcon} />
            Select Ward
          </div>
          <div className={styles.wardContainer}>
            {wards.map((ward) => (
              <div
                key={ward.code}
                style={{ position: "relative", display: "inline-block" }}
                ref={(el) => (wardButtonsRef.current[ward.code] = el)}
                onMouseEnter={(e) => {
                  const buttonEl = e.currentTarget.querySelector("button");
                  if (!buttonEl) return;
                  const rect = buttonEl.getBoundingClientRect();
                  setHoverWard(ward.code);
                  setAnchorRect({
                    left: rect.left,
                    top: rect.top,
                    right: rect.right,
                    bottom: rect.bottom,
                    width: rect.width,
                    height: rect.height,
                  });
                }}
                onMouseLeave={closeTooltip}
              >
                <button
                  className={styles.wardBtn}
                  onClick={() => handleWardChange(ward.code)}
                  disabled={!!navigatingWard}
                >
                  {navigatingWard === ward.code
                    ? "Loading..."
                    : ward.name}
                  {detectedWard === ward.code && (
                    <span className={styles.wardBadge}>You</span>
                  )}
                </button>

                {hoverWard === ward.code && anchorRect && (
                  <WardTooltip
                    wardCode={ward.code}
                    anchorRect={anchorRect}
                    onClose={closeTooltip}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Region;