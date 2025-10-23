"use client";

import { useEffect, useRef, useState } from "react";
import MapContainer from "components/shared/maps/MapContainer";
import CustomMarker from "components/shared/maps/CustomMarker";
import BoundaryLayer from "components/shared/maps/BoundaryLayer";
import { transformCoordinates } from "components/shared/maps/utils/coordinateUtils";
import { useWardBoundary } from "hooks/useWardData";

export default function JunctionMap({
  junctions,
  selectedJunction,
  onJunctionSelect,
  center = [19.076, 72.8777],
  zoom = 12,
  wardId,
}) {
  const mapRef = useRef(null);
  const { data: boundary } = useWardBoundary(wardId);
  const [mapReady, setMapReady] = useState(false);
  const previousJunctionRef = useRef(null);

  // Handle map initialization
  const handleMapInit = (map) => {
    mapRef.current = map;
    setMapReady(true);
  };

  // Fly to selected junction with smooth animation
  useEffect(() => {
    if (!mapRef.current || !selectedJunction || !mapReady) return;

    try {
      let lat = selectedJunction.latitude;
      let lng = selectedJunction.longitude;

      // Transform coordinates if needed
      [lng, lat] = transformCoordinates([lng, lat]);

      if (isNaN(lat) || isNaN(lng)) return;

      const currentZoom = mapRef.current.getZoom();
      const targetZoom = 17; // Direct zoom level for junctions
      
      // Smooth fly to the selected junction
      mapRef.current.flyTo([lat, lng], targetZoom, {
        animate: true,
        duration: 1.2, // Smooth duration
        easeLinearity: 0.25,
      });

      previousJunctionRef.current = selectedJunction;

    } catch (error) {
      console.error("Error flying to junction:", error);
    }
  }, [selectedJunction, mapReady]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        onMapInit={handleMapInit}
        className="junction-map-container"
      >
        {/* Boundary Layer */}
        {mapReady && boundary && (
          <BoundaryLayer
            map={mapRef.current}
            boundary={boundary}
            wardId={wardId}
          />
        )}

        {/* Junction Markers */}
        {mapReady && junctions?.map((junction) => {
          let lat = junction.latitude;
          let lng = junction.longitude;

          [lng, lat] = transformCoordinates([lng, lat]);
          if (isNaN(lat) || isNaN(lng)) return null;

          const isSelected = selectedJunction?.fid === junction.fid;

          return (
            <CustomMarker
              key={junction.fid}
              map={mapRef.current}
              position={[lat, lng]}
              isSelected={isSelected}
              popupContent={`
                <strong>${junction.name || "Unnamed Junction"}</strong>
                ${junction.suggested_design ? `<br>${junction.suggested_design}` : ''}
              `}
              onClick={onJunctionSelect ? () => onJunctionSelect(junction) : null}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}