"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  LayersControl,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo } from "react";
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

function MapController({ lat, lng, onChange, boundary, boundaries }) {
  const map = useMapEvents({
    click(e) {
      onChange?.(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (boundary) {
      const bounds = L.geoJSON(boundary).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [28, 28],
          maxZoom: 13,
          animate: false,
        });
        return;
      }
    }

    const group = (boundaries || []).filter((item) => item?.geojson);
    if (group.length) {
      const bounds = L.featureGroup(
        group.map((item) => L.geoJSON(item.geojson)),
      ).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [28, 28],
          maxZoom: 9,
          animate: false,
        });
        return;
      }
    }

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng], map.getZoom(), { animate: false });
    }
  }, [boundary, boundaries, lat, lng, map]);

  return null;
}

function BoundaryLayer({ boundary }) {
  const map = useMap();

  useEffect(() => {
    if (!boundary) return;

    const bounds = L.geoJSON(boundary).getBounds();
    if (!bounds.isValid()) return;

    map.fitBounds(bounds, {
      padding: [28, 28],
      maxZoom: 13,
      animate: false,
    });
  }, [boundary, map]);

  if (!boundary) return null;

  return (
    <GeoJSON
      key={JSON.stringify(boundary)}
      data={boundary}
      style={{
        color: "#7c5c36",
        weight: 3,
        opacity: 0.9,
        fillOpacity: 0.12,
      }}
    />
  );
}

function BoundaryGroup({ boundaries = [], selectedId, onBoundaryClick }) {
  const normalized = useMemo(
    () => boundaries.filter((item) => item?.geojson && item?.osm_id),
    [boundaries],
  );

  return normalized.map((item) => {
    const selected = String(item.osm_id) === String(selectedId);

    return (
      <GeoJSON
        key={`${item.osm_type || "relation"}-${item.osm_id}`}
        data={item.geojson}
        style={() => ({
          color: selected ? "#7c5c36" : "#8a7658",
          weight: selected ? 4 : 2,
          opacity: selected ? 1 : 0.78,
          fillOpacity: selected ? 0.12 : 0.02,
        })}
        eventHandlers={{
          click: () => onBoundaryClick?.(item),
          mouseover: (event) => {
            if (selected) return;
            event.target.setStyle({ weight: 3, opacity: 1 });
          },
          mouseout: (event) => {
            if (selected) return;
            event.target.setStyle({ weight: 2, opacity: 0.78 });
          },
        }}
      />
    );
  });
}

export default function LeafletMap({
  lat,
  lng,
  onChange,
  boundary = null,
  boundaries = [],
  selectedBoundaryId = null,
  onBoundaryClick,
  showMarker = true,
  zoom = 15,
}) {
  const safeLat = Number.isFinite(lat) ? lat : 19.076;
  const safeLng = Number.isFinite(lng) ? lng : 72.8777;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[safeLat, safeLng]}
        zoom={zoom}
        className="h-full w-full"
      >
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="Map">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution="Satellite imagery"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapController
          lat={safeLat}
          lng={safeLng}
          onChange={onChange}
          boundary={boundary}
          boundaries={boundaries}
        />

        <BoundaryLayer boundary={boundary} />

        <BoundaryGroup
          boundaries={boundaries}
          selectedId={selectedBoundaryId}
          onBoundaryClick={onBoundaryClick}
        />

        {showMarker && <Marker position={[safeLat, safeLng]} icon={markerIcon} />}
      </MapContainer>
    </div>
  );
}
