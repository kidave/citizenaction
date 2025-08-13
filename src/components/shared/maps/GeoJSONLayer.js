// components/shared/maps/GeoJSONLayer.js
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { transformGeoJSON } from "./utils/coordinateUtils";
import { getRoadStyle } from "./utils/layerStyles";

export default function GeoJSONLayer({
  map,
  geojson,
  styleOptions = {},
  popupContent,
  onClick,
  selected = false,
  onLayerCreated,
}) {
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !geojson) return;

    try {
      const processedGeoJSON = transformGeoJSON(geojson);
      if (!processedGeoJSON) return;

      const style = getRoadStyle(styleOptions, selected);

      layerRef.current = L.geoJSON(processedGeoJSON, {
        style: () => style,
        onEachFeature: (feature, layer) => {
          if (popupContent) {
            layer.bindPopup(() => popupContent);
          }
          if (onClick) {
            layer.on("click", (e) => onClick(e));
          }
        },
      }).addTo(map);

      // Call the callback if provided
      if (onLayerCreated) {
        onLayerCreated(layerRef.current);
      }

      return () => {
        if (layerRef.current) {
          layerRef.current.remove();
        }
      };
    } catch (e) {
      console.error("Error creating GeoJSON layer:", e);
    }
  }, [
    map,
    geojson,
    styleOptions,
    popupContent,
    onClick,
    selected,
    onLayerCreated,
  ]);

  return null;
}
