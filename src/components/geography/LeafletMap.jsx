"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  LayersControl,
  Tooltip,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const previousBoundaryKeyRef = useRef(null);

  useEffect(() => {
    const group = (boundaries || []).filter((item) => item?.geojson);
    const primaryBoundary = boundary
      ? { geojson: boundary, id: "single-boundary" }
      : group.find((item) => item?.kind === "district") || group[0];
    const boundaryKey = primaryBoundary
      ? JSON.stringify(primaryBoundary.id ?? primaryBoundary.osm_id ?? primaryBoundary.geojson)
      : null;

    if (primaryBoundary?.geojson && boundaryKey !== previousBoundaryKeyRef.current) {
      const bounds = L.geoJSON(primaryBoundary.geojson).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13, animate: false });
      }
      previousBoundaryKeyRef.current = boundaryKey;
    } else if (!primaryBoundary?.geojson) {
      previousBoundaryKeyRef.current = null;
    }
  }, [boundary, boundaries, map]);

  return null;
}

function pointInRing(point, ring) {
  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }

  return inside;
}

function pointInGeometry(lat, lng, geometry) {
  if (!geometry) return false;
  const point = { lat, lng };

  if (geometry.type === "Polygon") {
    const [outer, ...holes] = geometry.coordinates || [];
    if (!outer || !pointInRing(point, outer)) return false;
    return !holes.some((hole) => pointInRing(point, hole));
  }

  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates || []).some((polygon) => {
      const [outer, ...holes] = polygon || [];
      if (!outer || !pointInRing(point, outer)) return false;
      return !holes.some((hole) => pointInRing(point, hole));
    });
  }

  if (geometry.type === "Feature") return pointInGeometry(lat, lng, geometry.geometry);
  if (geometry.type === "FeatureCollection") {
    return (geometry.features || []).some((feature) => pointInGeometry(lat, lng, feature));
  }

  return false;
}

function BoundaryContextLabelController({ boundaries = [] }) {
  const map = useMap();
  const [activeId, setActiveId] = useState(null);
  const timeoutRef = useRef(null);
  const previousIdRef = useRef(null);

  const normalized = useMemo(
    () => boundaries.filter((item) => item?.geojson && (item?.label || item?.name)),
    [boundaries],
  );

  useEffect(() => {
    const update = () => {
      const center = map.getCenter();
      const containing = normalized
        .filter((item) => pointInGeometry(center.lat, center.lng, item.geojson))
        .map((item) => {
          const bounds = L.geoJSON(item.geojson).getBounds();
          const area = Math.max(0, bounds.getEast() - bounds.getWest()) * Math.max(0, bounds.getNorth() - bounds.getSouth());
          return { item, area };
        })
        .sort((a, b) => a.area - b.area);

      const nextId = containing[0]?.item?.id ?? containing[0]?.item?.osm_id ?? null;
      if (String(nextId ?? "") === String(previousIdRef.current ?? "")) return;

      previousIdRef.current = nextId;
      setActiveId(nextId);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (nextId != null) {
        timeoutRef.current = window.setTimeout(() => setActiveId(null), 3500);
      }
    };

    update();
    map.on("moveend", update);
    map.on("zoomend", update);
    return () => {
      map.off("moveend", update);
      map.off("zoomend", update);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [map, normalized]);

  const active = normalized.find(
    (item) => String(item.id ?? item.osm_id) === String(activeId),
  );
  if (!active) return null;

  const center = L.geoJSON(active.geojson).getBounds().getCenter();
  return (
    <Marker
      position={[center.lat, center.lng]}
      interactive={false}
      icon={L.divIcon({
        className: "",
        html: `<span style="display:inline-block;white-space:nowrap;padding:4px 8px;border:1px solid rgba(0,0,0,.12);border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 1px 4px rgba(0,0,0,.16);font:600 12px/1.2 system-ui,sans-serif;color:#18181b;">${active.label || active.name}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })}
    />
  );
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
    // Geography convention: jurisdiction = blue, district = red.
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
          mouseover: (event) => {
            event.target.setStyle({
              weight: selected ? 4 : 3,
              opacity: 1,
              fillOpacity: isDistrict ? 0.16 : isJurisdiction ? 0.14 : 0.12,
            });
          },
          mouseout: (event) => {
            event.target.setStyle({
              weight: selected ? 4 : isDistrict || isJurisdiction ? 2.5 : 2,
              opacity: selected ? 1 : 0.9,
              fillOpacity: isDistrict ? 0.12 : isJurisdiction ? 0.1 : 0.1,
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

function ConnectionLine({ connections = [] }) {
  return connections
    .filter((item) =>
      Number.isFinite(Number(item?.from?.lat)) &&
      Number.isFinite(Number(item?.from?.lng)) &&
      Number.isFinite(Number(item?.to?.lat)) &&
      Number.isFinite(Number(item?.to?.lng)),
    )
    .map((item, index) => (
      <Polyline
        key={item.id || index}
        positions={[
          [Number(item.from.lat), Number(item.from.lng)],
          [Number(item.to.lat), Number(item.to.lng)],
        ]}
        pathOptions={{
          color: item.color || "#64748b",
          weight: 2,
          opacity: 0.65,
          dashArray: "6 6",
        }}
      />
    ));
}

export default function LeafletMap({
  lat,
  lng,
  onChange,
  boundary = null,
  boundaries = [],
  markers = [],
  connections = [],
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
  const labelBoundaries = useMemo(
    () => [
      ...(boundary ? [{ id: "single-boundary", kind: "jurisdiction", geojson: boundary, label: "Jurisdiction" }] : []),
      ...boundaries,
    ],
    [boundary, boundaries],
  );

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
        {boundary && <GeoJSON data={boundary} style={{ color: "#2563eb", weight: 2.5, opacity: 0.9, fillColor: "#3b82f6", fillOpacity: 0.1 }} />}
        <BoundaryGroup boundaries={boundaries} selectedId={selectedBoundaryId} onBoundaryClick={onBoundaryClick} />
        <BoundaryContextLabelController boundaries={labelBoundaries} />
        <ConnectionLine connections={connections} />
        <MarkerGroup markers={allMarkers} />
      </MapContainer>
    </div>
  );
}
