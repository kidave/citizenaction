"use client";

import { useEffect, useRef } from "react";
import BaseMap from "components/shared/maps/Basemap";
import GeoJSONLayer from "components/shared/maps/GeoJSONLayer";
import WardBoundaryLayer from "components/shared/maps/WardBoundaryLayer";
import { useWard } from "context/WardContext";
import styles from "styles/layout/road.module.css";
import L from "leaflet";

export default function RoadMap({
  roads,
  selectedRoad,
  onRoadSelect,
  center = [19.076, 72.8777],
  zoom = 12,
}) {
  const mapRef = useRef(null);
  const { wardId } = useWard();
  const roadLayersRef = useRef({});

  const getPopupContent = (road) => `
    <div class="popup-content">
      <strong>Name:</strong> ${road.name || "Unnamed"}<br>
      <strong>Type:</strong> ${road.fclass}<br>
      <strong>Length:</strong> ${road.total_length_kilometers?.toFixed(2) || "0"} km
    </div>
  `;

  // Fly to selected road
  useEffect(() => {
    if (!mapRef.current || !selectedRoad || !selectedRoad.geometry) return;

    try {
      const geoJSON = typeof selectedRoad.geometry === "string"
        ? JSON.parse(selectedRoad.geometry)
        : selectedRoad.geometry;

      const layer = L.geoJSON(geoJSON);
      const bounds = layer.getBounds();

      mapRef.current.flyToBounds(bounds, {
        padding: [50, 50],
        duration: 1,
        maxZoom: 17,
      });

      // Highlight selected road
      Object.values(roadLayersRef.current).forEach((layer) => {
        if (layer) {
          const isSelected = layer.feature?.properties?.fid === selectedRoad.fid;
          layer.setStyle({
            weight: isSelected ? 8 : 3,
            opacity: isSelected ? 0.9 : 0.5,
          });
          if (isSelected) layer.bringToFront();
        }
      });
    } catch (e) {
      console.error("Error flying to road:", e);
    }
  }, [selectedRoad]);

  return (
    <div className={styles.mapContainer}>
      <BaseMap
        center={center}
        zoom={zoom}
        onMapInit={(map) => {
          mapRef.current = map;
        }}
      >
        {/* Ward Boundary Layer */}
        <WardBoundaryLayer map={mapRef.current} wardId={wardId} />
        
        {/* Road Layers */}
        {roads.map((road) => {
          if (!road.geometry) return null;

          let geoJSON;
          try {
            geoJSON = typeof road.geometry === "string"
              ? JSON.parse(road.geometry)
              : road.geometry;
          } catch (e) {
            return null;
          }

          return (
            <GeoJSONLayer
              key={road.fid}
              map={mapRef.current}
              geojson={geoJSON}
              styleOptions={{ fclass: road.fclass }}
              popupContent={getPopupContent(road)}
              onClick={() => onRoadSelect(road)}
              selected={selectedRoad?.fid === road.fid}
              onLayerCreated={(layer) => {
                roadLayersRef.current[road.fid] = layer;
                layer.feature = { properties: { fid: road.fid } };
              }}
            />
          );
        })}
      </BaseMap>
    </div>
  );
}