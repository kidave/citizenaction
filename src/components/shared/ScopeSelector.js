"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useGeographicScopes } from "@/hooks/geography/useGeographicScopes";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ScopeSelector({
  value,
  onChange,
  parent = "region", // future-ready
}) {
  const [region, setRegion] = useState(null);
  const [city, setCity] = useState(null);
  const [ward, setWard] = useState(null);

  /* ---------------- FETCH ---------------- */

  const { data: regions = [] } = useGeographicScopes({
    type: "region",
    enabled: parent === "region" || parent === "state",
  });

  const { data: cities = [] } = useGeographicScopes({
    type: "city",
    parentCode: region,
    enabled: !!region,
  });

  const { data: wards = [] } = useGeographicScopes({
    type: "ward",
    parentCode: city,
    enabled: !!city,
  });

  /* ---------------- SYNC FROM VALUE ---------------- */

  useEffect(() => {
    if (!value?.scope_code) {
      setRegion(null);
      setCity(null);
      setWard(null);
      return;
    }

    if (value.scope_type === "region") {
      setRegion(value.scope_code);
      setCity(null);
      setWard(null);
    }

    if (value.scope_type === "city") {
      setCity(value.scope_code);
      setWard(null);
    }

    if (value.scope_type === "ward") {
      setWard(value.scope_code);
    }
  }, [value]);

  /* ---------------- UPDATE ---------------- */

  function updateFromSelection(r, c, w) {
    if (w) return onChange?.({ scope_type: "ward", scope_code: w });
    if (c) return onChange?.({ scope_type: "city", scope_code: c });
    if (r) return onChange?.({ scope_type: "region", scope_code: r });

    return onChange?.({ scope_type: null, scope_code: null });
  }

  /* ---------------- HANDLERS ---------------- */

  function selectRegion(code) {
    setRegion(code);
    setCity(null);
    setWard(null);
    updateFromSelection(code, null, null);
  }

  function selectCity(code) {
    setCity(code);
    setWard(null);
    updateFromSelection(region, code, null);
  }

  function selectWard(code) {
    setWard(code);
    updateFromSelection(region, city, code);
  }

  function clearAll() {
    setRegion(null);
    setCity(null);
    setWard(null);
    updateFromSelection(null, null, null);
  }

  /* ---------------- BACKSPACE UX (IMPORTANT) ---------------- */

  function handleKeyDown(e) {
    if (e.key !== "Backspace") return;

    if (ward) {
      setWard(null);
      updateFromSelection(region, city, null);
    } else if (city) {
      setCity(null);
      updateFromSelection(region, null, null);
    } else if (region) {
      clearAll();
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div
      className="flex items-center gap-2 w-full overflow-x-auto scrollbar-hide"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* REGION */}
      <Dropdown
        data={regions}
        value={region}
        onChange={selectRegion}
        placeholder="Region"
      />

      {/* CITY */}
      <Dropdown
        data={cities}
        value={city}
        onChange={selectCity}
        placeholder="City"
        disabled={!region}
      />

      {/* WARD */}
      <Dropdown
        data={wards}
        value={ward}
        onChange={selectWard}
        placeholder="Ward"
        disabled={!city}
      />

      {/* CLEAR */}
      {(region || city || ward) && (
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:underline whitespace-nowrap"
        >
          Clear
        </button>
      )}
    </div>
  );
}

/* ---------------- DROPDOWN ---------------- */

function Dropdown({ data, value, onChange, placeholder, disabled }) {
  const selected = data?.find((d) => d.code === value);

  return (
    <Select value={value ?? ""} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-9 text-xs min-w-[120px] max-w-[180px]">

        {selected ? (
          <div className="flex items-center gap-2 w-full overflow-hidden">
            {selected.logo_url && (
              <Image
                src={selected.logo_url}
                alt={selected.name}
                width={16}
                height={16}
                className="shrink-0 rounded-sm"
              />
            )}

            {/* 🔥 FIX: prevent overflow */}
            <span className="truncate">
              {selected.name}
            </span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}

      </SelectTrigger>

      <SelectContent>
        {data?.map((item) => (
          <SelectItem key={item.code} value={item.code}>
            <div className="flex items-center gap-2">
              {item.logo_url && (
                <Image
                  src={item.logo_url}
                  alt={item.name}
                  width={16}
                  height={16}
                  className="rounded-sm"
                />
              )}
              <span className="truncate">
                {item.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}