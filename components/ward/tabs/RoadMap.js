'use client';

import { useEffect, useRef } from 'react';
import BaseMap from '../../shared/maps/Basemap';
import GeoJSONLayer from '../../shared/maps/GeoJSONLayer';
import { useWard } from '../../../src/context/WardContext';
import styles from '../../../styles/layout/road.module.css';
import L from 'leaflet';

export default function RoadMap({ 
  roads, 
  selectedRoad, 
  onRoadSelect,
  center = [19.0760, 72.8777],
  zoom = 12
}) {
  const mapRef = useRef(null);
  const { boundary } = useWard();
  const roadLayersRef = useRef({});

  const getPopupContent = (road) => (`
    <div class="popup-content">
      <strong>Name:</strong> ${road.name || 'Unnamed'}<br>
      <strong>Type:</strong> ${road.fclass}<br>
      <strong>Category:</strong> ${road.layer_name}<br>
      <strong>Length:</strong> ${road.total_length_kilometers?.toFixed(2) || '0'} km<br>
      <strong>Segments:</strong> ${road.segments_count}
    </div>
  `);

  // Fly to selected road
  useEffect(() => {
    if (!mapRef.current || !selectedRoad || !selectedRoad.geometry) return;

    try {
      let geoJSON;
      try {
        geoJSON = typeof selectedRoad.geometry === 'string' 
          ? JSON.parse(selectedRoad.geometry) 
          : selectedRoad.geometry;
      } catch (e) {
        console.error('Failed to parse selected road geometry:', e);
        return;
      }

      // Create temporary layer to get bounds
      const layer = L.geoJSON(geoJSON);
      const bounds = layer.getBounds();
      
      // Fly to the road with animation
      mapRef.current.flyToBounds(bounds, {
        padding: [50, 50],
        duration: 1,
        easeLinearity: 0.25,
        maxZoom: 17
      });

      // Highlight the selected road
      Object.values(roadLayersRef.current).forEach(layer => {
        if (layer) {
          const isSelected = layer.feature?.properties?.fid === selectedRoad.fid;
          layer.setStyle({
            weight: isSelected ? 8 : 3,
            opacity: isSelected ? 0.9 : 0.5
          });
          if (isSelected) layer.bringToFront();
        }
      });

    } catch (e) {
      console.error('Error flying to road:', e);
    }
  }, [selectedRoad]);

  return (
    <div className={styles.mapContainer}>
      <BaseMap 
        center={center} 
        zoom={zoom}
        boundary={boundary}
        onMapInit={(map) => {
          mapRef.current = map;
          setTimeout(() => mapRef.current?.invalidateSize(), 100);
        }}
      >
        {roads.map(road => {
          if (!road.geometry) return null;
          
          let geoJSON;
          try {
            geoJSON = typeof road.geometry === 'string' 
              ? JSON.parse(road.geometry) 
              : road.geometry;
          } catch (e) {
            console.error('Failed to parse road geometry:', e);
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
                // Store reference to the layer
                roadLayersRef.current[road.fid] = layer;
                // Add feature properties for identification
                layer.feature = {
                  properties: {
                    fid: road.fid
                  }
                };
              }}
            />
          );
        })}
      </BaseMap>
    </div>
  );
}