'use client';
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapLibreMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // Default style
      center: [72.8777, 19.0760], // Mumbai
      zoom: 12,
      pitch: 45, // 3D tilt
      bearing: -10 // Rotation
    });

    // Add 3D terrain (requires MapTiler or similar service)
    map.current.on('load', () => {
      map.current.addSource('terrain-rgb', {
        type: 'raster-dem',
        url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
        tileSize: 256
      });
      
      map.current.setTerrain({ source: 'terrain-rgb', exaggeration: 1.5 });
      
      // Add sky layer for realistic 3D
      map.current.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });
    });

    // Add layer switcher
    const layerList = document.getElementById('menu');
    const inputs = layerList.getElementsByTagName('input');
    
    for (const input of inputs) {
      input.onclick = (layer) => {
        const layerId = layer.target.id;
        map.current.setStyle('https://demotiles.maplibre.org/' + layerId + '.json');
      };
    }

    return () => map.current?.remove();
  }, []);

  return (
    <div>
      <div id="menu">
        <input id="streets" type="radio" name="rtoggle" value="streets" checked />
        <label for="streets">Streets</label>
        <input id="satellite" type="radio" name="rtoggle" value="satellite" />
        <label for="satellite">Satellite</label>
        <input id="terrain" type="radio" name="rtoggle" value="terrain" />
        <label for="terrain">Terrain</label>
      </div>
      <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />
    </div>
  );
}