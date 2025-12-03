// components/shared/maps/MapillaryMarker.js
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { MAPILLARY_CATEGORIES } from "config/mapillaryCategories";

// Mapillary icon mapping - using official Mapillary sprite icons
const MAPILLARY_ICONS = {
  // Using Font Awesome icons as fallback, you can replace with actual Mapillary SVG icons
  "object--manhole": "🕳️",
  "object--junction-box": "📦",
  "object--fire-hydrant": "🚒",
  "object--cctv-camera": "📸",
  "object--catch-basin": "🕳️",
  "object--street-light": "💡",
  "object--support--pole": "📍",
  "object--support--traffic-sign-frame": "🚧",
  "object--support--utility-pole": "🪜",
  "object--water-valve": "🚰",
  // Default
  "default": "📍"
};

// Get professional icon from Mapillary sprite
function getMapillaryIconUrl(objectValue) {
  // You can use actual Mapillary sprite URLs here
  // For now, using emoji as placeholders
  const iconMapping = {
    "object--manhole": "https://raw.githubusercontent.com/mapillary/mapillary_sprite_source/main/sprites/object--manhole.svg",
    "object--junction-box": "https://raw.githubusercontent.com/mapillary/mapillary_sprite_source/main/sprites/object--junction-box.svg",
    "object--fire-hydrant": "https://raw.githubusercontent.com/mapillary/mapillary_sprite_source/main/sprites/object--fire-hydrant.svg",
    "object--cctv-camera": "https://raw.githubusercontent.com/mapillary/mapillary_sprite_source/main/sprites/object--cctv-camera.svg",
    "object--catch-basin": "https://raw.githubusercontent.com/mapillary/mapillary_sprite_source/main/sprites/object--catch-basin.svg",
    "object--street-light": "https://raw.githubusercontent.com/mapillary/mapillary_sprite_source/main/sprites/object--street-light.svg",
    "object--support--pole": "https://raw.githubusercontent.com/mapillary/mapillary_sprite_source/main/sprites/object--support--pole.svg",
    "object--support--traffic-sign-frame": "https://raw.githubusercontent.com/mapillary/mapillary_sprite_source/main/sprites/object--support--traffic-sign-frame.svg",
    "object--support--utility-pole": "https://raw.githubusercontent.com/mapillary/mapillary_sprite_source/main/sprites/object--support--utility-pole.svg",
    "object--water-valve": "https://raw.githubusercontent.com/mapillary/mapillary_sprite_source/main/sprites/object--water-valve.svg",
  };
  
  return iconMapping[objectValue] || null;
}

export default function MapillaryMarker({
  map,
  position,
  icon,
  objectValue,
  featureId,
  onClick,
  isSelected = false,
  popupContent,
}) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position) return;

    const [lat, lng] = position;
    if (isNaN(lat) || isNaN(lng)) return;

    // Try to get professional icon URL
    const iconUrl = getMapillaryIconUrl(objectValue);
    
    let markerIcon;
    
    if (iconUrl) {
      // Use SVG icon from Mapillary
      markerIcon = L.divIcon({
        className: 'mapillary-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: url('${iconUrl}') no-repeat center;
            background-size: contain;
            filter: ${isSelected ? 'drop-shadow(0 0 8px rgba(255, 68, 68, 0.8))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'};
            transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
            transition: all 0.2s ease;
          "></div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    } else {
      // Fallback to emoji icon
      const category = Object.values(MAPILLARY_CATEGORIES).find(cat => 
        cat.values.includes(objectValue)
      );
      const displayIcon = icon || category?.icon || "📍";
      const color = category?.color || "#3388ff";
      
      markerIcon = L.divIcon({
        className: 'mapillary-marker-fallback',
        html: `
          <div style="
            background-color: ${isSelected ? '#ff4444' : color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: white;
            transition: all 0.2s ease;
          ">
            ${displayIcon}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    }

    // Create marker
    markerRef.current = L.marker([lat, lng], { icon: markerIcon });

    // Add popup if provided
    if (popupContent) {
      markerRef.current.bindPopup(`
        <div style="padding: 8px; font-family: system-ui, sans-serif; max-width: 200px;">
          ${popupContent}
        </div>
      `);
    } else {
      // Default popup
      const category = Object.values(MAPILLARY_CATEGORIES).find(cat => 
        cat.values.includes(objectValue)
      );
      const label = category?.label || objectValue;
      
      markerRef.current.bindPopup(`
        <div style="padding: 8px; font-family: system-ui, sans-serif; max-width: 200px;">
          <strong>${label}</strong><br/>
          ID: ${featureId}<br/>
          Type: ${objectValue}
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
  }, [map, position, icon, objectValue, featureId, onClick, isSelected, popupContent]);

  return null;
}