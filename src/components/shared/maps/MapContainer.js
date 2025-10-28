"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapContainer({
  center = [19.076, 72.8777],
  zoom = 12,
  wardCode,
  children,
  onMapInit,
  className = "",
  interactive = true, // ✅ Add this prop with default true
  zoomControl = true, // ✅ Add this prop with default true
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const prevCenterRef = useRef(center);
  const prevZoomRef = useRef(zoom);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Initialize map only once
    if (mapRef.current && !mapInstance.current && !isInitializedRef.current) {
      isInitializedRef.current = true;
      
      // ✅ Configure map options based on interactive prop
      const mapOptions = {
        center,
        zoom,
        fadeAnimation: false,
        zoomAnimation: false,
      };

      // ✅ Disable interactions if not interactive
      if (!interactive) {
        mapOptions.dragging = false;
        mapOptions.touchZoom = false;
        mapOptions.doubleClickZoom = false;
        mapOptions.scrollWheelZoom = false;
        mapOptions.boxZoom = false;
        mapOptions.keyboard = false;
        mapOptions.zoomControl = false; // Disable zoom control
      } else {
        mapOptions.zoomControl = zoomControl; // Use zoomControl prop
      }

      mapInstance.current = L.map(mapRef.current, mapOptions);

      // Add default tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      // Add zoom control only if interactive and zoomControl is true
      if (interactive && zoomControl) {
        L.control.zoom({ position: 'topright' }).addTo(mapInstance.current);
      }

      // Explicitly set lower z-index for map container
      const container = mapInstance.current.getContainer();
      if (container) {
        container.style.zIndex = '1';
        container.style.position = 'relative';
      }

      // Store initial values
      prevCenterRef.current = center;
      prevZoomRef.current = zoom;

      // Notify parent
      if (onMapInit) {
        onMapInit(mapInstance.current);
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (error) {
          // Ignore errors during cleanup
          console.warn('Error during map cleanup:', error);
        }
        mapInstance.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  // Update view when center/zoom changes with smooth animation
  useEffect(() => {
    if (mapInstance.current && mapInstance.current._loaded) {
      const hasCenterChanged = 
        prevCenterRef.current[0] !== center[0] || 
        prevCenterRef.current[1] !== center[1];
      const hasZoomChanged = prevZoomRef.current !== zoom;

      // Skip if no changes
      if (!hasCenterChanged && !hasZoomChanged) return;

      try {
        if (hasCenterChanged && hasZoomChanged) {
          // Both changed - use flyTo for smooth transition
          mapInstance.current.flyTo(center, zoom, {
            duration: 1,
            easeLinearity: 0.25
          });
        } else if (hasCenterChanged) {
          // Only center changed - use panTo
          mapInstance.current.panTo(center, {
            duration: 1,
            easeLinearity: 0.25
          });
        } else if (hasZoomChanged) {
          // Only zoom changed - use setView with animate
          mapInstance.current.setView(center, zoom, {
            animate: true,
            duration: 0.5
          });
        }

        // Update previous values
        prevCenterRef.current = center;
        prevZoomRef.current = zoom;
      } catch (error) {
        console.warn('Error during map view update:', error);
      }
    }
  }, [center, zoom]);

  return (
    <div 
      ref={mapRef} 
      className={className}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </div>
  );
}