"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "/ca.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

/* CLICK HANDLER ONLY */
function MapController({ lat, lng, onChange }) {
  const map = useMapEvents({
    click(e) {
      onChange?.(e.latlng.lat, e.latlng.lng);
    },
  });

  // always center map when location changes
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng]);

  return null;
}

export default function LeafletMap({ lat, lng, onChange }) {
  return (
    <div className="h-full w-full">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapController lat={lat} lng={lng} onChange={onChange} />

        {/* STATIC MARKER */}
        <Marker position={[lat, lng]} icon={markerIcon} />
      </MapContainer>
    </div>
  );
}