// components/ward/WardSummaryPanel.js
"use client";

import { useMemo } from "react";
import { useWardMapillary } from "hooks/useWardMapillary";
import { useWardRoads } from "hooks/useWardData";
import { MAPILLARY_CATEGORIES } from "config/mapillaryCategories";
import styles from "styles/tabs/summary.module.css";

export default function WardSummaryPanel({ wardCode, objectValues = [], selectedRoad }) {
  // get all features for the current objectValues set
  const { data: features = [] } = useWardMapillary(wardCode, { objectTypes: objectValues });
  const { data: roads = [] } = useWardRoads(wardCode);

  const totalsByCategory = useMemo(() => {
    const map = {};
    for (const k of Object.keys(MAPILLARY_CATEGORIES)) { map[k] = 0; }
    for (const f of features) {
      const catKey = Object.keys(MAPILLARY_CATEGORIES).find(k => MAPILLARY_CATEGORIES[k].values.includes(f.object_value));
      if (catKey) map[catKey] = (map[catKey] || 0) + 1;
    }
    return map;
  }, [features]);

  // counts per road
  const countsPerRoad = useMemo(() => {
    const m = new Map();
    for (const r of roads) m.set(r.fid, { road: r, count: 0 });
    for (const f of features) {
      const rf = f.road_fid;
      if (rf && m.has(rf)) m.get(rf).count++;
    }
    return Array.from(m.values()).sort((a,b) => b.count - a.count);
  }, [roads, features]);

  // total features
  const totalFeatures = features.length;

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Total items</div>
          <div className={styles.statValue}>{totalFeatures}</div>
        </div>

        <div className={styles.categoryList}>
          {Object.entries(MAPILLARY_CATEGORIES).map(([key,cfg]) => (
            <div key={key} className={styles.catRow}>
              <div className={styles.catName}>
                <span style={{ color: cfg.color }}>{cfg.icon}</span>
                <span style={{ marginLeft:8 }}>{cfg.label}</span>
              </div>
              <div className={styles.catCount}>{totalsByCategory[key] || 0}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <h4>Top roads (by selected items)</h4>
        <div className={styles.roadList}>
          {countsPerRoad.slice(0, 12).map(entry => (
            <div key={entry.road.fid} className={styles.roadRow}>
              <div className={styles.roadName}>{entry.road.name || `Road ${entry.road.fid}`}</div>
              <div className={styles.roadCount}>{entry.count}</div>
            </div>
          ))}
          {countsPerRoad.length === 0 && <div className={styles.empty}>No features on roads</div>}
        </div>
      </div>
    </div>
  );
}
