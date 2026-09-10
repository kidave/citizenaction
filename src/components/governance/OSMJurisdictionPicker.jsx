"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";

const LeafletMap = dynamic(() => import("@/components/shared/LeafletMap"), { ssr: false });

const INDIA = { lat: 20.5937, lng: 78.9629 };

const TYPE_LABELS = {
  4: "State / Union territory",
  5: "District",
  6: "Subdistrict / Taluka",
  8: "Local government",
  9: "Zone",
  10: "Ward",
};

function displayType(item) {
  const type = item?.local_government_type || item?.local_authority;
  if (type === "municipal_corporation") return "Municipal Corporation";
  if (type === "municipality") return "Municipality";
  if (type === "city_council") return "City Council";
  if (type === "nagar_panchayat") return "Nagar Panchayat";
  if (type === "gram_panchayat") return "Gram Panchayat";
  return TYPE_LABELS[item?.admin_level] || "Administrative area";
}

function displayName(item) {
  if (item?.admin_level === 8 && item?.local_government_type === "municipal_corporation") {
    return item.operator_alt_name || item.operator || item.name || "Municipal Corporation";
  }
  return item?.name || item?.official_name || "Unnamed area";
}

function normalizeItem(item) {
  if (!item) return null;
  const center = item.center
    ? { lat: Number(item.center.lat), lng: Number(item.center.lng ?? item.center.lon) }
    : null;

  return {
    osm_type: item.osm_type || "relation",
    osm_id: item.osm_id,
    name: item.name,
    official_name: item.official_name || null,
    admin_level: Number(item.admin_level) || null,
    center,
    geojson: item.geojson || null,
    boundary: item.boundary || null,
    local_authority: item.local_authority || null,
    local_government_type: item.local_government_type || null,
    operator: item.operator || null,
    operator_alt_name: item.operator_alt_name || null,
    ward: item.ward || null,
    ref: item.ref || null,
  };
}

function selectionValue(item, geometry) {
  const normalized = normalizeItem(item);
  return {
    ...normalized,
    center: normalized?.center || INDIA,
    geojson: geometry || normalized?.geojson || null,
  };
}

async function fetchCachedStates() {
  const { data, error } = await supabase
    .from("osm_jurisdiction_cache")
    .select("osm_type,osm_id,name,official_name,admin_level,boundary,local_authority,local_government_type,operator,operator_alt_name,ward,ref,center,geojson")
    .eq("admin_level", 4)
    .is("parent_osm_id", null)
    .order("name", { ascending: true })
    .limit(100);

  if (error) throw error;
  return (data || []).map(normalizeItem).filter(Boolean);
}

async function fetchBoundaryList({ parentOsmId = null, adminLevel, stateName = null }) {
  const params = new URLSearchParams({ list: "1", include_geometry: "0", limit: "1000" });
  if (parentOsmId) params.set("parent_osm_id", String(parentOsmId));
  if (adminLevel) params.set("admin_level", String(adminLevel));
  if (stateName) params.set("state_name", stateName);

  const response = await fetch(`/api/osm-admin?${params.toString()}`);
  if (!response.ok) throw new Error("Unable to load administrative boundaries");
  const data = await response.json();
  return Array.isArray(data?.results) ? data.results.map(normalizeItem).filter(Boolean) : [];
}

async function fetchBoundaryGeometry(item) {
  const response = await fetch(
    `/api/osm-admin-lookup?osm_type=${encodeURIComponent(item.osm_type)}&osm_id=${encodeURIComponent(item.osm_id)}`,
  );
  if (!response.ok) throw new Error("Boundary lookup failed");
  const data = await response.json();
  return data?.feature?.geometry || null;
}

function uniqueById(items) {
  const map = new Map();
  for (const item of items || []) {
    if (item?.osm_id) map.set(`${item.osm_type}:${item.osm_id}`, item);
  }
  return [...map.values()].sort((a, b) =>
    displayName(a).localeCompare(displayName(b), undefined, { sensitivity: "base" }),
  );
}

function levelLabel(level) {
  if (level === 5) return "Districts";
  if (level === 6) return "Subdistricts / Talukas";
  if (level === 8) return "Local governments";
  if (level === 9) return "Zones";
  if (level === 10) return "Wards";
  return "Boundaries";
}

function getNextLevels(item, available) {
  if (item?.admin_level === 4) return [5];
  if (item?.admin_level === 5) return available.admin6.length || available.admin8.length ? [available.admin8.length ? 8 : 6, available.admin6.length && available.admin8.length ? 6 : null].filter(Boolean) : [];
  if (item?.admin_level === 8) return available.admin9.length || available.admin10.length ? [available.admin9.length ? 9 : 10] : [];
  if (item?.admin_level === 9) return available.admin10.length ? [10] : [];
  return [];
}

function LevelSwitcher({ levels, activeLevel, onChange }) {
  if (levels.length <= 1) return null;
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/20 p-1">
      {levels.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            activeLevel === level ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {levelLabel(level)}
        </button>
      ))}
    </div>
  );
}

export default function OSMJurisdictionPicker({ value, onChange, disabled = false }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [children, setChildren] = useState({ admin6: [], admin8: [], admin9: [], admin10: [] });
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [selected, setSelected] = useState(value || null);
  const [activeLevel, setActiveLevel] = useState(5);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingContext, setLoadingContext] = useState(false);
  const [loadingGeometry, setLoadingGeometry] = useState(false);
  const [error, setError] = useState("");

  const selectedContext = useMemo(() => {
    if (!selected) return null;
    return selected;
  }, [selected]);

  const candidates = useMemo(() => {
    if (activeLevel === 5) return districts;
    if (activeLevel === 6) return children.admin6;
    if (activeLevel === 8) return children.admin8;
    if (activeLevel === 9) return children.admin9;
    if (activeLevel === 10) return children.admin10;
    return [];
  }, [activeLevel, children, districts]);

  const availableNextLevels = useMemo(() => getNextLevels(selectedContext, children), [selectedContext, children]);
  const mapBoundaries = useMemo(() => uniqueById(selectedContext ? [selectedContext, ...candidates] : candidates), [selectedContext, candidates]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoadingStates(true);
        setError("");
        const result = await fetchCachedStates();
        if (!cancelled) setStates(result);
      } catch (err) {
        if (!cancelled) setError(err?.message || "We could not load the state list.");
      } finally {
        if (!cancelled) setLoadingStates(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setSelected(value || null);
  }, [value]);

  const loadDistricts = useCallback(async (state) => {
    setLoadingContext(true);
    setError("");
    try {
      const result = await fetchBoundaryList({ parentOsmId: state.osm_id, adminLevel: 5 });
      setDistricts(result);
    } catch (err) {
      setDistricts([]);
      throw err;
    } finally {
      setLoadingContext(false);
    }
  }, []);

  const loadDistrictChildren = useCallback(async (district) => {
    setLoadingContext(true);
    setError("");
    try {
      const [admin6Result, admin8Result] = await Promise.allSettled([
        fetchBoundaryList({ parentOsmId: district.osm_id, adminLevel: 6 }),
        fetchBoundaryList({ parentOsmId: district.osm_id, adminLevel: 8 }),
      ]);
      const next = {
        admin6: admin6Result.status === "fulfilled" ? admin6Result.value : [],
        admin8: admin8Result.status === "fulfilled" ? admin8Result.value : [],
        admin9: [],
        admin10: [],
      };
      setChildren(next);
      if (admin6Result.status === "rejected" && admin8Result.status === "rejected") {
        throw admin6Result.reason || admin8Result.reason || new Error("Unable to load district boundaries");
      }
      if (admin6Result.status === "rejected" && admin8Result.status === "fulfilled" && next.admin8.length) {
        setError("Subdistrict boundaries are not mapped here. You can choose a local government on the map.");
      }
      if (admin8Result.status === "rejected" && !next.admin6.length) {
        setError("Local-government boundaries could not be loaded.");
      }
    } finally {
      setLoadingContext(false);
    }
  }, []);

  const loadLocalChildren = useCallback(async (localBody) => {
    setLoadingContext(true);
    setError("");
    try {
      const [admin9Result, admin10Result] = await Promise.allSettled([
        fetchBoundaryList({ parentOsmId: localBody.osm_id, adminLevel: 9 }),
        fetchBoundaryList({ parentOsmId: localBody.osm_id, adminLevel: 10 }),
      ]);
      const next = {
        admin6: children.admin6,
        admin8: children.admin8,
        admin9: admin9Result.status === "fulfilled" ? admin9Result.value : [],
        admin10: admin10Result.status === "fulfilled" ? admin10Result.value : [],
      };
      setChildren(next);
      if (admin9Result.status === "rejected" && admin10Result.status === "rejected") {
        throw admin9Result.reason || admin10Result.reason || new Error("Unable to load civic subdivisions");
      }
      if (admin9Result.status === "rejected" && admin10Result.status === "fulfilled") {
        setError("Zones are not mapped here. You can choose a ward on the map.");
      }
    } finally {
      setLoadingContext(false);
    }
  }, [children.admin6, children.admin8]);

  const choose = useCallback(async (item, { loadChildren = true, propagate = true } = {}) => {
    if (!item) return;
    setLoadingGeometry(true);
    setError("");
    const previous = selected;
    const geometry = await fetchBoundaryGeometry(item).catch(() => null);
    const nextSelection = selectionValue(item, geometry);
    setSelected(nextSelection);
    if (propagate) onChange?.(nextSelection);
    setLoadingGeometry(false);

    try {
      if (item.admin_level === 4) {
        setActiveLevel(5);
        await loadDistricts(item);
      } else if (item.admin_level === 5) {
        setActiveLevel(8);
        await loadDistrictChildren(item);
      } else if (item.admin_level === 8) {
        setActiveLevel(9);
        await loadLocalChildren(item);
      } else if (item.admin_level === 9) {
        setActiveLevel(10);
        const result = await fetchBoundaryList({ parentOsmId: item.osm_id, adminLevel: 10 });
        setChildren((current) => ({ ...current, admin10: result }));
      }
    } catch (err) {
      setSelected(previous || nextSelection);
      setError(err?.message || "Unable to load the next boundaries.");
    }
  }, [loadDistrictChildren, loadDistricts, loadLocalChildren, onChange, selected]);

  const handleStateChange = async (id) => {
    const nextState = states.find((item) => String(item.osm_id) === String(id));
    setStateId(id);
    setDistrictId("");
    setSelected(null);
    setChildren({ admin6: [], admin8: [], admin9: [], admin10: [] });
    setActiveLevel(5);
    if (!nextState) return;
    try {
      await choose(nextState);
    } catch (err) {
      setError(err?.message || "Unable to select state");
    }
  };

  const handleDistrictSelect = async (id) => {
    const nextDistrict = districts.find((item) => String(item.osm_id) === String(id));
    setDistrictId(id);
    if (!nextDistrict) return;
    await choose(nextDistrict);
  };

  const handleMapBoundaryClick = async (item) => {
    await choose(item);
  };

  const useSelected = () => {
    if (!selected) return;
    onChange?.(selected);
  };

  const clear = () => {
    setSelected(null);
    setStateId("");
    setDistrictId("");
    setDistricts([]);
    setChildren({ admin6: [], admin8: [], admin9: [], admin10: [] });
    setActiveLevel(5);
    setError("");
    onChange?.(null);
  };

  const mapCenter = selected?.center || states.find((item) => String(item.osm_id) === String(stateId))?.center || INDIA;
  const zoom = selected?.admin_level === 4 ? 6 : selected?.admin_level === 5 ? 9 : selected?.admin_level === 8 ? 11 : 12;

  return (
    <div className="space-y-4">
      {loadingStates ? (
        <div className="flex items-center gap-2 rounded-lg border px-3 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading states and Union territories…
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">State / Union territory</label>
              <Select value={stateId} onValueChange={handleStateChange} disabled={disabled || loadingContext}>
                <SelectTrigger><SelectValue placeholder="Choose a state or Union territory" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {states.map((item) => (
                    <SelectItem key={`${item.osm_type}:${item.osm_id}`} value={String(item.osm_id)}>{displayName(item)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">District</label>
              <Select value={districtId} onValueChange={handleDistrictSelect} disabled={disabled || !stateId || loadingContext}>
                <SelectTrigger><SelectValue placeholder={!stateId ? "Choose a state first" : "Choose a district"} /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {districts.map((item) => (
                    <SelectItem key={`${item.osm_type}:${item.osm_id}`} value={String(item.osm_id)}>{displayName(item)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {stateId && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Choose the jurisdiction on the map</p>
                  <p className="text-xs text-muted-foreground">Select the geographic boundary you want to attach to this governance entity.</p>
                </div>
                {loadingContext && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>

              {selectedContext && availableNextLevels.length > 0 && (
                <LevelSwitcher levels={availableNextLevels} activeLevel={activeLevel} onChange={setActiveLevel} />
              )}

              <div className="overflow-hidden rounded-xl border">
                <div className="border-b bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                  {activeLevel === 5 && "District boundaries"}
                  {activeLevel === 6 && "Subdistrict / taluka boundaries"}
                  {activeLevel === 8 && "Local-government boundaries"}
                  {activeLevel === 9 && "Zone boundaries"}
                  {activeLevel === 10 && "Ward boundaries"}
                  {!candidates.length && !loadingContext && "No mapped boundaries at this level"}
                </div>
                <div className="relative h-[22rem]">
                  <LeafletMap
                    lat={Number(mapCenter?.lat) || INDIA.lat}
                    lng={Number(mapCenter?.lng) || INDIA.lng}
                    boundaries={mapBoundaries}
                    selectedBoundaryId={selected?.osm_id || null}
                    showMarker={false}
                    zoom={zoom}
                    onChange={() => {}}
                    onBoundaryClick={handleMapBoundaryClick}
                  />
                  {loadingGeometry && (
                    <div className="absolute right-3 top-3 rounded-md border bg-background/90 px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm">
                      Loading boundary…
                    </div>
                  )}
                </div>
              </div>

              {selected && (
                <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5" />
                      Selected boundary
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold" title={displayName(selected)}>{displayName(selected)}</p>
                    <p className="text-xs text-muted-foreground">{displayType(selected)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {availableNextLevels.length > 0 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => setActiveLevel(availableNextLevels[0])} disabled={disabled || loadingContext}>
                        <ChevronRight className="mr-1.5 h-4 w-4" />
                        Continue
                      </Button>
                    )}
                    <Button type="button" size="sm" onClick={useSelected} disabled={disabled}>
                      Use boundary
                    </Button>
                  </div>
                </div>
              )}

              {selected && selected.admin_level >= 5 && (
                <Button type="button" variant="ghost" size="sm" className="px-0" onClick={() => {
                  if (selected.admin_level >= 9) setActiveLevel(8);
                  else if (selected.admin_level >= 8) setActiveLevel(5);
                  else setActiveLevel(5);
                }} disabled={disabled || loadingContext}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Explore another level
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-xs text-muted-foreground">
        <span>State and district narrow the map; the map is where you choose the final jurisdiction.</span>
        <Button type="button" size="sm" variant="ghost" onClick={clear} disabled={disabled} className="h-7 px-2 text-xs">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
}
