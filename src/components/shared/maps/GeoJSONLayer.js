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
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cleanup layer on unmount
      if (layerRef.current) {
        try {
          layerRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        layerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Check if map is valid and ready
    if (!map || !map.addLayer || !geojson || !isMountedRef.current) {
      console.log("GeoJSONLayer: Map not ready or no geojson", { 
        mapReady: !!map, 
        hasAddLayer: map?.addLayer, 
        hasGeojson: !!geojson,
        isMounted: isMountedRef.current 
      });
      return;
    }

    try {
      const processedGeoJSON = transformGeoJSON(geojson);
      if (!processedGeoJSON || !isMountedRef.current) {
        console.log("GeoJSONLayer: No processed GeoJSON");
        return;
      }

      const style = getRoadStyle(styleOptions, selected);

      console.log("GeoJSONLayer: Creating layer");
      layerRef.current = L.geoJSON(processedGeoJSON, {
        style: () => style,
        onEachFeature: (feature, layer) => {
          if (popupContent && isMountedRef.current) {
            layer.bindPopup(() => popupContent);
          }
          if (onClick && isMountedRef.current) {
            layer.on("click", (e) => {
              if (isMountedRef.current) onClick(e);
            });
          }
        },
      });

      // Safely add to map with additional checks
      if (map && map.addLayer && isMountedRef.current) {
        try {
          layerRef.current.addTo(map);
          console.log("GeoJSONLayer: Layer successfully added to map");
        } catch (addError) {
          console.error("GeoJSONLayer: Error adding layer to map:", addError);
          return;
        }
      }

      // Call the callback if provided
      if (onLayerCreated && isMountedRef.current && layerRef.current) {
        onLayerCreated(layerRef.current);
      }

    } catch (e) {
      console.error("GeoJSONLayer: Error creating GeoJSON layer:", e);
    }

    return () => {
      if (layerRef.current && isMountedRef.current) {
        try {
          layerRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        layerRef.current = null;
      }
    };
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