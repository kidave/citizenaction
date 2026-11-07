"use client";

import { createElementObject, createLayerComponent } from "@react-leaflet/core";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { setWorkerUrl } from "maplibre-gl";

import { OPENFREEMAP_STYLES } from "@/config/maps/openFreeMap";

// The worker is copied from MapLibre's ESM distribution into /public at install
// time so it can be loaded as a same-origin module worker by Next.js.
if (typeof window !== "undefined") {
  setWorkerUrl(new URL("/maplibre-gl-worker.mjs", window.location.origin).toString());
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

export default function OpenFreeMapLayer({ styleId = "positron" }) {
  const style = OPENFREEMAP_STYLES[styleId] || OPENFREEMAP_STYLES.positron;

  return <MapLibreLayer styleUrl={style.url} />;
}
