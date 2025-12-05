// components/shared/ui/WardTooltip.js
"use client";

import { useEffect, useRef, useState } from "react";
import styles from "styles/components/feedback/tooltip.module.css";

export default function WardTooltip({ ward, anchorRect, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, position: "above" });

  // Recalculate AFTER component actually renders
  const recalcPosition = () => {
    if (!ref.current || !anchorRect) return;

    const tooltipWidth = ref.current.offsetWidth;
    const tooltipHeight = ref.current.offsetHeight;
    const padding = 8;

    const vw = window.innerWidth;

    let left =
      anchorRect.left + anchorRect.width / 2 - tooltipWidth / 2;

    let top = anchorRect.top - tooltipHeight - padding;
    let position = "above";

    if (left < 12) left = 12;
    if (left + tooltipWidth > vw - 12)
      left = vw - tooltipWidth - 12;

    if (top < 12) {
      top = anchorRect.bottom + padding;
      position = "below";
    }

    setPos({ left, top, position });
  };

  // Initial + rerender positioning
  useEffect(() => {
    recalcPosition();
    const t = setTimeout(recalcPosition, 25);
    return () => clearTimeout(t);
  }, [anchorRect, ward]);

  // Handle click outside
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
      className={styles.tooltipContainer}
      data-position={pos.position}
      style={{ left: pos.left, top: pos.top }}
    >
      <div className={styles.tooltipTitle}>Ward {ward.name}</div>

      <div className={styles.tooltipBody}>
        {ward.description && (
          <div className={styles.tooltipDescription}>
            {ward.description}
          </div>
        )}

        {ward.areas?.length > 0 && (
          <div>
            <div className={styles.tooltipLabel}>Areas</div>
            <div className={styles.areaList}>
              {ward.areas.map((a, i) => (
                <span key={i} className={styles.areaItem}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {ward.landmarks?.length > 0 && (
          <div>
            <div className={styles.tooltipLabel}>Landmarks</div>
            <ul className={styles.landmarkList}>
              {ward.landmarks.map((lm, i) => (
                <li key={i}>{lm}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
