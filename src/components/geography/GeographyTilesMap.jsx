"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { OPENFREEMAP_STYLES } from "@/config/maps/openFreeMap";

const TILESET_ID = "01a1c410-4845-77a6-bb9d-68585341ace3";
const SOURCE_ID = "citizenaction-geographies";
const FILL_LAYER_ID = "citizenaction-geography-fill";
const LINE_LAYER_ID = "citizenaction-geography-outline";
const SOURCE_LAYER_ID = "geographies";
const DEFAULT_GEOGRAPHY_FOCUS_ID = "6f3dda25-6cf4-43f2-a5b7-1c8aa9d2113f";
const TILESET_BOUNDS = [68.095, 6.7563, 97.4115, 37.077];

function getVectorTileTemplate(apiKey) {
  // MapLibre substitutes these literal placeholders when requesting each tile.
  // URL() encodes the braces (%7Bz%7D), which prevents tile-coordinate expansion.
  return `https://api.maptiler.com/tiles/${TILESET_ID}/{z}/{x}/{y}.pbf?key=${encodeURIComponent(apiKey)}`;
}

function buildFeatureFilter({ parentId, selectedId, category }) {
  const isCountryRoot = parentId === DEFAULT_GEOGRAPHY_FOCUS_ID;
  const childCategory = isCountryRoot ? "administrative" : category;
  const children = [
    "all",
    ["==", ["get", "parent_id"], parentId],
    ["==", ["get", "boundary_category"], childCategory],
    ["==", ["get", "status"], "active"],
    ...(isCountryRoot ? [["==", ["get", "geography_type"], "state"]] : []),
  ];

  if (!selectedId) return children;

  return ["any", ["==", ["get", "id"], selectedId], children];
}

function getFeaturePaint(category, selectedId) {
  return {
    fill: {
      "fill-color": [
        "case",
        ["==", ["get", "id"], selectedId || ""],
        "#f59e0b",
        category === "political" ? "#8b5cf6" : "#2563eb",
      ],
      "fill-opacity": [
        "case",
        ["==", ["get", "id"], selectedId || ""],
        0.3,
        0.16,
      ],
      "fill-outline-color": category === "political" ? "#7c3aed" : "#1d4ed8",
    },
    line: {
      "line-color": [
        "case",
        ["==", ["get", "id"], selectedId || ""],
        "#d97706",
        category === "political" ? "#7c3aed" : "#1d4ed8",
      ],
      "line-width": ["case", ["==", ["get", "id"], selectedId || ""], 3, 1.5],
      "line-opacity": 0.95,
    },
  };
}

export default function GeographyTilesMap({
  parentId = null,
  selectedId = null,
  category = "administrative",
  onFeatureClick,
  lat = 20.5937,
  lng = 78.9629,
  zoom = 4,
  fallbackBoundary = null,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onFeatureClickRef = useRef(onFeatureClick);
  const configRef = useRef({ parentId, selectedId, category });
  const lastFocusRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [tileStatus, setTileStatus] = useState("Connecting to map providers…");

  useEffect(() => {
    onFeatureClickRef.current = onFeatureClick;
    configRef.current = { parentId, selectedId, category };
  }, [onFeatureClick, parentId, selectedId, category]);

  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setMapError("MapTiler key is missing from this preview build.");
      return undefined;
    }
    if (!containerRef.current) return undefined;

    setMapError(null);
    setTileStatus("Loading OpenFreeMap basemap…");

    let cancelled = false;
    const map = new MapLibreMap({
      container: containerRef.current,
      // OpenFreeMap remains the basemap. MapTiler is used only for the
      // geography vector overlay registered below.
      style: OPENFREEMAP_STYLES.light.url,
      center: [Number(lng) || 78.9629, Number(lat) || 20.5937],
      zoom,
      attributionControl: true,
    });

    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: true }), "top-right");

    const updateVisibleFeatureStatus = () => {
      if (cancelled || !map.getLayer(FILL_LAYER_ID)) return;

      const visible = map.queryRenderedFeatures({ layers: [FILL_LAYER_ID] });
      if (visible.length) {
        setTileStatus(
          `MapTiler overlay loaded · ${visible.length} visible boundaries · ${SOURCE_LAYER_ID}`
        );
      } else if (map.isSourceLoaded(SOURCE_ID)) {
        setTileStatus(
          "MapTiler tiles loaded · no boundaries match the current view or filter."
        );
      } else {
        setTileStatus("Basemap ready · waiting for MapTiler vector tiles…");
      }
    };

    map.on("error", (event) => {
      const sourceId = event?.sourceId || event?.source?.id || "";
      const requestUrl = event?.error?.url || event?.source?.url || "";
      const message = event?.error?.message || "Unknown MapLibre rendering error";

      if (
        sourceId === SOURCE_ID ||
        requestUrl.includes("api.maptiler.com/tiles/")
      ) {
        setMapError(`MapTiler vector tile error: ${message}`);
      } else if (
        requestUrl.includes("openfreemap.org") ||
        requestUrl.includes("openmaptiles.org") ||
        !sourceId
      ) {
        setMapError(`OpenFreeMap basemap error: ${message}`);
      }
    });

    // Register the overlay only after the OpenFreeMap style is ready.
    // A direct PBF template avoids the redundant TileJSON fetch/lookup.
    map.once("style.load", () => {
      if (cancelled) return;

      try {
        setTileStatus("OpenFreeMap loaded · registering MapTiler geography tiles…");

        map.addSource(SOURCE_ID, {
          type: "vector",
          tiles: [getVectorTileTemplate(apiKey)],
          minzoom: 0,
          maxzoom: 9,
          bounds: TILESET_BOUNDS,
          promoteId: { [SOURCE_LAYER_ID]: "id" },
          attribution: "Geography boundaries © CitizenAction",
        });

        const currentConfig = configRef.current;
        const filter = buildFeatureFilter({
          parentId: currentConfig.parentId || DEFAULT_GEOGRAPHY_FOCUS_ID,
          selectedId: currentConfig.selectedId,
          category: currentConfig.category,
        });
        const paint = getFeaturePaint(
          currentConfig.category,
          currentConfig.selectedId
        );

        map.addLayer({
          id: FILL_LAYER_ID,
          type: "fill",
          source: SOURCE_ID,
          "source-layer": SOURCE_LAYER_ID,
          filter,
          paint: paint.fill,
        });

        map.addLayer({
          id: LINE_LAYER_ID,
          type: "line",
          source: SOURCE_ID,
          "source-layer": SOURCE_LAYER_ID,
          filter,
          paint: paint.line,
        });

        map.on("sourcedata", (event) => {
          if (event.sourceId === SOURCE_ID) updateVisibleFeatureStatus();
        });
        map.on("idle", updateVisibleFeatureStatus);

        map.on("click", FILL_LAYER_ID, (event) => {
          const properties = event.features?.[0]?.properties;
          if (!properties?.id) return;

          onFeatureClickRef.current?.({
            id: properties.id,
            name: properties.name || properties.official_name || "Unnamed boundary",
            official_name: properties.official_name || null,
            parent_id: properties.parent_id || null,
            geography_type: properties.geography_type || "other",
            boundary_category: properties.boundary_category || "administrative",
            status: properties.status || "active",
            center: null,
          });
        });

        map.on("mouseenter", FILL_LAYER_ID, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", FILL_LAYER_ID, () => {
          map.getCanvas().style.cursor = "";
        });

        setTileStatus("MapTiler vector source registered · requesting PBF tiles…");
      } catch (error) {
        setMapError(
          `MapTiler source/layer registration failed: ${error?.message || "Unknown error"}`
        );
      }
    });

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
    };
  }, [apiKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const focusKey = [selectedId || parentId || "india", lat, lng, zoom].join(":");
    if (lastFocusRef.current !== focusKey) {
      map.flyTo({
        center: [Number(lng) || 78.9629, Number(lat) || 20.5937],
        zoom,
        duration: 450,
      });
      lastFocusRef.current = focusKey;
    }

    if (!map.getLayer(FILL_LAYER_ID) || !map.getLayer(LINE_LAYER_ID)) return;

    const filter = buildFeatureFilter({
      parentId: parentId || DEFAULT_GEOGRAPHY_FOCUS_ID,
      selectedId,
      category,
    });
    const paint = getFeaturePaint(category, selectedId);

    map.setFilter(FILL_LAYER_ID, filter);
    map.setFilter(LINE_LAYER_ID, filter);
    map.setPaintProperty(FILL_LAYER_ID, "fill-color", paint.fill["fill-color"]);
    map.setPaintProperty(FILL_LAYER_ID, "fill-opacity", paint.fill["fill-opacity"]);
    map.setPaintProperty(
      FILL_LAYER_ID,
      "fill-outline-color",
      paint.fill["fill-outline-color"]
    );
    map.setPaintProperty(LINE_LAYER_ID, "line-color", paint.line["line-color"]);
    map.setPaintProperty(LINE_LAYER_ID, "line-width", paint.line["line-width"]);
  }, [parentId, selectedId, category, lat, lng, zoom]);

  return (
    <div className="relative h-full min-h-[180px] w-full">
      <div ref={containerRef} className="h-full min-h-[180px] w-full" />
      {mapError ? (
        <div className="absolute bottom-3 left-3 right-3 rounded-md border border-destructive/30 bg-background/95 px-3 py-2 text-xs text-destructive shadow">
          Map unavailable: {mapError}
        </div>
      ) : (
        <div className="absolute bottom-3 left-3 max-w-[min(90%,520px)] rounded-md border bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow">
          {tileStatus}
        </div>
      )}
    </div>
  );
}
