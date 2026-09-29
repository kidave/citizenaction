"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  LayersControl,
  Tooltip,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo } from "react";
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
        map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13, animate: false });
        return;
      }
    }

    const group = (boundaries || []).filter((item) => item?.geojson);
    if (group.length) {
      const primary = group.find((item) => item?.kind === "district") || group[0];
      const bounds = L.geoJSON(primary.geojson).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13, animate: false });
        return;
      }
    }

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng], map.getZoom(), { animate: false });
    }
  }, [boundary, boundaries, lat, lng, map]);

  return null;
}

function BoundaryGroup({ boundaries = [], selectedId, onBoundaryClick }) {
  const normalized = useMemo(
    () => boundaries.filter((item) => item?.geojson),
    [boundaries],
  );

  return normalized.map((item, index) => {
    const selected = selectedId != null && String(item.id ?? item.osm_id) === String(selectedId);
    const isJurisdiction = item.kind === "jurisdiction";
    const isDistrict = item.kind === "district";
    const stroke = isJurisdiction ? "#dc2626" : isDistrict ? "#2563eb" : "#64748b";
    const fill = isJurisdiction ? "#ef4444" : isDistrict ? "#3b82f6" : "#64748b";

    return (
      <GeoJSON
        key={`${item.kind || "boundary"}-${item.id || item.osm_id || index}`}
        data={item.geojson}
        style={() => ({
          color: stroke,
          weight: selected ? 4 : isDistrict || isJurisdiction ? 2.5 : 2,
          opacity: selected ? 1 : 0.9,
          fillColor: fill,
          fillOpacity: isDistrict ? 0.12 : isJurisdiction ? 0.1 : 0.06,
        })}
        onEachFeature={(feature, layer) => {
          const label = item.label || item.name;
          if (label) {
            layer.bindTooltip(label, {
              sticky: true,
              direction: "center",
              className: "citizen-map-boundary-label",
              opacity: 0.95,
            });
          }
        }}
        eventHandlers={{
          click: () => onBoundaryClick?.(item),
          mouseover: (event) => {
            event.target.setStyle({
              weight: selected ? 4 : 3,
              opacity: 1,
              fillOpacity: isDistrict ? 0.16 : isJurisdiction ? 0.14 : 0.08,
            });
          },
          mouseout: (event) => {
            event.target.setStyle({
              weight: selected ? 4 : isDistrict || isJurisdiction ? 2.5 : 2,
              opacity: selected ? 1 : 0.9,
              fillOpacity: isDistrict ? 0.12 : isJurisdiction ? 0.1 : 0.06,
            });
          },
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
        : citizenIcon;
      return (
        <Marker key={`${item.kind || "marker"}-${item.id || index}`} position={[Number(item.lat), Number(item.lng)]} icon={icon}>
          {item.label && (
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              {item.label}
            </Tooltip>
          )}
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
  selectedBoundaryId = null,
  onBoundaryClick,
  showMarker = true,
  zoom = 15,
}) {
  const safeLat = Number.isFinite(lat) ? lat : 19.076;
  const safeLng = Number.isFinite(lng) ? lng : 72.8777;
  const allMarkers = showMarker
    ? [{ id: "post-location", kind: "citizen", lat: safeLat, lng: safeLng, label: "Citizen Action location" }, ...markers]
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

        <MapController lat={safeLat} lng={safeLng} onChange={onChange} boundary={boundary} boundaries={boundaries} />
        {boundary && <GeoJSON data={boundary} style={{ color: "#2563eb", weight: 2.5, opacity: 0.9, fillColor: "#3b82f6", fillOpacity: 0.12 }} />}
        <BoundaryGroup boundaries={boundaries} selectedId={selectedBoundaryId} onBoundaryClick={onBoundaryClick} />
        <MarkerGroup markers={allMarkers} />
      </MapContainer>
    </div>
  );
}
