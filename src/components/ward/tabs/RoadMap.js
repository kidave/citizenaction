"use client";

import { useEffect, useRef, useState } from "react";
import MapContainer from "components/shared/maps/MapContainer";
import GeoJSONLayer from "components/shared/maps/GeoJSONLayer";
import BoundaryLayer from "components/shared/maps/BoundaryLayer";
import { useWardBoundary } from "hooks/useWardData";
import styles from "styles/tabs/road.module.css";
import L from "leaflet";

export default function RoadMap({
  roads,
  selectedRoad,
  onRoadSelect,
  center = [19.076, 72.8777],
  zoom = 12,
  wardId,
  showBoundary = true,
  zoomControl = true,
}) {
  const mapRef = useRef(null);
  const { data: boundary } = useWardBoundary(wardId);
  const roadLayersRef = useRef({});
  const isMountedRef = useRef(true);
  const [mapReady, setMapReady] = useState(false);

  const getPopupContent = (road) => `
    <div class="popup-content">
      <strong>Name:</strong> ${road.name || "Unnamed"}<br>
      <strong>Type:</strong> ${road.fclass}<br>
      <strong>Length:</strong> ${road.total_length_kilometers?.toFixed(2) || "0"} km
    </div>
  `;

  // Safe geometry parsing
  const parseGeometry = (geometry) => {
    if (!geometry) return null;
    
    try {
      if (typeof geometry === 'string') {
        if (geometry.trim().startsWith('{')) {
          return JSON.parse(geometry);
        }
      }
      return geometry;
    } catch (e) {
      console.error("Error parsing geometry:", e);
      return null;
    }
  };

  const handleMapInit = (map) => {
    mapRef.current = map;
    
    // ✅ Only disable zoom interactions, keep panning enabled
    if (!zoomControl) {
      mapRef.current.touchZoom.disable();
      mapRef.current.doubleClickZoom.disable();
      mapRef.current.scrollWheelZoom.disable();
      mapRef.current.boxZoom.disable();
    }
    
    setMapReady(true);
  };

  // Cleanup function
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      Object.values(roadLayersRef.current).forEach(layer => {
        if (layer && layer.remove) {
          try {
            layer.remove();
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      });
      roadLayersRef.current = {};
    };
  }, []);

  // Fly to selected road
  useEffect(() => {
    if (!mapRef.current || !selectedRoad || !isMountedRef.current) return;

    const geoJSON = parseGeometry(selectedRoad.geometry);
    if (!geoJSON) return;

    try {
      const layer = L.geoJSON(geoJSON);
      const bounds = layer.getBounds();

      if (bounds.isValid()) {
        mapRef.current.flyToBounds(bounds, {
          padding: [50, 50],
          duration: 1,
          maxZoom: 17,
        });
      }

      // ✅ REMOVED: The manual style setting - now handled by getRoadStyle in GeoJSONLayer
      // Just ensure selected road is brought to front
      Object.values(roadLayersRef.current).forEach((layer) => {
        if (layer && isMountedRef.current) {
          const isSelected = layer.feature?.properties?.fid === selectedRoad.fid;
          try {
            if (isSelected) {
              layer.bringToFront();
            }
          } catch (e) {
            // Ignore style setting errors
          }
        }
      });
    } catch (e) {
      console.error("Error flying to road:", e);
    }
  }, [selectedRoad]);

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={center}
        zoom={zoom}
        onMapInit={handleMapInit}
        zoomControl={zoomControl}
      >
        {/* Boundary Layer */}
        {showBoundary && boundary && (
          <BoundaryLayer
            map={mapRef.current}
            boundary={boundary}
            wardId={wardId}
          />
        )}

        {/* Road Layers */}
        {roads && roads.map((road) => {
          const geoJSON = parseGeometry(road.geometry);
          if (!geoJSON) return null;

          return (
            <GeoJSONLayer
              key={`${wardId}-${road.fid}`}
              map={mapRef.current}
              geojson={geoJSON}
              styleOptions={{ fclass: road.fclass }}
              popupContent={getPopupContent(road)}
              onClick={onRoadSelect ? () => isMountedRef.current && onRoadSelect(road) : null}
              selected={selectedRoad?.fid === road.fid}
              onLayerCreated={(layer) => {
                if (isMountedRef.current) {
                  roadLayersRef.current[road.fid] = layer;
                  layer.feature = { properties: { fid: road.fid } };
                  
                  // ✅ Bring selected road to front when layer is created
                  if (selectedRoad?.fid === road.fid) {
                    layer.bringToFront();
                  }
                }
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}