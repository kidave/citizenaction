"use client";

import { useTheme } from "next-themes";
import { createElementObject, createLayerComponent } from "@react-leaflet/core";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";

import { resolveOpenFreeMapStyle } from "@/config/maps/openFreeMap";

function createOpenFreeMapLayer(props, context) {
  const instance = maplibreGL({
    style: props.styleUrl,
    interactive: false,
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

export default function OpenFreeMapLayer() {
  const { theme, resolvedTheme } = useTheme();
  const style = resolveOpenFreeMapStyle(theme, resolvedTheme);

  return <MapLibreLayer styleUrl={style.url} />;
}
