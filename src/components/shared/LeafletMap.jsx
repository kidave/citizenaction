"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  LayersControl,
  useMapEvents,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  className: "",
  html: `
    <img
      src="/ca.png"
      style="
        width: 32px;
        height: 32px;
        object-fit: contain;
        filter:
          drop-shadow(1px 0 0 white)
          drop-shadow(-1px 0 0 white)
          drop-shadow(0 1px 0 white)
          drop-shadow(0 -1px 0 white);
      "
    />
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function MapController({ lat, lng, onChange }) {
  const map = useMapEvents({
    click(e) {
      onChange?.(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    map.setView([lat, lng], 15, {
      animate: false,
    });
  }, [lat, lng, map]);

  return null;
}

export default function LeafletMap({ lat, lng, onChange, boundary = null }) {
  return (
    <div className="relative h-full w-full">
      <MapContainer center={[lat, lng]} zoom={15} className="h-full w-full">
        <LayersControl position="topleft">
          {/* Normal OSM map */}
          <LayersControl.BaseLayer checked name="Map">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* Satellite */}
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution="Satellite imagery"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapController lat={lat} lng={lng} onChange={onChange} />

        {boundary && (
          <GeoJSON
            key={JSON.stringify(boundary)}
            data={boundary}
            style={{
              weight: 3,
              fillOpacity: 0.08,
            }}
          />
        )}

        <Marker position={[lat, lng]} icon={markerIcon} />
      </MapContainer>
    </div>
  );
}
