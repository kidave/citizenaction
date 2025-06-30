'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './styles/map.module.css';
import { tileLayers } from './utils/layerStyles';
import { setupLeafletIcons, transformGeoJSON } from './utils/coordinateUtils';

export default function BaseMap({ 
  center = [19.0760, 72.8777], 
  zoom = 12,
  children,
  onMapInit,
  className = '',
  boundary
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const initializedRef = useRef(false);
  const [currentLayer, setCurrentLayer] = useState('osm');
  const tileLayerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const boundaryLayerRef = useRef(null);

  // Process boundary data
  const processBoundary = (boundaryData) => {
    if (!boundaryData?.geom) return null;
    
    try {
      // Handle stringified GeoJSON
      const geom = typeof boundaryData.geom === 'string' 
        ? JSON.parse(boundaryData.geom) 
        : boundaryData.geom;
      
      // Validate GeoJSON structure
      if (!geom.type || !geom.coordinates) {
        console.error('Invalid GeoJSON structure:', geom);
        return null;
      }
      
      const transformedGeom = transformGeoJSON(geom); // <--- Add this line
      return transformedGeom; // <--- Return the transformed geometry
    } catch (error) {
      console.error('Error processing boundary geometry:', error);
      return null;
    }
  };

  // Update boundary layer
  const updateBoundaryLayer = () => {
    if (!mapInstance.current) return;

    // Clear existing boundary layer
    if (boundaryLayerRef.current) {
      mapInstance.current.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }

    // Process and add new boundary
    const processedBoundary = processBoundary(boundary);
    if (processedBoundary) {
      try {
        boundaryLayerRef.current = L.geoJSON(processedBoundary, {
          style: {
            color: '#9A4EAE',
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.1,
            fillColor: '#9A4EAE'
          }
        }).addTo(mapInstance.current);

        // Bring boundary to back so markers appear on top
        boundaryLayerRef.current.bringToBack();

        console.log('Boundary layer successfully added:', boundaryLayerRef.current);
      } catch (error) {
        console.error('Error adding boundary layer:', error);
      }
    }
  };

  // Initialize map
  useEffect(() => {
    if (initializedRef.current || !mapRef.current) return;

    setupLeafletIcons();
    initializedRef.current = true;
    
    // Initialize map instance
    mapInstance.current = L.map(mapRef.current, {
      renderer: L.svg(),
      zoomControl: false
    }).setView(center, zoom);
    
    // Add base tile layer
    tileLayerRef.current = L.tileLayer(tileLayers[currentLayer].url, {
      attribution: tileLayers[currentLayer].attribution
    }).addTo(mapInstance.current);

    // Add layer controls
    const baseLayers = Object.entries(tileLayers).reduce((acc, [key, layer]) => {
      acc[layer.name] = L.tileLayer(layer.url, { attribution: layer.attribution });
      return acc;
    }, {});

    L.control.layers(baseLayers, null, {
      position: 'topright'
    }).addTo(mapInstance.current);

    L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance.current);

    // Add boundary if available
    updateBoundaryLayer();

    // Callback for parent component
    if (onMapInit) {
      onMapInit(mapInstance.current);
    }

    // Set up resize observer
    resizeObserverRef.current = new ResizeObserver(() => {
      if (mapInstance.current && mapRef.current) {
        setTimeout(() => {
          try {
            mapInstance.current.invalidateSize({ 
              pan: false, 
              debounceMoveend: true 
            });
          } catch (error) {
            console.error('Error invalidating map size:', error);
          }
        }, 100);
      }
    });
    
    resizeObserverRef.current.observe(mapRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (mapInstance.current) {
        try {
          mapInstance.current.off();
          mapInstance.current.remove();
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
        mapInstance.current = null;
      }
      initializedRef.current = false;
      };
    }, []);

  // Update boundary when it changes
  useEffect(() => {
    if (initializedRef.current) {
      updateBoundaryLayer();
    }
  }, [boundary]);

  // Update tile layer when currentLayer changes
  useEffect(() => {
    if (!mapInstance.current || !tileLayerRef.current) return;
    
    mapInstance.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(tileLayers[currentLayer].url, {
      attribution: tileLayers[currentLayer].attribution
    }).addTo(mapInstance.current);
  }, [currentLayer]);

  return (
    <div className={`${styles.mapContainer} ${className}`} ref={mapRef}>
      {children}
    </div>
  );
}