"use client";

import { useState } from "react";
import { AddressAutofill } from "@mapbox/search-js-react";

export default function LocationSearchMapbox({ onSelect }) {
  const [value, setValue] = useState("");

  return (
    <AddressAutofill
      accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      onRetrieve={(res) => {
        const feature = res.features[0];

        if (!feature) return;

        const [lng, lat] = feature.geometry.coordinates;

        onSelect({
          name: feature.place_name,
          lat,
          lng,
          address: feature.properties,
          place_id: feature.id,
        });
      }}
    >
      <input
        autoComplete="address-line1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search location"
        className="w-full border rounded-md px-3 py-2 text-sm"
      />
    </AddressAutofill>
  );
}