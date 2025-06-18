'use client';

import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../../../styles/layout/road.module.css';

const tileLayers = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  cyclosm: {
    name: 'CyclOSM',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  transport: {
    name: 'Transport Map',
    url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  cycle: {
    name: 'Cycle Map',
    url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

export default function RoadMap({ 
  roads, 
  selectedRoad, 
  onRoadSelect,
  center = [19.0760, 72.8777],
  zoom = 12
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const roadLayersRef = useRef([]);
  const initializedRef = useRef(false);
  const [currentLayer, setCurrentLayer] = useState('osm');
  const tileLayerRef = useRef(null);

  useEffect(() => {
    if (initializedRef.current || !mapRef.current) return;

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

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
        mapInstance.current = null;
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

  // Function to transform coordinates if needed
  const transformCoordinates = (coords) => {
    // Check if coordinates are in Web Mercator (typical range)
    if (Math.abs(coords[0]) > 180 || Math.abs(coords[1]) > 90) {
      // Convert Web Mercator to WGS84
      const x = coords[0];
      const y = coords[1];
      const lon = (x / 20037508.34) * 180;
      const lat = (Math.atan(Math.exp(y / 20037508.34 * Math.PI)) * 360 / Math.PI) - 90;
      return [lon, lat];
    }
    return coords;
  };


  // Process GeoJSON coordinates
  const processGeoJSON = (geoJSON) => {
    if (!geoJSON || !geoJSON.coordinates) return geoJSON;
    
    const processCoordinateArray = (coords) => {
      return Array.isArray(coords[0]) ? 
        coords.map(processCoordinateArray) : 
        transformCoordinates(coords);
    };

    return {
      ...geoJSON,
      coordinates: processCoordinateArray(geoJSON.coordinates)
    };
  };

  // Update road layers
  useEffect(() => {
    if (!mapInstance.current || !roads) return;

    // Clear existing layers
    roadLayersRef.current.forEach(layer => {
      if (layer && mapInstance.current.hasLayer(layer)) {
        mapInstance.current.removeLayer(layer);
      }
    });
    roadLayersRef.current = [];

    if (roads.length === 0) {
      console.log('No roads data available');
      return;
    }

    const layers = [];
    const bounds = [];

    roads.forEach(road => {
      try {
        if (!road.geometry) {
          console.warn('Road missing geometry:', road);
          return;
        }
        
        console.log('Processing road:', road.name, 'with geometry:', road.geometry);
        
        let geoJSON;
        try {
          geoJSON = typeof road.geometry === 'string' ? 
            JSON.parse(road.geometry) : 
            JSON.parse(JSON.stringify(road.geometry));
        } catch (e) {
          console.error('Failed to parse road geometry:', e);
          return;
        }

        // Validate and process GeoJSON
        if (!geoJSON.type || !geoJSON.coordinates) {
          console.error('Invalid GeoJSON structure:', geoJSON);
          return;
        }

        const processedGeoJSON = processGeoJSON(geoJSON);
        if (!processedGeoJSON) return;

        const layer = L.geoJSON(processedGeoJSON, {
          style: (feature) => {
            const colorMap = {
                'highway': '#e74c3c',
                'primary': '#2980b9',
                'residential': '#2ecc71',
                'service': '#f39c12',
                'footpath': '#9b59b6',
                'default': '#95a5a6'
            };

            const type = road.fclass?.toLowerCase() || 'default';
            const color = colorMap[type] || colorMap['default'];

            return {
                color: selectedRoad?.name === road.name ? '#ff0000' : color,
                weight: selectedRoad?.name === road.name ? 5 : 2,
                opacity: 0.8
            };
          }
        })
        .bindPopup(`
          <div class="popup-content">
            <strong>Name:</strong> ${road.name || 'Unnamed'}<br>
            <strong>Type:</strong> ${road.fclass}<br>
            <strong>Length:</strong> ${road.total_length_kilometers?.toFixed(2) || '0'} km<br>
            <strong>Segments:</strong> ${road.segments_count}
          </div>
        `)
        .on('click', () => {
          onRoadSelect(road);
          const centroid = layer.getBounds().getCenter();
          mapInstance.current.flyTo(centroid, 15, {
            animate: true,
            duration: 1
          });
        })
        .addTo(mapInstance.current);

        layers.push(layer);
        bounds.push(layer.getBounds());
      } catch (e) {
        console.error('Error processing road:', road.name, e);
      }
    });

    roadLayersRef.current = layers;

    if (bounds.length > 0) {
      try {
        const combinedBounds = bounds.reduce((acc, bound) => {
          return acc.extend(bound);
        }, bounds[0]);
        
        mapInstance.current.fitBounds(combinedBounds, { 
          padding: [50, 50],
          maxZoom: 15
        });
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }
  }, [roads, selectedRoad]);

  // Handle selected road change
  useEffect(() => {
    if (!mapInstance.current || !selectedRoad || !selectedRoad.geometry) return;

    try {
      let geoJSON;
      try {
        geoJSON = typeof selectedRoad.geometry === 'string' ? 
          JSON.parse(selectedRoad.geometry) : 
          JSON.parse(JSON.stringify(selectedRoad.geometry));
      } catch (e) {
        console.error('Failed to parse selected road geometry:', e);
        return;
      }

      const processedGeoJSON = processGeoJSON(geoJSON);
      if (!processedGeoJSON) return;

      const layer = L.geoJSON(processedGeoJSON);
      mapInstance.current.flyTo(layer.getBounds().getCenter(), 15, {
        animate: true,
        duration: 1
      });
    } catch (e) {
      console.error('Error flying to road:', e);
    }
  }, [selectedRoad]);

  return (
    <div className={styles.mapContainer}>
      <div ref={mapRef} className={styles.map} />
      <div className={styles.layerControls}>
        {Object.entries(tileLayers).map(([key, layer]) => (
          <button
            key={key}
            className={`${styles.layerButton} ${currentLayer === key ? styles.active : ''}`}
            onClick={() => setCurrentLayer(key)}
          >
            {layer.name}
          </button>
        ))}
      </div>
    </div>
  );
}