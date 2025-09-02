// components/shared/maps/WardBoundaryLayer.js
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import useWardBoundary from "hooks/useWardBoundary";
import { transformGeoJSON } from "./utils/coordinateUtils";

export default function WardBoundaryLayer({ map, wardId }) {
  const layerRef = useRef(null);
  const { boundary, loading, error } = useWardBoundary(wardId);

  useEffect(() => {
    if (!map || !boundary?.geom) return;

    try {
      // Process boundary data
      const geom = typeof boundary.geom === 'string' 
        ? JSON.parse(boundary.geom) 
        : boundary.geom;
      
      const processedGeoJSON = transformGeoJSON(geom);
      if (!processedGeoJSON) return;

      // Create boundary layer
      layerRef.current = L.geoJSON(processedGeoJSON, {
        style: {
          color: "#FDC700",
          weight: 3,
          opacity: 1,
          fillOpacity: 0.1,
          fillColor: "#FDC700",
        }
      }).addTo(map);

      // Bring boundary to back
      layerRef.current.bringToBack();

    } catch (e) {
      console.error("Error creating boundary layer:", e);
    }

    return () => {
      if (layerRef.current) {
        layerRef.current.remove();
      }
    };
  }, [map, boundary]);

  return null;
}