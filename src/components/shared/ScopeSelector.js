import { useState } from "react";
import { useGeographicScopes } from "@/hooks/useGeographicScopes";
import { SCOPE_CONFIG } from "@/config/scopeConfig";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Props:
 * value: { scope_type, scope_code }
 * onChange: ({ scope_type, scope_code }) => void
 */
export default function ScopeSelector({ value, onChange }) {
  const { scope_type, scope_code } = value;

  // LOCAL UI STATE (important!)
  const [selectedCity, setSelectedCity] = useState("");

  // Fetch data
  const regionQuery = useGeographicScopes({
    type: "region",
    enabled: scope_type === "region",
  });

  const cityQuery = useGeographicScopes({
    type: "city",
    enabled: scope_type === "city" || scope_type === "ward",
  });

  const wardQuery = useGeographicScopes({
    type: "ward",
    parentCode: selectedCity,
    enabled: scope_type === "ward" && !!selectedCity,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* SCOPE TYPE */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          At what level does your club represent?
        </label>

        <Select
          value={scope_type}
          onValueChange={(type) => {
            setSelectedCity("");
            onChange({ scope_type: type, scope_code: "" });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select scope" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SCOPE_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* REGION */}
      {scope_type === "region" && (
        <LabeledSelect
          label="Region"
          data={regionQuery.data}
          value={scope_code}
          onChange={(v) =>
            onChange({ scope_type, scope_code: v })
          }
        />
      )}

      {/* CITY */}
      {(scope_type === "city" || scope_type === "ward") && (
        <LabeledSelect
          label="City"
          data={cityQuery.data}
          value={scope_type === "city" ? scope_code : selectedCity}
          onChange={(v) => {
            setSelectedCity(v);
            if (scope_type === "city") {
              onChange({ scope_type, scope_code: v });
            }
          }}
        />
      )}

      {/* WARD */}
      {scope_type === "ward" && (
        <LabeledSelect
          label="Ward"
          data={wardQuery.data}
          value={scope_code}
          disabled={!selectedCity}
          onChange={(v) =>
            onChange({ scope_type, scope_code: v })
          }
        />
      )}
    </div>
  );
}

/* ---------------------------------- */
/* Reusable shadcn Select */
/* ---------------------------------- */
function LabeledSelect({ label, data, value, onChange, disabled }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {data?.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
