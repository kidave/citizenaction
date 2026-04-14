"use client";

import { useState } from "react";
import { useGeographicScopes } from "@/hooks/geography/useGeographicScopes";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/**
 * PROPS
 * value: { scope_type, scope_code }
 * onChange: ({ scope_type, scope_code }) => void
 * allowedTypes: ['city','ward'] etc
 * allowClear: boolean
 */
export default function ScopeSelector({
  value,
  onChange,
  allowedTypes = ["country", "state", "region", "city", "ward"],
  allowClear = false,
}) {
  const { scope_type, scope_code } = value || {};

  const [parentCode, setParentCode] = useState(null);

  /* -------------------------
     FETCH DATA
  ------------------------- */

  const countryQuery = useGeographicScopes({
    type: "country",
    enabled: allowedTypes.includes("country"),
  });

  const stateQuery = useGeographicScopes({
    type: "state",
    enabled: allowedTypes.includes("state"),
  });

  const regionQuery = useGeographicScopes({
    type: "region",
    enabled: allowedTypes.includes("region"),
  });

  const cityQuery = useGeographicScopes({
    type: "city",
    enabled:
      allowedTypes.includes("city") || allowedTypes.includes("ward"),
  });

  const wardQuery = useGeographicScopes({
    type: "ward",
    parentCode,
    enabled: scope_type === "ward" && !!parentCode,
  });

  /* -------------------------
     RESET
  ------------------------- */

  function handleTypeChange(type) {
    setParentCode(null);
    onChange({ scope_type: type, scope_code: "" });
  }

  function handleChange(code) {
    onChange({
      scope_type,
      scope_code: code,
    });
  }

  /* -------------------------
     UI
  ------------------------- */

  return (
    <div className="space-y-2">

      {/* TYPE */}
      <Select value={scope_type || ""} onValueChange={handleTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select level" />
        </SelectTrigger>
        <SelectContent>
          {allowedTypes.map((t) => (
            <SelectItem key={t} value={t}>
              {t.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* COUNTRY */}
      {scope_type === "country" && (
        <Dropdown
          data={countryQuery.data}
          value={scope_code}
          onChange={handleChange}
        />
      )}

      {/* STATE */}
      {scope_type === "state" && (
        <Dropdown
          data={stateQuery.data}
          value={scope_code}
          onChange={handleChange}
        />
      )}

      {/* REGION */}
      {scope_type === "region" && (
        <Dropdown
          data={regionQuery.data}
          value={scope_code}
          onChange={handleChange}
        />
      )}

      {/* CITY */}
      {(scope_type === "city" || scope_type === "ward") && (
        <Dropdown
          data={cityQuery.data}
          value={scope_type === "city" ? scope_code : parentCode}
          onChange={(v) => {
            setParentCode(v);
            if (scope_type === "city") handleChange(v);
          }}
        />
      )}

      {/* WARD */}
      {scope_type === "ward" && (
        <Dropdown
          data={wardQuery.data}
          value={scope_code}
          disabled={!parentCode}
          onChange={handleChange}
        />
      )}

      {/* CLEAR */}
      {allowClear && (
        <button
          className="text-xs text-muted-foreground"
          onClick={() =>
            onChange({ scope_type: "", scope_code: "" })
          }
        >
          Clear
        </button>
      )}
    </div>
  );
}

/* ---------------------------------- */

function Dropdown({ data, value, onChange, disabled }) {
  return (
    <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {data?.map((item) => (
          <SelectItem key={item.code} value={item.code}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}