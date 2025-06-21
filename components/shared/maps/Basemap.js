// components/shared/maps/BaseMap.js
'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './styles/map.module.css';
import { tileLayers } from './utils/layerStyles';
import { setupLeafletIcons } from './utils/coordinateUtils';

export default function BaseMap({ 
  center = [19.0760, 72.8777], 
  zoom = 12,
  children,
  onMapInit,
  className = ''
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const initializedRef = useRef(false);
  const [currentLayer, setCurrentLayer] = useState('osm');
  const tileLayerRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (initializedRef.current || !mapRef.current) return;

    setupLeafletIcons();
    initializedRef.current = true;
    
    mapInstance.current = L.map(mapRef.current, {
      renderer: L.svg(),
      zoomControl: false
    }).setView(center, zoom);
    
    // Add the initial tile layer
    tileLayerRef.current = L.tileLayer(tileLayers[currentLayer].url, {
      attribution: tileLayers[currentLayer].attribution
    }).addTo(mapInstance.current);

    // Add layer control
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

    // Callback for when map is initialized
    if (onMapInit) {
      onMapInit(mapInstance.current);
    }

    // Set up resize observer
    resizeObserverRef.current = new ResizeObserver(() => {
      if (mapInstance.current) {
        setTimeout(() => {
          mapInstance.current.invalidateSize();
        }, 100);
      }
    });
    
    if (mapRef.current) {
      resizeObserverRef.current.observe(mapRef.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      initializedRef.current = false;
    };
  }, []);

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