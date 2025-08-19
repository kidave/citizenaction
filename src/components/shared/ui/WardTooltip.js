"use client";

import { useEffect, useRef, useState } from "react";
import { RegionService } from "data/regions";
import styles from "styles/components/wardtooltip.module.css";

export default function WardTooltip({ wardCode, anchorRect, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!anchorRect) return;
    const tooltipWidth = 280;
    const tooltipHeight = 200;
    const padding = 8;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = anchorRect.left;
    let top = anchorRect.bottom + padding; // default below the button

    // keep inside viewport horizontally
    if (left + tooltipWidth > vw - 12) left = vw - tooltipWidth - 12;

    // if no space at bottom, flip to top
    if (top + tooltipHeight > vh - 12) {
      top = anchorRect.top - tooltipHeight - padding;
    }

    setPos({ left, top });
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
