// components/shared/maps/Basemap.js
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./styles/map.module.css";
import { tileLayers } from "./utils/layerStyles";
import { setupLeafletIcons, transformGeoJSON } from "./utils/coordinateUtils";
import { useWardBoundary } from "hooks/useWardData";

export default function BaseMap({
  center = [19.076, 72.8777],
  zoom = 12,
  children,
  onMapInit,
  className = "",
  wardId,
  autoZoomToBoundary = true,
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const initializedRef = useRef(false);
  const [currentLayer, setCurrentLayer] = useState("osm");
  const tileLayerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const boundaryLayerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Use the ward boundary hook
  const { data: boundary, loading: boundaryLoading } = useWardBoundary(wardId);

  // Debug boundary data
  useEffect(() => {
    console.log("🔍 BaseMap Boundary Debug:");
    console.log("Ward ID:", wardId);
    console.log("Boundary Data:", boundary);
    console.log("Boundary Loading:", boundaryLoading);
    console.log("Boundary Type:", typeof boundary);
    console.log("Is Array:", Array.isArray(boundary));
    
    if (boundary) {
      if (Array.isArray(boundary)) {
        console.log("Array length:", boundary.length);
        boundary.forEach((item, index) => {
          console.log(`Item ${index}:`, item);
          console.log(`Item ${index} geom:`, item?.geom);
        });
      } else {
        console.log("Boundary geom:", boundary.geom);
        console.log("Boundary geom type:", typeof boundary.geom);
      }
    }
  }, [boundary, wardId, boundaryLoading]);

  // Process boundary data
  const processBoundary = useCallback((boundaryData) => {
    console.log("🔄 Processing boundary data:", boundaryData);
    
    if (!boundaryData) {
      console.log("❌ No boundary data provided");
      return null;
    }

    try {
      // Handle array data (common from Supabase queries)
      let geomData = boundaryData;
      if (Array.isArray(boundaryData) && boundaryData.length > 0) {
        geomData = boundaryData[0];
        console.log("📦 Using first item from array:", geomData);
      }
      
      // Extract geometry
      const geometry = geomData?.geom || geomData;
      if (!geometry) {
        console.log("❌ No geometry found in boundary data");
        return null;
      }

      console.log("📐 Raw geometry:", geometry);
      console.log("📐 Geometry type:", typeof geometry);

      // Handle stringified GeoJSON
      const parsedGeometry = typeof geometry === 'string' 
        ? JSON.parse(geometry) 
        : geometry;

      console.log("📐 Parsed geometry:", parsedGeometry);

      // Validate GeoJSON structure
      if (!parsedGeometry.type || !parsedGeometry.coordinates) {
        console.error("❌ Invalid GeoJSON structure:", parsedGeometry);
        return null;
      }

      const transformedGeom = transformGeoJSON(parsedGeometry);
      console.log("✅ Transformed geometry:", transformedGeom);
      
      return transformedGeom;
    } catch (error) {
      console.error("❌ Error processing boundary geometry:", error);
      return null;
    }
  }, []);

  // Safe fit bounds function
  const safeFitBounds = useCallback((bounds, options = {}) => {
    if (!mapInstance.current || !isMountedRef.current || mapInstance.current._stopped) {
      console.log("🚫 Cannot fit bounds - map not ready");
      return;
    }

    try {
      if (bounds && bounds.isValid && bounds.isValid()) {
        console.log("🎯 Fitting to bounds:", bounds);
        setTimeout(() => {
          if (mapInstance.current && isMountedRef.current && !mapInstance.current._stopped) {
            mapInstance.current.fitBounds(bounds, {
              padding: [20, 20],
              maxZoom: 15,
              animate: false,
              ...options
            });
            console.log("✅ Successfully fit to bounds");
          }
        }, 100);
      } else {
        console.log("❌ Invalid bounds:", bounds);
      }
    } catch (error) {
      console.error("❌ Error fitting bounds:", error);
    }
  }, []);

  // Update boundary layer
  const updateBoundaryLayer = useCallback(() => {
    console.log("🔄 Updating boundary layer for ward:", wardId);
    
    if (!mapInstance.current || !isMountedRef.current) {
      console.log("🚫 Map not ready for boundary update");
      return;
    }

    // Clear existing boundary layer
    if (boundaryLayerRef.current) {
      try {
        console.log("🧹 Clearing existing boundary layer");
        mapInstance.current.removeLayer(boundaryLayerRef.current);
      } catch (e) {
        console.log("⚠️ Error clearing boundary layer:", e);
      }
      boundaryLayerRef.current = null;
    }

    // Process and add new boundary
    const processedBoundary = processBoundary(boundary);
    if (processedBoundary) {
      try {
        console.log("🎨 Creating new boundary layer");
        boundaryLayerRef.current = L.geoJSON(processedBoundary, {
          style: {
            color: "#FFFF00", // Yellow for high visibility
            weight: 3, // Thin border
            opacity: 0.8,
            fillOpacity: 0.3,
            fillColor: "#FFFF00", // Yellow fill
          },
        }).addTo(mapInstance.current);

        // Bring boundary to back
        boundaryLayerRef.current.bringToBack();

        console.log("✅ Boundary layer created successfully");

        // Auto-zoom to boundary if enabled
        if (autoZoomToBoundary && isMountedRef.current) {
          console.log("🔍 Getting bounds for auto-zoom");
          const bounds = boundaryLayerRef.current.getBounds();
          safeFitBounds(bounds);
        }

      } catch (error) {
        console.error("❌ Error adding boundary layer:", error);
      }
    } else {
      console.log("❌ No processed boundary to display");
    }
  }, [boundary, wardId, processBoundary, autoZoomToBoundary, safeFitBounds]);

  // Initialize map
  useEffect(() => {
    if (initializedRef.current || !mapRef.current) return;

    console.log("🗺️ Initializing BaseMap");
    setupLeafletIcons();
    initializedRef.current = true;
    isMountedRef.current = true;

    // Initialize map instance
    mapInstance.current = L.map(mapRef.current, {
      renderer: L.svg(),
      zoomControl: false,
    }).setView(center, zoom);

    // Add base tile layer
    tileLayerRef.current = L.tileLayer(tileLayers[currentLayer].url, {
      attribution: tileLayers[currentLayer].attribution,
    }).addTo(mapInstance.current);

    // Add layer controls
    const baseLayers = Object.entries(tileLayers).reduce(
      (acc, [key, layer]) => {
        acc[layer.name] = L.tileLayer(layer.url, {
          attribution: layer.attribution,
        });
        return acc;
      },
      {},
    );

    L.control
      .layers(baseLayers, null, {
        position: "topright",
      })
      .addTo(mapInstance.current);

    L.control
      .zoom({
        position: "topright",
      })
      .addTo(mapInstance.current);

    console.log("✅ BaseMap initialized");

    // Add boundary if available
    if (wardId && !boundaryLoading && boundary) {
      console.log("🚀 Initial boundary load for ward:", wardId);
      updateBoundaryLayer();
    }

    // Callback for parent component
    if (onMapInit) {
      onMapInit(mapInstance.current);
    }

    // Set up resize observer
    resizeObserverRef.current = new ResizeObserver(() => {
      if (mapInstance.current && mapRef.current && isMountedRef.current) {
        const id = setTimeout(() => {
          if (mapInstance.current && isMountedRef.current) {
            try {
              mapInstance.current.invalidateSize({
                pan: false,
                debounceMoveend: true,
              });
            } catch (error) {
              console.error("Error invalidating map size:", error);
            }
          }
        }, 100);
        return () => clearTimeout(id);
      }
    });

    resizeObserverRef.current.observe(mapRef.current);

    return () => {
      console.log("🧹 Cleaning up BaseMap");
      isMountedRef.current = false;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (mapInstance.current) {
        try {
          mapInstance.current._stopped = true;
          mapInstance.current.off();
          mapInstance.current.remove();
        } catch (e) {
          console.error("Error cleaning up map:", e);
        }
        mapInstance.current = null;
      }
      initializedRef.current = false;
    };
  }, []);

  // Update boundary when wardId or boundary data changes
  useEffect(() => {
    if (initializedRef.current && isMountedRef.current && !boundaryLoading) {
      console.log("🔄 Boundary data changed, updating layer");
      updateBoundaryLayer();
    }
  }, [boundary, wardId, boundaryLoading, updateBoundaryLayer]);

  // Update tile layer when currentLayer changes
  useEffect(() => {
    if (!mapInstance.current || !tileLayerRef.current || !isMountedRef.current) return;

    try {
      mapInstance.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = L.tileLayer(tileLayers[currentLayer].url, {
        attribution: tileLayers[currentLayer].attribution,
      }).addTo(mapInstance.current);
    } catch (error) {
      console.error("Error updating tile layer:", error);
    }
  }, [currentLayer]);

  return (
    <div className={`${styles.mapContainer} ${className}`} ref={mapRef}>
      {children}
    </div>
  );
}