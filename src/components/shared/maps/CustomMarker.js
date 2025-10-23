"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

export default function CustomMarker({
  map,
  position,
  isSelected = false,
  popupContent,
  onClick,
}) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position) return;

    const [lat, lng] = position;
    if (isNaN(lat) || isNaN(lng)) return;

    // Create custom circle icon
    const markerIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${isSelected ? '#ff4444' : '#3388ff'};
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        "></div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    // Create marker
    markerRef.current = L.marker([lat, lng], { icon: markerIcon });

    // Add popup if provided
    if (popupContent) {
      markerRef.current.bindPopup(`
        <div style="padding: 8px; font-family: system-ui, sans-serif; max-width: 200px;">
          ${popupContent}
        </div>
      `);
    }

    // Add click handler
    if (onClick) {
      markerRef.current.on("click", onClick);
    }

    // Add to map
    markerRef.current.addTo(map);

    return () => {
      // Cleanup
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map, position, popupContent, onClick, isSelected]);

  return null;
}