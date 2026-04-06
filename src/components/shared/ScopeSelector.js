"use client";

import { useGeographicScopes } from "@/hooks/useGeographicScopes";
import { COUNTRY_CODE } from "@/config/scopeConfig";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ScopeSelector({
  value,
  onChange,
}) {
  /* -------------------------
     SAFE VALUE (INDIA DEFAULT)
  ------------------------- */
  const safeValue = value || {
    country: COUNTRY_CODE, // always IN
    state: "",
    region: "",
    city: "",
  };

  /* -------------------------
     QUERIES
  ------------------------- */

  const stateQuery = useGeographicScopes({
    type: "state",
  });

  // ✅ region works even without state
  const regionQuery = useGeographicScopes({
    type: "region",
    parentCode: safeValue.state || null,
    enabled: true,
  });

  const cityQuery = useGeographicScopes({
    type: "city",
    parentCode: safeValue.region || safeValue.state || null,
    enabled: true,
  });

  /* -------------------------
     UPDATE HELPER
  ------------------------- */
  function update(next) {
    onChange({
      country: COUNTRY_CODE,
      state: next.state ?? safeValue.state,
      region: next.region ?? safeValue.region,
      city: next.city ?? safeValue.city,
    });
  }

  /* -------------------------
     BACKSPACE LOGIC 🔥
  ------------------------- */
  function handleKeyDown(e) {
    if (e.key !== "Backspace") return;

    if (safeValue.city) {
      update({ city: "" });
    } else if (safeValue.region) {
      update({ region: "", city: "" });
    } else if (safeValue.state) {
      update({ state: "", region: "", city: "" });
    }
  }

  /* -------------------------
     CHANGE HANDLERS
  ------------------------- */

  function handleStateChange(code) {
    update({
      state: code,
      region: "",
      city: "",
    });
  }

  function handleRegionChange(code) {
    const region = regionQuery.data?.find((r) => r.code === code);
    if (!region) return;

    update({
      state: region.parent_code, // always state
      region: code,
      city: "",
    });
  }

  function handleCityChange(code) {
    const city = cityQuery.data?.find((c) => c.code === code);
    if (!city) return;

    let nextState = safeValue.state;
    let nextRegion = "";

    /* -------------------------
       city → region → state
    ------------------------- */
    if (city.grandparent_code) {
      nextRegion = city.parent_code;
      nextState = city.grandparent_code;
    }

    /* -------------------------
       city → state
    ------------------------- */
    else if (city.parent_code) {
      nextState = city.parent_code;
      nextRegion = "";
    }

    update({
      state: nextState,
      region: nextRegion,
      city: code,
    });
  }

  /* -------------------------
     UI
  ------------------------- */

  return (
    <div
      className="flex flex-wrap gap-2 items-center"
      tabIndex={0} // needed for backspace
      onKeyDown={handleKeyDown}
      onClick={(e) => e.currentTarget.focus()} // auto-focus
    >

      {/* STATE */}
      <Select
        value={safeValue.state}
        onValueChange={handleStateChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="State" />
        </SelectTrigger>

        <SelectContent>
          {stateQuery.data?.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* REGION */}
      <Select
        value={safeValue.region}
        onValueChange={handleRegionChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Region" />
        </SelectTrigger>

        <SelectContent>
          {regionQuery.data?.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* CITY */}
      <Select
        value={safeValue.city}
        onValueChange={handleCityChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="City" />
        </SelectTrigger>

        <SelectContent>
          {cityQuery.data?.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

    </div>
  );
}