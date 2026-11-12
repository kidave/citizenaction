"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Layers } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";

import OpenFreeMapLayer from "@/components/geography/OpenFreeMapLayer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { format } from "date-fns";

import { getActivityDate } from "@/utils/activity";
import { getGovernanceLabel } from "@/utils/governance";

const BASEMAP_STORAGE_KEY = "citizen-action:map-basemap";

const BASEMAP_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "night", label: "Night" },
  { value: "space", label: "Space" },
  { value: "vintage", label: "Dark" },
  { value: "satellite", label: "Satellite" },
];

function getSavedBasemap() {
  if (typeof window === "undefined") return "system";

  try {
    const saved = window.localStorage.getItem(BASEMAP_STORAGE_KEY);
    return BASEMAP_OPTIONS.some((option) => option.value === saved)
      ? saved
      : "system";
  } catch {
    return "system";
  }
}

function getThemeBasemap(theme, resolvedTheme) {
  if (theme === "space") return "space";
  if (theme === "vintage") return "vintage";
  if (theme === "dark") return "night";
  if (theme === "light") return "light";

  return resolvedTheme === "dark" ? "night" : "light";
}

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

function MapBasemapSelector({ value, onChange }) {
  const activeOption = BASEMAP_OPTIONS.find((option) => option.value === value);

  return (
    <div className="absolute left-3 top-[108px] z-[1000]">
      <TooltipProvider delayDuration={350}>
        <Tooltip>
          <DropdownMenu>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Basemap: ${activeOption?.label || "System"}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border/80 bg-background/95 text-foreground shadow-md backdrop-blur transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Layers className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Basemap: {activeOption?.label || "System"}
            </TooltipContent>
            <DropdownMenuContent align="start" side="right" sideOffset={8}>
              <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
                {BASEMAP_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function MapPostPopup({ post }) {
  const actionDate = getActivityDate(post);
  const governance = Array.isArray(post?.governance) ? post.governance : [];
  const organization = governance[0] || null;
  const organizationLabel = organization ? getGovernanceLabel(organization) : null;
  const authorInitial = post?.author_name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-w-[220px] max-w-[280px] space-y-2 py-0.5">
      <div className="text-sm font-semibold leading-tight">
        {post?.title || "Untitled"}
      </div>

      {actionDate || organizationLabel || post?.author_avatar ? (
        <div className="flex items-center gap-2 border-t pt-2">
          {post?.author_avatar ? (
            <img
              src={post.author_avatar}
              alt={post.author_name || "Person"}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
              {authorInitial}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-0.5">
            {actionDate ? (
              <div className="text-xs text-muted-foreground">
                {format(actionDate, "d MMM yyyy")}
              </div>
            ) : null}
            {organizationLabel ? (
              <div className="truncate text-xs font-medium">
                {organizationLabel}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MapController({ onChange, boundary, boundaries, fitMarkers }) {
  const map = useMapEvents({ click(e) { onChange?.(e.latlng.lat, e.latlng.lng); } });
  const previousBoundaryKeyRef = useRef(null);
  const previousMarkerKeyRef = useRef(null);

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
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 18, animate: false });
      previousBoundaryKeyRef.current = boundaryKey;
    } else if (!primaryBoundary?.geojson) {
      previousBoundaryKeyRef.current = null;
    }
  }, [boundary, boundaries, map]);

  useEffect(() => {
    if (!fitMarkers) return;
    const valid = (fitMarkers || []).filter((item) => Number.isFinite(Number(item?.lat)) && Number.isFinite(Number(item?.lng)));
    const key = valid.map((item) => `${item.id || ""}:${item.lat}:${item.lng}`).join("|");
    if (!valid.length || key === previousMarkerKeyRef.current) return;
    const bounds = L.latLngBounds(valid.map((item) => [Number(item.lat), Number(item.lng)]));
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: false });
    previousMarkerKeyRef.current = key;
  }, [fitMarkers, map]);

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
        style={() => ({ color: stroke, weight: selected ? 4 : isDistrict || isJurisdiction ? 2.5 : 2, opacity: selected ? 1 : 0.9, fillColor: fill, fillOpacity: isDistrict ? 0.12 : isJurisdiction ? 0.1 : 0.1 })}
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
          {item.popupPost ? (
            <Popup closeButton className="citizen-action-map-popup" maxWidth={320} minWidth={240}>
              <MapPostPopup post={item.popupPost} />
            </Popup>
          ) : item.label ? (
            <Popup closeButton>{item.label}</Popup>
          ) : null}
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
  zoom = 15,
  fitMarkers = null,
}) {
  const { theme, resolvedTheme } = useTheme();
  const [basemapPreference, setBasemapPreference] = useState(getSavedBasemap);
  const safeLat = Number.isFinite(lat) ? lat : 19.076;
  const safeLng = Number.isFinite(lng) ? lng : 72.8777;
  const allMarkers = showMarker
    ? [{ id: "post-location", kind: "citizen", lat: safeLat, lng: safeLng, image_url: citizenMarker?.image_url || null, label: citizenMarker?.label || "Post location" }, ...markers]
    : markers;

  useEffect(() => {
    try {
      window.localStorage.setItem(BASEMAP_STORAGE_KEY, basemapPreference);
    } catch {
      // The map remains usable when browser storage is unavailable.
    }
  }, [basemapPreference]);

  const basemapId = basemapPreference === "system"
    ? getThemeBasemap(theme, resolvedTheme)
    : basemapPreference;

  return (
    <div className="relative z-0 isolate h-full w-full overflow-hidden">
      <MapBasemapSelector value={basemapPreference} onChange={setBasemapPreference} />
      <MapContainer center={[safeLat, safeLng]} zoom={zoom} className="relative z-0 h-full w-full">
        {basemapId === "satellite" ? (
          <TileLayer
            attribution="Satellite imagery"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <OpenFreeMapLayer styleId={basemapId} />
        )}

        <MapController onChange={onChange} boundary={boundary} boundaries={boundaries} fitMarkers={fitMarkers} />
        {boundary && <GeoJSON data={boundary} style={{ color: "#2563eb", weight: 2.5, opacity: 0.9, fillColor: "#3b82f6", fillOpacity: 0.1 }} />}
        <BoundaryGroup boundaries={boundaries} selectedId={selectedBoundaryId} onBoundaryClick={onBoundaryClick} />
        <MarkerGroup markers={allMarkers} />
      </MapContainer>
    </div>
  );
}
