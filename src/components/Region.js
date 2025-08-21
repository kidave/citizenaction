// components/Region.js
"use client";

import { useState, useCallback, useRef } from "react";
import { supabase } from "utils/supabaseClient";
import styles from "styles/layout/region.module.css";
import buttonStyles from "styles/components/button.module.css";
import { FiMap, FiMapPin, FiCrosshair, FiCheck } from "react-icons/fi";
import { useRegionData } from "hooks/useRegionData";
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
    setRegionPath,
    navigatingWard,
  } = useRegionData();

  const [detecting, setDetecting] = useState(false);
  const [detectedWard, setDetectedWard] = useState(null);
  const wardButtonsRef = useRef({});

  // Tooltip state
  const [hoverWard, setHoverWard] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const [hoverDivision, setHoverDivision] = useState(null);
  const [divisionAnchorRect, setDivisionAnchorRect] = useState(null);

  const closeTooltip = useCallback(() => {
    setHoverWard(null);
    setAnchorRect(null);
    setHoverDivision(null);
    setDivisionAnchorRect(null);
  }, []);

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

          // wait for wards to load then highlight
          setTimeout(() => {
            const button = wardButtonsRef.current[wardId];
            if (button) {
              button.scrollIntoView({ behavior: "smooth", block: "center" });
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

  return (
    <div className={styles.regionContainer}>
      {/* Detect my ward */}
      <div className={styles.detectWardContainer}>
        <button
          className={styles.detectWardButton}
          onClick={detectMyWard}
          disabled={detecting}
        >
          <FiCrosshair />
          {detecting ? "Locating..." : "Locate Ward"}
        </button>

        {detectedWard && (
          <div className={styles.detectedWardResult}>
            <FiCheck />
            <span>
              Your Ward: {wards.find((w) => w.code === detectedWard)?.name}
            </span>
          </div>
        )}
      </div>

      {/* Cities */}
      <div className={styles.sectionTitle}></div>
      <div className={styles.cityContainer}>
        {cities.map((city) => {
          const config = statusConfig[city.status] || statusConfig.Pending;
          const isActive = selectedCity === city.code;

          return (
            <button
              key={city.code}
              className={`${buttonStyles.btnBig} ${isActive ? buttonStyles.active : ""}`}
              disabled={config.disabled}
              onClick={() => handleCityChange(city.code)}
              style={{
                opacity: config.disabled ? 0.4 : 1,
                cursor: config.disabled ? "not-allowed" : "pointer",
                position: "relative",
              }}
            >
              {city.name}
              {config.disabled && (
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: config.color }}
                >
                  {config.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Divisions */}
      {selectedCity && (
        <>
          <div className={styles.sectionTitle}>
            <FiMap className={styles.sectionIcon} />
            <span>Select Division</span>
          </div>
          <div className={styles.divisionContainer}>
            {divisions.map((division) => (
              <button
                key={division.code}
                className={`${buttonStyles.btnMedium} ${
                  selectedDivision === division.code ? buttonStyles.active : ""
                }`}
                onClick={() => handleDivisionChange(division.code)}
                onMouseEnter={(e) => {
                  setHoverDivision(division.code);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDivisionAnchorRect({
                    left: rect.left,
                    top: rect.bottom,
                    right: rect.right,
                    bottom: rect.bottom,
                  });
                }}
                onMouseLeave={() => {
                  setHoverDivision(null);
                  setDivisionAnchorRect(null);
                }}
              >
                {division.name}
              </button>
            ))}
          </div>
        </>
      )}


      {/* Wards */}
      {selectedDivision && (
        <>
          <div className={styles.sectionTitle}>
            <FiMapPin className={styles.sectionIcon} />
            <span>Select Ward</span>
          </div>
          <div className={styles.wardContainer}>
            {wards.map((ward) => (
              <div
                key={ward.code}
                style={{ position: "relative", display: "inline-block" }}
                ref={(el) => (wardButtonsRef.current[ward.code] = el)}
                onMouseEnter={(e) => {
                  setHoverWard(ward.code);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setAnchorRect({
                    left: rect.left,
                    top: rect.bottom,
                    right: rect.right,
                    bottom: rect.bottom,
                  });
                }}
                onMouseLeave={closeTooltip}
              >
                <button
                  className={`${buttonStyles.btnSmall} ${
                    detectedWard === ward.code ? "highlighted-ward" : ""
                  }`}
                  onClick={() => handleWardChange(ward.code)}
                  disabled={!!navigatingWard} // disable all when navigating
                >
                  {navigatingWard === ward.code ? "Loading..." : ward.name}
                </button>

                {/* Tooltip inside same container */}
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

      {/* Highlight animation */}
      <style jsx>{`
        .highlighted-ward {
          animation: pulse 2s infinite;
          box-shadow: 0 0 0 2px rgba(250, 200, 50, 1);
          position: relative;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 2px rgba(250, 200, 50, 1);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(250, 200, 50, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(250, 200, 50, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default Region;
