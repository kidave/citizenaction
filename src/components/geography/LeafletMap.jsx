"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  LayersControl,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const citizenIcon = L.divIcon({
  className: "",
  html: `<img src="/ca.png" style="width:32px;height:32px;object-fit:contain;filter:drop-shadow(1px 0 0 white) drop-shadow(-1px 0 0 white) drop-shadow(0 1px 0 white) drop-shadow(0 -1px 0 white);" />`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function imageIcon(url, size = 32) {
  if (!url) return citizenIcon;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;overflow:hidden;border:2px solid white;background:white;box-shadow:0 1px 4px rgba(0,0,0,.3)"><img src="${url}" style="width:100%;height:100%;object-fit:cover" /></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

function MapController({ onChange, boundary, boundaries, markers = [], fitMarkers = false }) {
  const map = useMapEvents({
    click(e) {
      onChange?.(e.latlng.lat, e.latlng.lng);
    },
  });
  const previousViewKeyRef = useRef(null);

  useEffect(() => {
    const group = (boundaries || []).filter((item) => item?.geojson);
    const primaryBoundary = boundary
      ? { geojson: boundary, id: "single-boundary" }
      : group.find((item) => item?.kind === "district") || group[0];
    const boundaryKey = primaryBoundary
      ? JSON.stringify(primaryBoundary.id ?? primaryBoundary.osm_id ?? primaryBoundary.geojson)
      : null;

    if (primaryBoundary?.geojson && boundaryKey !== previousViewKeyRef.current) {
      const bounds = L.geoJSON(primaryBoundary.geojson).getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13, animate: false });
      previousViewKeyRef.current = boundaryKey;
      return;
    }

    if (!primaryBoundary?.geojson && fitMarkers && markers.length) {
      const points = markers
        .filter((item) => Number.isFinite(Number(item?.lat)) && Number.isFinite(Number(item?.lng)))
        .map((item) => [Number(item.lat), Number(item.lng)]);
      if (points.length) {
        const bounds = L.latLngBounds(points);
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: points.length === 1 ? 14 : 12,
            animate: false,
          });
          previousViewKeyRef.current = `markers:${points.map((point) => point.join(",")).join("|")}`;
        }
      }
    }

    if (!primaryBoundary?.geojson && !fitMarkers) {
      previousViewKeyRef.current = null;
    }
  }, [boundary, boundaries, fitMarkers, map, markers]);

  return null;
}

function BoundaryGroup({ boundaries = [], selectedId, onBoundaryClick }) {
  const normalized = useMemo(() => boundaries.filter((item) => item?.geojson), [boundaries]);

  return normalized.map((item, index) => {
    const selected = selectedId != null && String(item.id ?? item.osm_id) === String(selectedId);
    const isJurisdiction = item.kind === "jurisdiction";
    const isDistrict = item.kind === "district";
    const stroke = isJurisdiction ? "#2563eb" : isDistrict ? "#dc2626" : "#2563eb";
    const fill = isJurisdiction ? "#3b82f6" : isDistrict ? "#ef4444" : "#3b82f6";

    return (
      <GeoJSON
        key={`${item.kind || "boundary"}-${item.id || item.osm_id || index}`}
        data={item.geojson}
        style={() => ({
          color: stroke,
          weight: selected ? 4 : isDistrict || isJurisdiction ? 2.5 : 2,
          opacity: selected ? 1 : 0.9,
          fillColor: fill,
          fillOpacity: isDistrict ? 0.12 : isJurisdiction ? 0.1 : 0.1,
        })}
        eventHandlers={{
          click: () => onBoundaryClick?.(item),
          mouseover: (event) => event.target.setStyle({ weight: selected ? 4 : 3, opacity: 1, fillOpacity: isDistrict ? 0.16 : isJurisdiction ? 0.14 : 0.12 }),
          mouseout: (event) => event.target.setStyle({ weight: selected ? 4 : isDistrict || isJurisdiction ? 2.5 : 2, opacity: selected ? 1 : 0.9, fillOpacity: isDistrict ? 0.12 : isJurisdiction ? 0.1 : 0.1 }),
        }}
      />
    );
  });
}

function MarkerGroup({ markers = [] }) {
  return markers
    .filter((item) => Number.isFinite(Number(item?.lat)) && Number.isFinite(Number(item?.lng)))
    .map((item, index) => {
      const icon = item.kind === "governance" || item.kind === "person"
        ? imageIcon(item.image_url, item.kind === "person" ? 34 : 36)
        : imageIcon(item.image_url, 34);
      return (
        <Marker key={`${item.kind || "marker"}-${item.id || index}`} position={[Number(item.lat), Number(item.lng)]} icon={icon}>
          {item.label && <Popup closeButton>{item.label}</Popup>}
        </Marker>
      );
    });
}

export default function LeafletMap({
  lat,
  lng,
  onChange,
  boundary = null,
  boundaries = [],
  markers = [],
  citizenMarker = null,
  selectedBoundaryId = null,
  onBoundaryClick,
  showMarker = true,
  fitMarkers = false,
  zoom = 15,
}) {
  const safeLat = Number.isFinite(lat) ? lat : 19.076;
  const safeLng = Number.isFinite(lng) ? lng : 72.8777;
  const allMarkers = showMarker
    ? [
        {
          id: "post-location",
          kind: "citizen",
          lat: safeLat,
          lng: safeLng,
          image_url: citizenMarker?.image_url || null,
          label: citizenMarker?.label || "Post location",
        },
        ...markers,
      ]
    : markers;

  return (
    <div className="relative z-0 isolate h-full w-full overflow-hidden">
      <MapContainer center={[safeLat, safeLng]} zoom={zoom} className="relative z-0 h-full w-full">
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="Map">
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer attribution="Satellite imagery" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapController
          onChange={onChange}
          boundary={boundary}
          boundaries={boundaries}
          markers={allMarkers}
          fitMarkers={fitMarkers}
        />
        {boundary && <GeoJSON data={boundary} style={{ color: "#2563eb", weight: 2.5, opacity: 0.9, fillColor: "#3b82f6", fillOpacity: 0.1 }} />}
        <BoundaryGroup boundaries={boundaries} selectedId={selectedBoundaryId} onBoundaryClick={onBoundaryClick} />
        <MarkerGroup markers={allMarkers} />
      </MapContainer>
    </div>
  );
}
