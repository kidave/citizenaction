"use client";

import { useEffect, useRef, useState } from "react";
import { RegionService } from "data/regions";
import styles from "styles/components/tooltip.module.css";

export default function DivisionTooltip({ divisionCode, anchorRect, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!anchorRect) return;
    const tooltipWidth = 260;
    const tooltipHeight = 120;
    const padding = 8;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = anchorRect.left;
    let top = anchorRect.bottom + padding;

    if (left + tooltipWidth > vw - 12) left = vw - tooltipWidth - 12;
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

  const division = RegionService.getDivisionByCode(divisionCode);
  const city = division ? RegionService.getCityByCode(division.city_code) : null;

  return (
    <div
      ref={ref}
      role="tooltip"
      className={styles.tooltipContainer}
      style={{ left: pos.left, top: pos.top }}
    >
      <div className={styles.tooltipTitle}>
        {division?.name || divisionCode}
      </div>
      <div className={styles.tooltipBody}>
        
        <div className={styles.tooltipDescription}>
          
        </div>
      </div>
    </div>
  );
}
