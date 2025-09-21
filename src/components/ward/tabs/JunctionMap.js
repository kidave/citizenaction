"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import BaseMap from "components/shared/maps/Basemap";
import { transformCoordinates } from "components/shared/maps/utils/coordinateUtils";
import { useWard } from "context/WardContext";

export default function JunctionMap({
  junctions,
  selectedJunction,
  onJunctionSelect,
  center = [19.076, 72.8777],
  zoom = 12,
}) {
  const [currentLayer, setCurrentLayer] = useState("osm");
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const { boundary } = useWard();

  // Handle selected junction change
  useEffect(() => {
    if (!mapRef.current || !selectedJunction) return;

    let isMounted = true;
    const flyToMarker = () => {
      if (!isMounted || !mapRef.current) return;
      
      try {
        let lat = selectedJunction.latitude;
        let lng = selectedJunction.longitude;

        // Transform coordinates if needed
        [lng, lat] = transformCoordinates([lng, lat]);

        if (isNaN(lat) || isNaN(lng)) return;

        // Fly to the selected junction with padding
        mapRef.current.flyTo([lat, lng], 17, {
          animate: true,
          duration: 2,
          padding: [50, 50],
        });

        // Find and highlight the selected marker
        markersRef.current.forEach((marker) => {
          if (marker && marker.getLatLng) {
            const markerPos = marker.getLatLng();
            const isSelected =
              markerPos.lat.toFixed(6) === lat.toFixed(6) &&
              markerPos.lng.toFixed(6) === lng.toFixed(6);

            marker.setOpacity(isSelected ? 1 : 0.7);
            if (isSelected) marker.openPopup();
          }
        });
      } catch (error) {
        console.error("Error in flyToMarker:", error);
      }
    };

    // Small delay to ensure map is ready
    const timer = setTimeout(flyToMarker, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      // Cancel any ongoing flyTo animation
      if (mapRef.current && mapRef.current._flyToBounds) {
        mapRef.current.stop();
      }
    };
  }, [selectedJunction]);

  // Initialize markers
  useEffect(() => {
    if (!mapRef.current || !junctions || !mapRef.current._leaflet_id) return;

    let isMounted = true;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      if (marker && mapRef.current) {
        try {
          mapRef.current.removeLayer(marker);
        } catch (e) {
          console.error("Error removing marker:", e);
        }
      }
    });
    markersRef.current = [];

    if (junctions.length === 0) return;

    const newMarkers = junctions
      .map((junction) => {
        if (!isMounted) return null;
        
        try {
          let lat = junction.latitude || center[0];
          let lng = junction.longitude || center[1];

          // Transform coordinates if needed
          [lng, lat] = transformCoordinates([lng, lat]);

          if (isNaN(lat) || isNaN(lng)) return null;

          const marker = L.marker([lat, lng], {
            opacity: selectedJunction?.fid === junction.fid ? 1 : 0.7,
            riseOnHover: true,
          });

          marker.on("click", () => {
            if (!isMounted || !mapRef.current) return;
            onJunctionSelect(junction);
            mapRef.current.flyTo([lat, lng], 17, {
              animate: true,
              duration: 2,
            });
          });

          marker.addTo(mapRef.current);
          return marker;
        } catch (error) {
          console.error("Error creating marker:", error);
          return null;
        }
      })
      .filter(Boolean);

    if (!isMounted) {
      // Clean up if component unmounted during async operations
      newMarkers.forEach((marker) => {
        if (marker && mapRef.current) {
          try {
            mapRef.current.removeLayer(marker);
          } catch (e) {
            console.error("Error cleaning up marker:", e);
          }
        }
      });
      return;
    }

    markersRef.current = newMarkers;

    // Fit bounds to all markers
    if (newMarkers.length > 0) {
      try {
        const group = L.featureGroup(newMarkers);
        mapRef.current.fitBounds(group.getBounds(), {
          padding: [50, 50],
          maxZoom: 15,
        });
      } catch (e) {
        console.error("Error fitting bounds:", e);
      }
    }

    return () => {
      isMounted = false;
      newMarkers.forEach((marker) => {
        if (marker && mapRef.current) {
          try {
            mapRef.current.removeLayer(marker);
          } catch (e) {
            console.error("Error removing marker:", e);
          }
        }
      });
    };
  }, [junctions, center, onJunctionSelect, selectedJunction]);

  return (
    <BaseMap
      center={center}
      zoom={zoom}
      boundary={boundary}
      onMapInit={(map) => {
        mapRef.current = map;
      }}
    ></BaseMap>
  );
}