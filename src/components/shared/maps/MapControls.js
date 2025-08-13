// components/shared/MapControls.js
"use client";

import { tileLayers } from "./utils/layerStyles";

export default function MapControls({ currentLayer, onLayerChange }) {
  return (
    <div className="layer-controls">
      {Object.entries(tileLayers).map(([key, layer]) => (
        <button
          key={key}
          className={`layer-button ${currentLayer === key ? "active" : ""}`}
          onClick={() => onLayerChange(key)}
        >
          {layer.name}
        </button>
      ))}
    </div>
  );
}
