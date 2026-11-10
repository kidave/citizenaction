"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { OPENFREEMAP_STYLES } from "@/config/maps/openFreeMap";

const TILESET_ID = "01a1c410-4845-77a6-bb9d-68585341ace3";
const DEFAULT_GEOGRAPHY_FOCUS_ID = "6f3dda25-6cf4-43f2-a5b7-1c8aa9d2113f";

function getTileJsonUrl(apiKey) {
  const url = new URL(`https://api.maptiler.com/tiles/${TILESET_ID}/tiles.json`);
  url.searchParams.set("key", apiKey);
  return url.toString();
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

  return [
    "any",
    ["==", ["get", "id"], selectedId],
    children,
  ];
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
  const [tileStatus, setTileStatus] = useState("Loading MapTiler vector tiles…");

  useEffect(() => {
    onFeatureClickRef.current = onFeatureClick;
    configRef.current = { parentId, selectedId, category };
  }, [onFeatureClick, parentId, selectedId, category]);
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setMapError("MapTiler key is missing from this preview build. Redeploy after setting NEXT_PUBLIC_MAPTILER_API_KEY.");
      return undefined;
    }
    if (!containerRef.current) return undefined;

    setMapError(null);
    setTileStatus("Loading MapTiler vector tiles…");
    let cancelled = false;
    let map;

    const initialize = async () => {
      try {
        const tileJsonUrl = getTileJsonUrl(apiKey);
        const response = await fetch(tileJsonUrl);
        if (!response.ok) {
          throw new Error(`MapTiler metadata request failed (${response.status}).`);
        }

        const tileJson = await response.json();
        const vectorLayer = (tileJson.vector_layers || []).find((layer) =>
          layer.fields?.parent_id && layer.fields?.boundary_category
        ) || tileJson.vector_layers?.[0];

        if (!vectorLayer?.id) {
          throw new Error("The MapTiler tileset does not expose a vector layer.");
        }
        if (cancelled || !containerRef.current) return;

        map = new MapLibreMap({
          container: containerRef.current,
          style: OPENFREEMAP_STYLES.light.url,
          center: [Number(lng) || 78.9629, Number(lat) || 20.5937],
          zoom,
          attributionControl: true,
        });
        mapRef.current = map;
        map.addControl(new NavigationControl({ showCompass: true }), "top-right");
        map.on("error", (event) => {
          const message = event?.error?.message || "Map rendering error";
          const sourceId = event?.sourceId || "";
          const sourceUrl = event?.source?.url || "";
          if (sourceId === "citizenaction-geographies" || sourceUrl.includes("api.maptiler.com")) setMapError(message);
        });

        map.once("load", () => {
          if (cancelled) return;
          map.addSource("citizenaction-geographies", {
            type: "vector",
            url: tileJsonUrl,
            promoteId: "id",
          });

          const sourceLayer = vectorLayer.id;
          const currentConfig = configRef.current;
          const featureFilter = buildFeatureFilter({
            parentId: currentConfig.parentId || DEFAULT_GEOGRAPHY_FOCUS_ID,
            selectedId: currentConfig.selectedId,
            category: currentConfig.category,
          });

          map.addLayer({
            id: "citizenaction-geography-fill",
            type: "fill",
            source: "citizenaction-geographies",
            "source-layer": sourceLayer,
            filter: featureFilter,
            paint: {
              "fill-color": [
                "case",
                ["==", ["get", "id"], selectedId || ""],
                "#f59e0b",
                category === "political" ? "#8b5cf6" : "#2563eb",
              ],
              "fill-opacity": [
                "case",
                ["==", ["get", "id"], selectedId || ""],
                0.24,
                0.1,
              ],
            },
          });

          map.addLayer({
            id: "citizenaction-geography-outline",
            type: "line",
            source: "citizenaction-geographies",
            "source-layer": sourceLayer,
            filter: featureFilter,
            paint: {
              "line-color": [
                "case",
                ["==", ["get", "id"], selectedId || ""],
                "#d97706",
                category === "political" ? "#7c3aed" : "#1d4ed8",
              ],
              "line-width": [
                "case",
                ["==", ["get", "id"], selectedId || ""],
                3,
                1.5,
              ],
              "line-opacity": 0.95,
            },
          });

          map.on("click", "citizenaction-geography-fill", (event) => {
            const feature = event.features?.[0];
            const properties = feature?.properties;
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
          map.on("mouseenter", "citizenaction-geography-fill", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "citizenaction-geography-fill", () => {
            map.getCanvas().style.cursor = "";
          });
          map.once("idle", () => {
            if (cancelled) return;
            const visible = map.queryRenderedFeatures({ layers: ["citizenaction-geography-fill"] });
            setTileStatus(visible.length
              ? `MapTiler loaded · ${visible.length} visible boundaries`
              : "MapTiler connected, but no boundaries match this hierarchy filter. Check tileset properties and upload version.");
          });
        });
      } catch (error) {
        if (!cancelled) setMapError(error?.message || "Unable to load geography tiles.");
      }
    };

    initialize();

    return () => {
      cancelled = true;
      map?.remove();
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
    if (!map.getLayer("citizenaction-geography-fill")) return;

    const filter = buildFeatureFilter({
      parentId: parentId || DEFAULT_GEOGRAPHY_FOCUS_ID,
      selectedId,
      category,
    });
    map.setFilter("citizenaction-geography-fill", filter);
    map.setFilter("citizenaction-geography-outline", filter);
    map.setPaintProperty("citizenaction-geography-fill", "fill-color", [
      "case",
      ["==", ["get", "id"], selectedId || ""],
      "#f59e0b",
      category === "political" ? "#8b5cf6" : "#2563eb",
    ]);
    map.setPaintProperty("citizenaction-geography-outline", "line-color", [
      "case",
      ["==", ["get", "id"], selectedId || ""],
      "#d97706",
      category === "political" ? "#7c3aed" : "#1d4ed8",
    ]);
  }, [parentId, selectedId, category, lat, lng, zoom]);

  return (
    <div className="relative h-full min-h-[180px] w-full">
      <div ref={containerRef} className="h-full min-h-[180px] w-full" />
      {mapError ? (
        <div className="absolute bottom-3 left-3 right-3 rounded-md border border-destructive/30 bg-background/95 px-3 py-2 text-xs text-destructive shadow">
          MapTiler unavailable: {mapError}
        </div>
      ) : (
        <div className="absolute bottom-3 left-3 rounded-md border bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow">
          {tileStatus}
        </div>
      )}
    </div>
  );
}
