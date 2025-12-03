// components/shared/maps/UnifiedWardMap.js
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import MapContainer from "components/shared/maps/MapContainer";
import BoundaryLayer from "components/shared/maps/BoundaryLayer";
import GeoJSONLayer from "components/shared/maps/GeoJSONLayer";
import CustomMarker from "components/shared/maps/CustomMarker";
import MapillaryMarker from "components/shared/maps/MapillaryMarker"; // New component
import { useWardRoads, useWardJunctions, useWardBoundary } from "hooks/useWardData";
import { useWardMapillary } from "hooks/useWardMapillary";
import L from "leaflet";
import styles from "./styles/map.module.css";
import { MAPILLARY_CATEGORIES } from "config/mapillaryCategories";

// Simple grid-based clustering
function clusterFeatures(features, gridSize = 0.0009) {
  const map = new Map();
  for (const f of features) {
    const lon = (f.metadata?.geometry?.coordinates?.[0] ?? 0);
    const lat = (f.metadata?.geometry?.coordinates?.[1] ?? 0);
    if (!lon || !lat) continue;
    const keyX = Math.round(lon / gridSize);
    const keyY = Math.round(lat / gridSize);
    const key = `${keyX}_${keyY}`;
    if (!map.has(key)) map.set(key, { lonSum: 0, latSum: 0, count: 0, items: [] });
    const obj = map.get(key);
    obj.lonSum += lon;
    obj.latSum += lat;
    obj.count += 1;
    obj.items.push(f);
  }
  const clusters = [];
  for (const [k, v] of map.entries()) {
    clusters.push({
      lon: v.lonSum / v.count,
      lat: v.latSum / v.count,
      count: v.count,
      items: v.items,
    });
  }
  return clusters;
}

export default function UnifiedWardMap({ 
  wardCode, 
  activeLayers = {
    roads: true,
    junctions: true,
    mapillary: true
  },
  mapillaryFilters = [],
  selectedItem = null,
  onSelectItem = () => {},
  center = [19.076, 72.8777],
  zoom = 12
}) {
  const mapRef = useRef(null);
  const { data: roads } = useWardRoads(wardCode);
  const { data: junctions } = useWardJunctions(wardCode);
  const { data: boundary } = useWardBoundary(wardCode);
  const { data: mapillaryFeatures = [] } = useWardMapillary(wardCode, { 
    objectTypes: mapillaryFilters 
  });

  const [mapReady, setMapReady] = useState(false);
  const [clusteredFeatures, setClusteredFeatures] = useState([]);

  // Recompute clusters when features change
  useEffect(() => {
    if (mapillaryFeatures && mapillaryFeatures.length > 0) {
      setClusteredFeatures(clusterFeatures(mapillaryFeatures));
    } else {
      setClusteredFeatures([]);
    }
  }, [mapillaryFeatures]);

  // Fly to selected item
  useEffect(() => {
    if (!mapRef.current || !selectedItem || !mapReady) return;

    try {
      let bounds;
      
      if (selectedItem.type === 'road' && selectedItem.geometry) {
        const geom = typeof selectedItem.geometry === 'string' 
          ? JSON.parse(selectedItem.geometry) 
          : selectedItem.geometry;
        const layer = L.geoJSON(geom);
        bounds = layer.getBounds();
      } 
      else if (selectedItem.type === 'junction' && selectedItem.latitude && selectedItem.longitude) {
        bounds = L.latLngBounds([
          [selectedItem.latitude, selectedItem.longitude],
          [selectedItem.latitude, selectedItem.longitude]
        ]);
      }
      else if (selectedItem.type === 'mapillary' && selectedItem.metadata?.geometry) {
        const [lon, lat] = selectedItem.metadata.geometry.coordinates;
        bounds = L.latLngBounds([[lat, lon], [lat, lon]]);
      }

      if (bounds && bounds.isValid()) {
        mapRef.current.flyToBounds(bounds, { 
          padding: [40, 40], 
          duration: 0.8,
          maxZoom: selectedItem.type === 'junction' ? 17 : 15
        });
      }
    } catch (e) {
      console.error("Error flying to selected item:", e);
    }
  }, [selectedItem, mapReady]);

  const onMapInit = (map) => {
    mapRef.current = map;
    setMapReady(true);
  };

  const handleRoadClick = (road) => {
    onSelectItem({ ...road, type: 'road' });
  };

  const handleJunctionClick = (junction) => {
    onSelectItem({ ...junction, type: 'junction' });
  };

  const handleMapillaryClick = (feature) => {
    onSelectItem({ ...feature, type: 'mapillary' });
  };

  const handleClusterClick = (cluster) => {
    if (cluster.count === 1) {
      handleMapillaryClick(cluster.items[0]);
    } else {
      // Zoom to cluster
      if (mapRef.current) {
        mapRef.current.flyTo([cluster.lat, cluster.lon], 
          Math.min(mapRef.current.getZoom() + 2, 18), 
          { duration: 0.6 }
        );
      }
    }
  };

  // Get Mapillary icon for feature
  const getMapillaryIcon = (objectValue) => {
    const category = Object.values(MAPILLARY_CATEGORIES).find(cat => 
      cat.values.includes(objectValue)
    );
    return category?.icon || "📍";
  };

  return (
    <div className={styles.mapWrap}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        onMapInit={onMapInit}
      >
        {/* Ward boundary - always visible */}
        {mapReady && boundary && (
          <BoundaryLayer map={mapRef.current} boundary={boundary} wardCode={wardCode} />
        )}

        {/* Roads layer */}
        {mapReady && activeLayers.roads && roads?.map((road) => {
          const geom = typeof road.geometry === 'string' 
            ? JSON.parse(road.geometry) 
            : road.geometry;
          if (!geom) return null;
          
          const isSelected = selectedItem?.type === 'road' && selectedItem?.fid === road.fid;
          
          return (
            <GeoJSONLayer
              key={`road-${road.fid}`}
              map={mapRef.current}
              geojson={geom}
              styleOptions={{ 
                color: isSelected ? "#ff5722" : "#2D6CDF", 
                weight: isSelected ? 4 : 2, 
                opacity: 0.9 
              }}
              popupContent={`<strong>${road.name || "Unnamed"}</strong><br/>Length: ${road.total_length_kilometers?.toFixed(2) || "0"} km`}
              onClick={() => handleRoadClick(road)}
              selected={isSelected}
            />
          );
        })}

        {/* Junctions layer */}
        {mapReady && activeLayers.junctions && junctions?.map(junction => {
          if (!junction.latitude || !junction.longitude) return null;
          
          const isSelected = selectedItem?.type === 'junction' && selectedItem?.fid === junction.fid;
          
          return (
            <CustomMarker
              key={`junction-${junction.fid}`}
              map={mapRef.current}
              position={[junction.latitude, junction.longitude]}
              popupContent={`<strong>${junction.name || "Junction"}</strong>`}
              onClick={() => handleJunctionClick(junction)}
              isSelected={isSelected}
            />
          );
        })}

        {/* Mapillary features layer - Using Mapillary icons */}
        {mapReady && activeLayers.mapillary && clusteredFeatures.map((cluster, idx) => {
          if (cluster.count === 1) {
            const feature = cluster.items[0];
            const [lon, lat] = feature.metadata?.geometry?.coordinates ?? [0, 0];
            const isSelected = selectedItem?.type === 'mapillary' && selectedItem?.id === feature.id;
            
            // Get icon from MAPILLARY_CATEGORIES
            const icon = getMapillaryIcon(feature.object_value);
            
            return (
              <MapillaryMarker
                key={`feature-${feature.id}`}
                map={mapRef.current}
                position={[lat, lon]}
                icon={icon}
                objectValue={feature.object_value}
                featureId={feature.id}
                onClick={() => handleMapillaryClick(feature)}
                isSelected={isSelected}
              />
            );
          } else {
            // For clusters, use a different color
            return (
              <CustomMarker
                key={`cluster-${idx}`}
                map={mapRef.current}
                position={[cluster.lat, cluster.lon]}
                popupContent={`<strong>${cluster.count} features</strong><br/>Click to zoom in`}
                onClick={() => handleClusterClick(cluster)}
                isSelected={false}
              />
            );
          }
        })}
      </MapContainer>
    </div>
  );
}