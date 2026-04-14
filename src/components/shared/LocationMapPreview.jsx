"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./LeafletMap"), {
  ssr: false,
});

export default function LocationMapPreview({ lat, lng, onChange }) {
  if (!lat || !lng) return null;

  return <Map lat={lat} lng={lng} onChange={onChange} />;
}