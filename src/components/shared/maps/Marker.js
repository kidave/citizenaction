// components/shared/maps/Marker.js
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { transformCoordinates } from "./utils/coordinateUtils";

export default function Marker({
  map,
  position,
  popupContent,
  onClick,
  opacity = 1,
  riseOnHover = true,
}) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position) return;

    const [lat, lng] = transformCoordinates(position);
    if (isNaN(lat) || isNaN(lng)) return;

    markerRef.current = L.marker([lat, lng], {
      opacity,
      riseOnHover,
    });

    if (popupContent) {
      markerRef.current.bindPopup(popupContent);
    }

    if (onClick) {
      markerRef.current.on("click", onClick);
    }

    markerRef.current.addTo(map);

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map, position, popupContent, onClick, opacity, riseOnHover]);

  return null;
}
