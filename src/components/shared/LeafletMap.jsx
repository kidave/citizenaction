"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const markerIcon = new L.Icon({
  iconUrl: "/ca.png",
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
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);

  return null;
}

export default function LeafletMap({
  lat,
  lng,
  onChange,
  onUseCurrentLocation,
  loadingGPS = false,
}) {
  return (
    <div className="relative h-full w-full">
      <MapContainer center={[lat, lng]} zoom={15} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController lat={lat} lng={lng} onChange={onChange} />
        <Marker position={[lat, lng]} icon={markerIcon} />
      </MapContainer>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onUseCurrentLocation}
        disabled={loadingGPS}
        aria-label="Use current location"
        className="absolute bottom-24 right-4 z-[1000] h-12 w-12 rounded-full bg-background shadow-lg hover:bg-background"
      >
        {loadingGPS ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <LocateFixed className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
