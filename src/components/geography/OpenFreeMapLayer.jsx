"use client";

import { createElementObject, createLayerComponent } from "@react-leaflet/core";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { getVersion, setWorkerUrl } from "maplibre-gl";

import { OPENFREEMAP_STYLES } from "@/config/maps/openFreeMap";

// MapLibre GL JS v6 uses a module worker that imports a sibling shared chunk.
// Both files are copied into /public during install so the worker can load from
// the same origin in Next.js production deployments.
if (typeof window !== "undefined") {
  const workerUrl = new URL("/maplibre-gl-worker.mjs", window.location.origin);
  workerUrl.searchParams.set("v", getVersion());
  setWorkerUrl(workerUrl.toString());
}

function createOpenFreeMapLayer(props, context) {
  const instance = maplibreGL({
    style: props.styleUrl,
    interactive: false,
    pane: "tilePane",
  });

  return createElementObject(instance, context);
}

function updateOpenFreeMapLayer(layer, props, previousProps) {
  if (props.styleUrl !== previousProps.styleUrl) {
    layer.getMaplibreMap()?.setStyle(props.styleUrl);
  }
}

const MapLibreLayer = createLayerComponent(
  createOpenFreeMapLayer,
  updateOpenFreeMapLayer,
);

export default function OpenFreeMapLayer({ styleId = "light" }) {
  const style = OPENFREEMAP_STYLES[styleId] || OPENFREEMAP_STYLES.light;

  return <MapLibreLayer styleUrl={style.url} />;
}
