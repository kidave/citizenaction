"use client";

import { useEffect, useRef, useState } from "react";
import { RegionService } from "data/regions";
import styles from "styles/components/feedback/tooltip.module.css";

export default function WardTooltip({ wardCode, anchorRect, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!anchorRect || !ref.current) return;

    const tooltipWidth = ref.current.offsetWidth;
    const tooltipHeight = ref.current.offsetHeight;
    const padding = 8;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // center horizontally relative to button
    let left = anchorRect.left + (anchorRect.width / 2) - (tooltipWidth / 2);
    let top = anchorRect.top - tooltipHeight - padding; // 👈 default ABOVE
    let position = "above";

    // keep inside viewport horizontally
    if (left < 12) left = 12;
    if (left + tooltipWidth > vw - 12) left = vw - tooltipWidth - 12;

    // if not enough space above → flip below
    if (top < 12) {
      top = anchorRect.bottom + padding;
      position = "below";
    }

    setPos({ left, top, position });
  }, [anchorRect]);


    
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const ward = RegionService.getWardByCode(wardCode);
  const info = ward?.tooltip;

  return (
    <div
      ref={ref}
      role="tooltip"
      className={styles.tooltipContainer}
      data-position={pos.position}
      style={{ left: pos.left, top: pos.top }}
    >
      <div className={styles.tooltipTitle}>
        Ward {ward?.name || wardCode}
      </div>

      {info ? (
        <div className={styles.tooltipBody}>
          {info.description && (
            <div className={styles.tooltipDescription}>{info.description}</div>
          )}

          {!!info.areas?.length && (
            <div>
              <div className={styles.tooltipLabel}>Areas</div>
              <div className={styles.areaList}>
                {info.areas.map((a, i) => (
                  <span key={i} className={styles.areaItem}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {!!info.landmarks?.length && (
            <div>
              <div className={styles.tooltipLabel}>Landmarks</div>
              <ul className={styles.landmarkList}>
                {info.landmarks.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.tooltipDescription}>
          <code>tooltip</code> data for this ward.
        </div>
      )}
    </div>
  );
}
