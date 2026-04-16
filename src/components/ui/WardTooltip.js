// components/ui/WardTooltip.js
"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import styles from "@/styles/components/ui/Tooltip.module.css";

export default function WardTooltip({ ward, children }) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        {/* Trigger = whatever you wrap (ward button/link) */}
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            className={styles.tooltipContainer}
            side="top"
            align="center"
            sideOffset={10}
            avoidCollisions
            collisionPadding={12}
            sticky="partial"
          >
            <div className={styles.tooltipTitle}>
              Ward {ward.name}
            </div>

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

            <Tooltip.Arrow className={styles.tooltipArrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
