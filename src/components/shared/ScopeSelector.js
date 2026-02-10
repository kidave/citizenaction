// components/ScopeSelector.js
import { useState, useEffect } from "react";
import { SCOPE_CONFIG, SCOPE_TYPES, COUNTRY_CODE } from "@/config/ScopeConfig";
import { useGeographicScopes } from "@/hooks/useGeographicScopes";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ScopeSelector({ onScopeChange }) {
  const [scopeType, setScopeType] = useState("city");

  // selections
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  const config = SCOPE_CONFIG[scopeType];

  // -----------------------------
  // DATA FETCHING (CONFIG DRIVEN)
  // -----------------------------

  const cityQuery = useGeographicScopes({
    type: "city",
    enabled: scopeType === "city" || scopeType === "ward",
  });

  const wardQuery = useGeographicScopes({
    type: "ward",
    parentCode: selectedCity,
    enabled: scopeType === "ward" && !!selectedCity,
  });

  const regionQuery = useGeographicScopes({
    type: "region",
    enabled: scopeType === "region",
  });

  // -----------------------------
  // EFFECT: notify parent
  // -----------------------------

  useEffect(() => {
    if (scopeType === "region" && regionQuery.data?.length) {
      // wait for user selection
      onScopeChange("", "");
    }

    if (scopeType === "city" && selectedCity) {
      onScopeChange("city", selectedCity);
    }

    if (scopeType === "ward" && selectedWard) {
      onScopeChange("ward", selectedWard);
    }
  }, [scopeType, selectedCity, selectedWard]);

  // -----------------------------
  // RESET on scope change
  // -----------------------------

  const handleScopeTypeChange = (type) => {
    setScopeType(type);
    setSelectedCity("");
    setSelectedWard("");
    onScopeChange("", "");
  };

  const getCurrentScopeCode = () => {
    if (scopeType === "region") return selectedRegion;
    if (scopeType === "city") return selectedCity;
    if (scopeType === "ward") return selectedWard;
    return "";
  };

  const isScopeComplete = () => {
    return Boolean(getCurrentScopeCode());
  };


  // -----------------------------
  // RENDER
  // -----------------------------

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* SCOPE TYPE */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          At what level does your club represent?
        </label>

        <Select value={scopeType} onValueChange={handleScopeTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="region">Region</SelectItem>
            <SelectItem value="city">City</SelectItem>
            <SelectItem value="ward">Ward</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* REGION */}
      {scopeType === "region" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Region</label>
          <Select onValueChange={(v) => onScopeChange("region", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regionQuery.data?.map((r) => (
                <SelectItem key={r.code} value={r.code}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* CITY */}
      {(scopeType === "city" || scopeType === "ward") && (
        <div className="space-y-2">
          <label className="text-sm font-medium">City</label>
          <Select
            value={selectedCity}
            onValueChange={(v) => {
              setSelectedCity(v);
              if (scopeType === "city") {
                onScopeChange("city", v);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cityQuery.data?.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* WARD */}
      {scopeType === "ward" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Ward</label>
          <Select
            value={selectedWard}
            disabled={!selectedCity}
            onValueChange={(v) => {
              setSelectedWard(v);
              onScopeChange("ward", v);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ward" />
            </SelectTrigger>
            <SelectContent>
              {wardQuery.data?.map((w) => (
                <SelectItem key={w.code} value={w.code}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Validation Status */}
      <div className="p-3 bg-muted/30 rounded-md">
        <p className="text-sm font-medium mb-1">Location:</p>
        <p className="text-sm">
          {isScopeComplete() ? (
            <span className="text-green-600 capitalize">✓ {scopeType} ({getCurrentScopeCode()})</span>
          ) : (
            <span className="text-amber-600">Please select all required fields</span>
          )}
        </p>
      </div>
    </div>
  );
}
