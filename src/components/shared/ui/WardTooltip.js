"use client";

import { useEffect, useRef, useState } from "react";
import { LocationService } from "utils/location";
import styles from "styles/components/feedback/tooltip.module.css";

export default function WardTooltip({ wardCode, anchorRect, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const [ward, setWard] = useState(null);
  const [loading, setLoading] = useState(true);

  // Single effect for positioning that handles all cases
  useEffect(() => {
    if (!anchorRect) return;

    const calculatePosition = () => {
      // Use actual dimensions if available, otherwise estimate
      const tooltipWidth = ref.current?.offsetWidth || 250;
      const tooltipHeight = ref.current?.offsetHeight || (loading ? 80 : 150);
      const padding = 8;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = anchorRect.left + (anchorRect.width / 2) - (tooltipWidth / 2);
      let top = anchorRect.top - tooltipHeight - padding;
      let position = "above";

      if (left < 12) left = 12;
      if (left + tooltipWidth > vw - 12) left = vw - tooltipWidth - 12;

      if (top < 12) {
        top = anchorRect.bottom + padding;
        position = "below";
      }

      setPos({ left, top, position });
    };

    calculatePosition();

    // Recalculate after a short delay when data loads
    if (!loading && ward) {
      const timer = setTimeout(calculatePosition, 50);
      return () => clearTimeout(timer);
    }
  }, [anchorRect, loading, ward]);

  useEffect(() => {
    const loadWardData = async () => {
      try {
        setLoading(true);
        const wardData = await LocationService.getWardByCode(wardCode);
        setWard(wardData);
      } catch (error) {
        console.error("Error loading ward data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (wardCode) {
      loadWardData();
    }
  }, [wardCode]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="tooltip"
      className={styles.tooltipContainer}
      data-position={pos.position}
      style={{ left: pos.left, top: pos.top }}
    >
      {loading ? (
        <div className={styles.tooltipDescription}>Loading ward information...</div>
      ) : (
        <>
          <div className={styles.tooltipTitle}>
            Ward {ward?.name || wardCode}
          </div>

          {ward?.description || ward?.areas?.length > 0 || ward?.landmarks?.length > 0 ? (
            <div className={styles.tooltipBody}>
              {ward.description && (
                <div className={styles.tooltipDescription}>{ward.description}</div>
              )}

              {ward.areas && ward.areas.length > 0 && (
                <div>
                  <div className={styles.tooltipLabel}>Areas</div>
                  <div className={styles.areaList}>
                    {ward.areas.map((area, index) => (
                      <span key={index} className={styles.areaItem}>{area}</span>
                    ))}
                  </div>
                </div>
              )}

              {ward.landmarks && ward.landmarks.length > 0 && (
                <div>
                  <div className={styles.tooltipLabel}>Landmarks</div>
                  <ul className={styles.landmarkList}>
                    {ward.landmarks.map((landmark, index) => (
                      <li key={index}>{landmark}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.tooltipDescription}>
              No additional information available for this ward.
            </div>
          )}
        </>
      )}
    </div>
  );
}