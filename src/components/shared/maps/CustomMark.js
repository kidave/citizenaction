// components/shared/maps/CustomMark.js
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

export default function CustomMark({ map, position, popupContent, onClick, icon, color = "#2D6CDF", isSelected = false, clusterCount = 0 }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !map.addLayer) return;
    // create a small DivIcon
    const html = clusterCount > 1
      ? `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:18px;background:${color};color:#fff;font-weight:700;border:2px solid #fff">${clusterCount}</div>`
      : `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:14px;background:${color};color:#fff;border:2px solid #fff">${icon || ""}</div>`;

    const iconObj = L.divIcon({
      html,
      className: 'custom-marker',
      iconSize: clusterCount > 1 ? [36,36] : [28,28],
      iconAnchor: [18, 18]
    });

    markerRef.current = L.marker(position, { icon: iconObj }).addTo(map);

    if (popupContent) markerRef.current.bindPopup(popupContent);

    if (onClick) markerRef.current.on("click", onClick);

    return () => {
      try { markerRef.current && map.removeLayer(markerRef.current); } catch (e) {}
    };
  }, [map, position, popupContent, onClick, icon, color, clusterCount]);

  return null;
}
