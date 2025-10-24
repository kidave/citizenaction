"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from "styles/tabs/project.module.css";

const JunctionMap = dynamic(() => import("./JunctionMap"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading junction map...</div>,
});

const RoadMap = dynamic(() => import("./RoadMap"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading road map...</div>,
});

export default function ProjectMap({
  junctionFid,
  roadFid,
  wardId,
  junctions = [],
  roads = [],
}) {
  const [selectedJunction, setSelectedJunction] = useState(null);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [mapType, setMapType] = useState(null);

  useEffect(() => {
    if (!junctions || !roads) return;

    const junction = junctionFid
      ? junctions.find((j) => j && j.fid === junctionFid)
      : null;
    const road = roadFid
      ? roads.find((r) => r && r.fid === roadFid)
      : null;

    setSelectedJunction(junction || null);
    setSelectedRoad(road || null);

    if (junction) setMapType("junction");
    else if (road) setMapType("road");
    else setMapType(null);
  }, [junctionFid, roadFid, junctions, roads]);

  const renderMap = () => {
    if (mapType === "junction") {
      return (
        <JunctionMap
          junctions={junctions}
          selectedJunction={selectedJunction}
          onJunctionSelect={null} // ❌ disable clicks
          center={[19.076, 72.8777]}
          zoom={12}
          wardId={wardId}
          showBoundary={false}
        />
      );
    }

    if (mapType === "road") {
      return (
        <RoadMap
          roads={roads}
          selectedRoad={selectedRoad}
          onRoadSelect={null}
          center={[19.076, 72.8777]}
          zoom={14}
          wardId={wardId}
          showBoundary={false}
        />
      );
    }

    // ✅ If both FIDs are null — still show base map (empty boundary view)
    return (
      <div className={styles.noLocationData}>
        <p>No location data available for this project</p>
        <p className={styles.debugInfo}>
          Junction FID: {junctionFid || "None"}, Road FID: {roadFid || "None"}
        </p>
      </div>
    );
  };

  return (
    <div className={styles.projectLocationMap}>
      <div className={styles.mapHeader}>
        {mapType && (
          <span className={styles.mapTypeBadge}>
            {mapType === "junction" ? "Junction" : "Road"}
          </span>
        )}
        {selectedJunction && (
          <span>{selectedJunction.name || `Junction ID: ${selectedJunction.fid}`}</span>
        )}
        {selectedRoad && (
          <span>{selectedRoad.name || `Road ID: ${selectedRoad.fid}`}</span>
        )}
      </div>
      <div className={styles.mapContainer}>{renderMap()}</div>
    </div>
  );
}
