"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";

const LeafletMap = dynamic(() => import("@/components/shared/LeafletMap"), { ssr: false });

const INDIA = {
  osm_type: "relation",
  osm_id: 304716,
  name: "India",
  admin_level: 2,
  center: { lat: 20.5937, lng: 78.9629 },
  boundary: "administrative",
  ref: "IN",
};

const DEFAULT_CENTER = INDIA.center;
const TYPE_LABELS = {
  4: "State / Union territory",
  5: "District",
  6: "Subdistrict / Taluka",
  8: "Local government",
  9: "Zone",
  10: "Ward",
};

function displayType(item) {
  if (item?.local_authority === "metropolitan_area") return "Metropolitan area";
  if (item?.local_authority === "municipal_corporation") return "Municipal Corporation";
  if (item?.local_authority === "municipality") return "Municipality";
  if (item?.local_authority === "city_council") return "City Council";
  if (item?.local_authority === "nagar_panchayat") return "Nagar Panchayat";
  if (item?.local_authority === "gram_panchayat") return "Gram Panchayat";
  if (item?.local_authority === "municipal_corporation_zone") return "Zone";
  if (item?.local_authority === "ward") return "Ward";
  return TYPE_LABELS[item?.admin_level] || "Administrative area";
}

function normalizeItem(item) {
  if (!item) return null;
  const center = item.center
    ? {
        lat: Number(item.center.lat),
        lng: Number(item.center.lng ?? item.center.lon),
      }
    : null;

  return {
    osm_type: item.osm_type,
    osm_id: item.osm_id,
    name: item.name,
    official_name: item.official_name || null,
    admin_level: Number(item.admin_level) || null,
    center,
    geojson: item.geojson || null,
    boundary: item.boundary || null,
    local_authority: item.local_authority || null,
    ward: item.ward || null,
    ref: item.ref || null,
  };
}

function selectionValue(item, geometry) {
  return {
    ...normalizeItem(item),
    center: normalizeItem(item)?.center || DEFAULT_CENTER,
    geojson: geometry || item?.geojson || null,
  };
}

async function fetchCachedBoundaries({ parentOsmId = null, adminLevel }) {
  let query = supabase
    .from("osm_jurisdiction_cache")
    .select("osm_type, osm_id, name, official_name, admin_level, boundary, local_authority, ward, ref, center, geojson")
    .eq("admin_level", adminLevel)
    .order("name", { ascending: true })
    .limit(1000);

  if (parentOsmId) {
    query = query.eq("parent_osm_type", "relation").eq("parent_osm_id", parentOsmId);
  } else {
    query = query.is("parent_osm_id", null);
  }

  const { data, error } = await query;
  if (error || !Array.isArray(data) || !data.length) return [];
  return data.map(normalizeItem).filter(Boolean);
}

async function fetchBoundaryList({ parentOsmId = null, adminLevel, stateName = null }) {
  const cached = await fetchCachedBoundaries({ parentOsmId, adminLevel });
  if (cached.length) return cached;

  const params = new URLSearchParams({
    list: "1",
    include_geometry: "0",
    limit: "1000",
  });

  if (parentOsmId) params.set("parent_osm_id", String(parentOsmId));
  if (adminLevel) params.set("admin_level", String(adminLevel));
  if (stateName) params.set("state_name", stateName);

  const response = await fetch(`/api/osm-admin?${params.toString()}`);
  if (!response.ok) throw new Error("Unable to load administrative boundaries");

  const data = await response.json();
  return Array.isArray(data?.results) ? data.results.map(normalizeItem).filter(Boolean) : [];
}

async function fetchSelectedGeometry(item) {
  const response = await fetch(
    `/api/osm-admin-lookup?osm_type=${encodeURIComponent(item.osm_type)}&osm_id=${encodeURIComponent(item.osm_id)}`,
  );
  if (!response.ok) throw new Error("Boundary lookup failed");
  const data = await response.json();
  return data?.feature?.geometry || null;
}

function mergeUnique(...lists) {
  const map = new Map();
  lists.flat().forEach((item) => {
    if (item?.osm_id) map.set(`${item.osm_type}:${item.osm_id}`, item);
  });
  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

function SelectField({
  label,
  optional = true,
  value,
  placeholder,
  disabled,
  loading,
  items,
  onChange,
  emptyLabel = "No mapped boundaries",
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {items.map((item) => (
            <SelectItem key={`${item.osm_type}:${item.osm_id}`} value={String(item.osm_id)}>
              {item.name}
              {item.local_authority && (
                <span className="ml-2 text-xs text-muted-foreground">{displayType(item)}</span>
              )}
            </SelectItem>
          ))}
          {!loading && !items.length && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">{emptyLabel}</div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function OSMJurisdictionPicker({ value, onChange, disabled = false }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [localBodies, setLocalBodies] = useState([]);
  const [zones, setZones] = useState([]);
  const [wards, setWards] = useState([]);

  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [subdistrictId, setSubdistrictId] = useState("");
  const [localBodyId, setLocalBodyId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [wardId, setWardId] = useState("");

  const [currentSelection, setCurrentSelection] = useState(value || null);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState("");

  const mapCenter = useMemo(() => {
    const center = currentSelection?.center || DEFAULT_CENTER;
    return {
      lat: Number(center?.lat) || DEFAULT_CENTER.lat,
      lng: Number(center?.lng) || DEFAULT_CENTER.lng,
    };
  }, [currentSelection]);

  useEffect(() => {
    let cancelled = false;

    async function loadStates() {
      try {
        setLoadingStates(true);
        setError("");

        // State data is seeded in Supabase and is no longer fetched from Overpass.
        const result = await fetchCachedBoundaries({ adminLevel: 4 });
        if (!cancelled) setStates(result);
      } catch {
        if (!cancelled) setError("We could not load the state list.");
      } finally {
        if (!cancelled) setLoadingStates(false);
      }
    }

    loadStates();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setCurrentSelection(value || null);
  }, [value]);

  const selectFinal = useCallback(
    async (item, { updateParent = true } = {}) => {
      if (!item) return;

      try {
        setLookupLoading(true);
        setError("");
        const geometry = await fetchSelectedGeometry(item);
        const next = selectionValue(item, geometry);
        setCurrentSelection(next);
        if (updateParent) onChange?.(next);
      } catch {
        const next = selectionValue(item, null);
        setCurrentSelection(next);
        if (updateParent) onChange?.(next);
      } finally {
        setLookupLoading(false);
      }
    },
    [onChange],
  );

  const resetAdminChildren = () => {
    setSubdistrictId("");
    setSubdistricts([]);
  };

  const resetLocalChildren = () => {
    setLocalBodyId("");
    setZoneId("");
    setWardId("");
    setZones([]);
    setWards([]);
  };

  const loadStateChildren = useCallback(async (nextState) => {
    if (!nextState) return;

    try {
      setLoadingChildren(true);
      setError("");

      const [districtResult, localGovernmentResult] = await Promise.allSettled([
        fetchBoundaryList({ parentOsmId: nextState.osm_id, adminLevel: 5 }),
        fetchBoundaryList({
          parentOsmId: nextState.osm_id,
          adminLevel: 8,
          stateName: nextState.name,
        }),
      ]);

      const nextDistricts = districtResult.status === "fulfilled" ? districtResult.value : [];
      const nextLocalBodies = localGovernmentResult.status === "fulfilled" ? localGovernmentResult.value : [];

      setDistricts(nextDistricts);
      setLocalBodies(mergeUnique(nextLocalBodies));
      setDistrictId("");
      resetAdminChildren();
      resetLocalChildren();

      if (districtResult.status === "rejected" && localGovernmentResult.status === "rejected") {
        throw districtResult.reason || localGovernmentResult.reason || new Error("Unable to load boundaries");
      }

      if (districtResult.status === "rejected") {
        setError("District boundaries could not be loaded, but local-government boundaries are available.");
      } else if (localGovernmentResult.status === "rejected") {
        setError("Local-government boundaries could not be loaded, but district boundaries are available.");
      }
    } catch {
      setDistricts([]);
      setLocalBodies([]);
      resetAdminChildren();
      resetLocalChildren();
      setError("We could not load the boundaries for this state. Please try again.");
    } finally {
      setLoadingChildren(false);
    }
  }, []);

  const loadDistrictChildren = useCallback(async (nextDistrict) => {
    if (!nextDistrict) return;

    try {
      setLoadingChildren(true);
      setError("");
      const level6 = await fetchBoundaryList({ parentOsmId: nextDistrict.osm_id, adminLevel: 6 });
      setSubdistricts(level6);
      setSubdistrictId("");
    } catch {
      setSubdistricts([]);
      setError("We could not load the subdistrict boundaries.");
    } finally {
      setLoadingChildren(false);
    }
  }, []);

  const loadLocalBodyChildren = useCallback(async (nextLocalBody) => {
    if (!nextLocalBody) return;

    try {
      setLoadingChildren(true);
      setError("");

      // Mumbai's zones and wards are admin 9/10 administrative relations.
      // Do not filter them by local_authority:IN; OSM does not tag these Mumbai
      // relations with that key.
      const [nextZones, nextWards] = await Promise.all([
        fetchBoundaryList({ parentOsmId: nextLocalBody.osm_id, adminLevel: 9 }),
        fetchBoundaryList({ parentOsmId: nextLocalBody.osm_id, adminLevel: 10 }),
      ]);

      setZones(nextZones);
      setWards(nextWards);
      setZoneId("");
      setWardId("");
    } catch {
      setZones([]);
      setWards([]);
      setError("We could not load the zones or wards for this local government.");
    } finally {
      setLoadingChildren(false);
    }
  }, []);

  const handleStateChange = async (id) => {
    const nextState = states.find((item) => String(item.osm_id) === String(id));
    setStateId(id);
    setCurrentSelection(null);

    if (nextState) {
      await Promise.all([selectFinal(nextState), loadStateChildren(nextState)]);
    }
  };

  const handleDistrictChange = async (id) => {
    const nextDistrict = districts.find((item) => String(item.osm_id) === String(id));
    setDistrictId(id);
    setCurrentSelection(null);

    if (nextDistrict) {
      await Promise.all([selectFinal(nextDistrict), loadDistrictChildren(nextDistrict)]);
    }
  };

  const handleSubdistrictChange = async (id) => {
    const nextSubdistrict = subdistricts.find((item) => String(item.osm_id) === String(id));
    setSubdistrictId(id);
    if (nextSubdistrict) await selectFinal(nextSubdistrict);
  };

  const handleLocalBodyChange = async (id) => {
    const nextLocalBody = localBodies.find((item) => String(item.osm_id) === String(id));
    setLocalBodyId(id);
    setZoneId("");
    setWardId("");
    setZones([]);
    setWards([]);
    setCurrentSelection(null);

    if (nextLocalBody) {
      await Promise.all([selectFinal(nextLocalBody), loadLocalBodyChildren(nextLocalBody)]);
    }
  };

  const handleZoneChange = async (id) => {
    const next = zones.find((item) => String(item.osm_id) === String(id));
    setZoneId(id);
    if (next) await selectFinal(next);
  };

  const handleWardChange = async (id) => {
    const next = wards.find((item) => String(item.osm_id) === String(id));
    setWardId(id);
    if (next) await selectFinal(next);
  };

  const clear = () => {
    setCurrentSelection(null);
    setStateId("");
    setDistrictId("");
    setSubdistrictId("");
    setLocalBodyId("");
    setZoneId("");
    setWardId("");
    setDistricts([]);
    setSubdistricts([]);
    setLocalBodies([]);
    setZones([]);
    setWards([]);
    onChange?.(null);
  };

  return (
    <div className="space-y-4">
      {loadingStates ? (
        <div className="flex items-center gap-2 rounded-lg border px-3 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading states and Union territories…
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="State / Union territory"
              optional={false}
              value={stateId}
              placeholder="Choose a state or Union territory"
              disabled={disabled}
              loading={loadingStates}
              items={states}
              onChange={handleStateChange}
            />
            <SelectField
              label="District"
              value={districtId}
              placeholder={!stateId ? "Choose a state first" : loadingChildren ? "Loading…" : "Choose a district"}
              disabled={disabled || !stateId || loadingChildren}
              loading={loadingChildren}
              items={districts}
              onChange={handleDistrictChange}
            />
          </div>

          {stateId && (
            <div className="rounded-xl border p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold">Administrative hierarchy</p>
                <p className="mt-0.5 text-xs text-muted-foreground">State → District → Subdistrict / Taluka.</p>
              </div>
              <SelectField
                label="Subdistrict / Taluka"
                value={subdistrictId}
                placeholder={!districtId ? "Choose a district first" : "Choose a subdistrict"}
                disabled={disabled || !districtId || loadingChildren}
                loading={loadingChildren}
                items={subdistricts}
                onChange={handleSubdistrictChange}
              />
            </div>
          )}

          {stateId && (
            <div className="rounded-xl border p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold">Local government</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Independent of district and subdistrict. Choose the governing civic body, then its zone and ward.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  label="Region / Local government"
                  value={localBodyId}
                  placeholder="Choose a municipal corporation, municipality or city council"
                  disabled={disabled || loadingChildren}
                  loading={loadingChildren}
                  items={localBodies}
                  onChange={handleLocalBodyChange}
                />
                <SelectField
                  label="Zone"
                  value={zoneId}
                  placeholder={!localBodyId ? "Choose a local government first" : "Choose a zone"}
                  disabled={disabled || !localBodyId || loadingChildren}
                  loading={loadingChildren}
                  items={zones}
                  onChange={handleZoneChange}
                />
              </div>

              <SelectField
                label="Ward"
                value={wardId}
                placeholder={!localBodyId ? "Choose a local government first" : "Choose a ward"}
                disabled={disabled || !localBodyId || loadingChildren}
                loading={loadingChildren}
                items={wards}
                onChange={handleWardChange}
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {currentSelection && (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Selected jurisdiction</div>
            <div className="truncate text-sm font-medium">{currentSelection.name}</div>
            <div className="text-xs text-muted-foreground">{displayType(currentSelection)}</div>
          </div>
          {lookupLoading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border">
        <div className="border-b bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          {currentSelection ? "Boundary preview" : "Select a boundary above to preview it on the map."}
        </div>
        <div className="relative h-80">
          <LeafletMap
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            boundary={currentSelection?.geojson || null}
            boundaries={[]}
            selectedBoundaryId={currentSelection?.osm_id || null}
            showMarker={false}
            zoom={
              currentSelection?.admin_level === 4
                ? 5
                : currentSelection?.admin_level === 5
                  ? 7
                  : 10
            }
            onChange={() => {}}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5" />
          You can save any one selected level as the organisation&apos;s jurisdiction.
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={clear}
          disabled={disabled}
          className="h-7 px-2 text-xs"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
}
