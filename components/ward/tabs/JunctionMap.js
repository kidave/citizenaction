'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import BaseMap from '../../shared/maps/Basemap';
import MapControls from '../../shared/maps/MapControls';
import styles from '../../../styles/layout/junction.module.css';
import { transformCoordinates } from '../../shared/maps/utils/coordinateUtils';

export default function JunctionMap({ 
  junctions, 
  selectedJunction, 
  onJunctionSelect,
  center = [19.0760, 72.8777],
  zoom = 12
}) {
  const [currentLayer, setCurrentLayer] = useState('osm');
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Handle selected junction change
  useEffect(() => {
    if (!mapRef.current || !selectedJunction) return;

    const flyToMarker = () => {
      let lat = selectedJunction.latitude;
      let lng = selectedJunction.longitude;

      // Transform coordinates if needed
      [lng, lat] = transformCoordinates([lng, lat]);

      if (isNaN(lat) || isNaN(lng)) return;

      // Fly to the selected junction with padding
      mapRef.current.flyTo([lat, lng], 17, {
        animate: true,
        duration: 2,
        padding: [50, 50]
      });

      // Find and highlight the selected marker
      markersRef.current.forEach(marker => {
        if (marker) {
          const markerPos = marker.getLatLng();
          const isSelected = (
            markerPos.lat.toFixed(6) === lat.toFixed(6) && 
            markerPos.lng.toFixed(6) === lng.toFixed(6)
          );
          
          marker.setOpacity(isSelected ? 1 : 0.7);
          if (isSelected) marker.openPopup();
        }
      });
    };

    // Small delay to ensure map is ready
    const timer = setTimeout(flyToMarker, 50);
    return () => clearTimeout(timer);
  }, [selectedJunction]);

  // Initialize markers
  useEffect(() => {
    if (!mapRef.current || !junctions) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker?.remove());
    markersRef.current = [];

    if (junctions.length === 0) return;

    const newMarkers = junctions.map(junction => {
      let lat = junction.latitude || center[0];
      let lng = junction.longitude || center[1];

      // Transform coordinates if needed
      [lng, lat] = transformCoordinates([lng, lat]);

      if (isNaN(lat) || isNaN(lng)) return null;

      const marker = L.marker([lat, lng], {
        opacity: selectedJunction?.fid === junction.fid ? 1 : 0.7,
        riseOnHover: true
      });

      

      marker.on('click', () => {
        onJunctionSelect(junction);
        mapRef.current.flyTo([lat, lng], 17, {
          animate: true,
          duration: 2
        });
      });

      marker.addTo(mapRef.current);
      return marker;
    }).filter(Boolean);

    markersRef.current = newMarkers;

    // Fit bounds to all markers
    if (newMarkers.length > 0) {
      try {
        const group = L.featureGroup(newMarkers);
        mapRef.current.fitBounds(group.getBounds(), {
          padding: [50, 50],
          maxZoom: 15
        });
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }

    return () => newMarkers.forEach(marker => marker?.remove());
  }, [junctions, center, onJunctionSelect, selectedJunction]);

  return (
    <BaseMap 
      center={center} 
      zoom={zoom}
      onMapInit={(map) => { 
        mapRef.current = map;
        // Ensure proper initialization
        setTimeout(() => mapRef.current?.invalidateSize(), 100);
      }}
    >
      <div className={styles.map} />
      <MapControls 
        currentLayer={currentLayer}
        onLayerChange={setCurrentLayer}
      />
    </BaseMap>
  );
}