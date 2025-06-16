'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../../../styles/layout/junction.module.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

export default function JunctionMap({ 
  junctions, 
  selectedJunction, 
  onJunctionSelect,
  center = [19.0760, 72.8777],
  zoom = 12
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const initializedRef = useRef(false);

  // Initialize map only once
  useEffect(() => {
    if (initializedRef.current || !mapRef.current) return;

    initializedRef.current = true;
    mapInstance.current = L.map(mapRef.current, {
      renderer: L.svg(),
      zoomControl: false
    }).setView(center, zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);

    L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      initializedRef.current = false;
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapInstance.current || !junctions) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker && mapInstance.current.hasLayer(marker)) {
        marker.remove();
      }
    });
    markersRef.current = [];

    if (junctions.length === 0) return;

    const markers = [];
    const bounds = [];

    junctions.forEach(junction => {
      const lat = junction.latitude || center[0];
      const lng = junction.longitude || center[1];

      if (isNaN(lat) || isNaN(lng)) return;

      const marker = L.marker([lat, lng], {
        opacity: selectedJunction?.fid === junction.fid ? 1 : 0.7
      })
        .addTo(mapInstance.current)
        .bindPopup(`
          <div class="popup-content">
            <strong>FID:</strong> ${junction.fid}<br>
            <strong>Coordinates:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}
          </div>
        `)
        .on('click', () => {
          onJunctionSelect(junction);
          mapInstance.current.flyTo([lat, lng], 16, {
            animate: true,
            duration: 1
          });
        });

      markers.push(marker);
      bounds.push([lat, lng]);
    });

    markersRef.current = markers;

    if (bounds.length > 0) {
      try {
        mapInstance.current.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 15
        });
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }
  }, [junctions, selectedJunction, center]);

  // Handle selected junction change
  useEffect(() => {
    if (!mapInstance.current || !selectedJunction) return;

    const lat = selectedJunction.latitude;
    const lng = selectedJunction.longitude;

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      try {
        mapInstance.current.flyTo([lat, lng], 17, {
          animate: true,
          duration: 1
        });
      } catch (e) {
        console.error('Error flying to location:', e);
      }
    }
  }, [selectedJunction]);

  return <div ref={mapRef} className={styles.mapContainer} />;
}