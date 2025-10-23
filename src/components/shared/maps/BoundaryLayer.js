"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

export default function BoundaryLayer({
  map,
  boundary,
  wardId,
}) {
  const layerRef = useRef(null);

  useEffect(() => {
    console.log("🔄 BoundaryLayer: Received boundary data", { 
      mapReady: !!map, 
      boundary: boundary,
      wardId 
    });

    if (!map) {
      console.log("❌ BoundaryLayer: Map not ready");
      return;
    }

    if (!boundary) {
      console.log("❌ BoundaryLayer: No boundary data provided");
      // Remove existing layer if boundary is cleared
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    try {
      // Clear previous layer
      if (layerRef.current) {
        console.log("🧹 BoundaryLayer: Removing previous layer");
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }

      console.log("🎨 BoundaryLayer: Creating new boundary layer");

      // Process boundary data - handle different formats
      let boundaryData = boundary;
      
      // If boundary is an array, take the first item
      if (Array.isArray(boundary) && boundary.length > 0) {
        boundaryData = boundary[0];
        console.log("📦 BoundaryLayer: Using first item from array", boundaryData);
      }
      
      // Extract geometry from different possible structures
      const geometry = boundaryData?.geom || boundaryData?.geometry || boundaryData;
      
      if (!geometry) {
        console.error("❌ BoundaryLayer: No geometry found in boundary data");
        return;
      }

      console.log("📐 BoundaryLayer: Geometry data", geometry);

      // Parse if geometry is a string
      const parsedGeometry = typeof geometry === 'string' 
        ? JSON.parse(geometry) 
        : geometry;

      // Create the boundary layer
      layerRef.current = L.geoJSON(parsedGeometry, {
        style: {
          color: "#FFC700",
          weight: 2,
          opacity: 0.9,
          fillColor: "#FFC700",
          fillOpacity: 0.15,
        },
        onEachFeature: function (feature, layer) {
          // Add popup with ward info
          if (wardId) {
            layer.bindPopup(`Ward Boundary: ${wardId}`);
          }
        }
      }).addTo(map);

      console.log("✅ BoundaryLayer: Successfully added boundary layer");

      // Fit map to boundary bounds
      const bounds = layerRef.current.getBounds();
      if (bounds.isValid()) {
        console.log("🎯 BoundaryLayer: Fitting to bounds", bounds);
        map.fitBounds(bounds, { 
          padding: [20, 20],
          maxZoom: 16,
          animate: true,
          duration: 1
        });
      } else {
        console.warn("⚠️ BoundaryLayer: Invalid bounds", bounds);
      }

    } catch (error) {
      console.error("❌ BoundaryLayer: Error creating boundary layer:", error);
    }

    return () => {
      // Cleanup
      if (layerRef.current && map) {
        try {
          console.log("🧹 BoundaryLayer: Cleaning up layer");
          map.removeLayer(layerRef.current);
        } catch (e) {
          console.error("BoundaryLayer: Error during cleanup:", e);
        }
      }
    };
  }, [map, boundary, wardId]);

  return null;
}