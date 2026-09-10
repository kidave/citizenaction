"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Loader2, MapPin, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
const MAX_MAP_BOUNDARIES = 100;

const TYPE_LABELS = {
  4: "State / Union territory",
  5: "District",
  6: "Subdistrict / Taluka",
  7: "Intermediate area",
  8: "Local government",
  9: "Village",
  10: "Ward",
};

function displayType(item) {
  if (item?.local_authority === "metropolitan_area") return "Metropolitan area";
  if (item?.local_authority === "municipal_corporation") return "Municipal Corporation";
  if (item?.local_authority === "municipality") return "Municipality";
  if (item?.local_authority === "nagar_panchayat") return "Nagar Panchayat";
  if (item?.local_authority === "gram_panchayat") return "Gram Panchayat";
  if (item?.local_authority === "municipal_corporation_zone") return "Municipal zone";
  if (item?.local_authority === "ward") return "Ward";
  return TYPE_LABELS[item?.admin_level] || "Administrative area";
}

function selectionValue(item, geometry) {
  return {
    osm_type: item.osm_type,
    osm_id: item.osm_id,
    name: item.name,
    admin_level: item.admin_level,
    center: item.center || DEFAULT_CENTER,
    geojson: geometry || item.geojson || null,
    boundary: item.boundary || null,
    local_authority: item.local_authority || null,
    ward: item.ward || null,
    ref: item.ref || null,
  };
}

async function fetchBoundaryList({ parentOsmId = null, adminLevel = null, localAuthority = null }) {
  const params = new URLSearchParams({ list: "1", include_geometry: "1", limit: "100" });
  if (parentOsmId) params.set("parent_osm_id", String(parentOsmId));
  if (adminLevel) params.set("admin_level", String(adminLevel));
  if (localAuthority) params.set("local_authority", localAuthority);

  const response = await fetch(`/api/osm-admin?${params.toString()}`);
  if (!response.ok) throw new Error("Unable to load administrative boundaries");
  const data = await response.json();
  return Array.isArray(data?.results) ? data.results : [];
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
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export default function OSMJurisdictionPicker({ value, onChange, disabled = false }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [intermediateAreas, setIntermediateAreas] = useState([]);
  const [localBodies, setLocalBodies] = useState([]);
  const [zones, setZones] = useState([]);
  const [wards, setWards] = useState([]);

  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [subdistrictId, setSubdistrictId] = useState("");
  const [intermediateId, setIntermediateId] = useState("");
  const [localBodyId, setLocalBodyId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [wardId, setWardId] = useState("");

  const [activeMapLevel, setActiveMapLevel] = useState(4);
  const [mapItems, setMapItems] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(value || INDIA);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState("");

  const district = useMemo(() => districts.find((item) => String(item.osm_id) === String(districtId)) || null, [districts, districtId]);
  const subdistrict = useMemo(() => subdistricts.find((item) => String(item.osm_id) === String(subdistrictId)) || null, [subdistricts, subdistrictId]);
  const localBody = useMemo(() => localBodies.find((item) => String(item.osm_id) === String(localBodyId)) || null, [localBodies, localBodyId]);

  const setMapFor = useCallback((items, level) => {
    setActiveMapLevel(level);
    setMapItems(items || []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadStates() {
      try {
        setLoadingStates(true);
        setError("");
        const result = await fetchBoundaryList({ adminLevel: 4 });
        if (!cancelled) {
          setStates(result);
          setMapFor(result, 4);
        }
      } catch {
        if (!cancelled) setError("We could not load the state boundaries. Please try again.");
      } finally {
        if (!cancelled) setLoadingStates(false);
      }
    }
    loadStates();
    return () => { cancelled = true; };
  }, [setMapFor]);

  useEffect(() => {
    setCurrentSelection(value || INDIA);
  }, [value]);

  const selectFinal = useCallback(async (item, { updateParent = true } = {}) => {
    if (!item) return;
    if (Number(item.admin_level) === 2 && Number(item.osm_id) === INDIA.osm_id) {
      const next = selectionValue(INDIA, value?.geojson || null);
      setCurrentSelection(next);
      if (updateParent) onChange?.(next);
      return;
    }

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
  }, [onChange, value]);

  const loadStateChildren = useCallback(async (nextState) => {
    if (!nextState) return;
    try {
      setLoadingChildren(true);
      setError("");

      const [nextDistricts, level8, corporations, municipalities, nagarPanchayats, gramPanchayats] = await Promise.all([
        fetchBoundaryList({ parentOsmId: nextState.osm_id, adminLevel: 5 }),
        fetchBoundaryList({ parentOsmId: nextState.osm_id, adminLevel: 8 }),
        fetchBoundaryList({ parentOsmId: nextState.osm_id, localAuthority: "municipal_corporation" }),
        fetchBoundaryList({ parentOsmId: nextState.osm_id, localAuthority: "municipality" }),
        fetchBoundaryList({ parentOsmId: nextState.osm_id, localAuthority: "nagar_panchayat" }),
        fetchBoundaryList({ parentOsmId: nextState.osm_id, localAuthority: "gram_panchayat" }),
      ]);

      setDistricts(nextDistricts);
      setLocalBodies(mergeUnique(level8, corporations, municipalities, nagarPanchayats, gramPanchayats));
      setDistrictId("");
      setSubdistricts([]);
      setSubdistrictId("");
      setIntermediateAreas([]);
      setIntermediateId("");
      setZones([]);
      setZoneId("");
      setWards([]);
      setWardId("");

      if (nextDistricts.length) setMapFor(nextDistricts, 5);
      else if (level8.length) setMapFor(level8, 8);
      else setMapFor([], 5);
    } catch {
      setDistricts([]);
      setLocalBodies([]);
      setError("We could not load the administrative and local-government boundaries for this state. Please try again.");
    } finally {
      setLoadingChildren(false);
    }
  }, [setMapFor]);

  const loadDistrictChildren = useCallback(async (nextDistrict) => {
    if (!nextDistrict) return;
    try {
      setLoadingChildren(true);
      setError("");
      const [level6, level7] = await Promise.all([
        fetchBoundaryList({ parentOsmId: nextDistrict.osm_id, adminLevel: 6 }),
        fetchBoundaryList({ parentOsmId: nextDistrict.osm_id, adminLevel: 7 }),
      ]);
      setSubdistricts(level6);
      setIntermediateAreas(level7);
      setSubdistrictId("");
      setIntermediateId("");
      if (level6.length) setMapFor(level6, 6);
      else if (level7.length) setMapFor(level7, 7);
    } catch {
      setSubdistricts([]);
      setIntermediateAreas([]);
    } finally {
      setLoadingChildren(false);
    }
  }, [setMapFor]);

  const loadLocalBodyChildren = useCallback(async (nextLocalBody) => {
    if (!nextLocalBody) return;
    try {
      setLoadingChildren(true);
      setError("");
      const [nextZones, nextWards] = await Promise.all([
        fetchBoundaryList({ parentOsmId: nextLocalBody.osm_id, localAuthority: "municipal_corporation_zone" }),
        fetchBoundaryList({ parentOsmId: nextLocalBody.osm_id, adminLevel: 10 }),
      ]);
      setZones(nextZones);
      setWards(nextWards);
      setZoneId("");
      setWardId("");
      if (nextZones.length) setMapFor(nextZones, 0);
      else if (nextWards.length) setMapFor(nextWards, 10);
    } catch {
      setZones([]);
      setWards([]);
      setError("We could not load the zones or wards for this local government.");
    } finally {
      setLoadingChildren(false);
    }
  }, [setMapFor]);

  const handleStateChange = async (id) => {
    const nextState = states.find((item) => String(item.osm_id) === String(id));
    setStateId(id);
    setDistrictId("");
    setCurrentSelection(null);
    if (nextState) {
      await selectFinal(nextState);
      await loadStateChildren(nextState);
    }
  };

  const handleDistrictChange = async (id) => {
    const nextDistrict = districts.find((item) => String(item.osm_id) === String(id));
    setDistrictId(id);
    setCurrentSelection(null);
    if (nextDistrict) {
      await selectFinal(nextDistrict);
      await loadDistrictChildren(nextDistrict);
    }
  };

  const handleLocalBodyChange = async (id) => {
    const nextLocalBody = localBodies.find((item) => String(item.osm_id) === String(id));
    setLocalBodyId(id);
    setCurrentSelection(null);
    if (nextLocalBody) {
      await selectFinal(nextLocalBody);
      await loadLocalBodyChildren(nextLocalBody);
    }
  };

  const handleMapClick = async (item) => {
    if (!item) return;
    if (activeMapLevel === 4) return handleStateChange(String(item.osm_id));
    if (activeMapLevel === 5) return handleDistrictChange(String(item.osm_id));
    if (activeMapLevel === 8) return handleLocalBodyChange(String(item.osm_id));
    if (activeMapLevel === 6) {
      setSubdistrictId(String(item.osm_id));
      return selectFinal(item);
    }
    if (activeMapLevel === 7) {
      setIntermediateId(String(item.osm_id));
      return selectFinal(item);
    }
    if (activeMapLevel === 10) {
      setWardId(String(item.osm_id));
      return selectFinal(item);
    }
    if (activeMapLevel === 0) {
      setZoneId(String(item.osm_id));
      return selectFinal(item);
    }
    return null;
  };

  const activeMapLabel = activeMapLevel === 0 ? "municipal zone" : TYPE_LABELS[activeMapLevel] || "area";
  const mapHasTooManyItems = mapItems.length > MAX_MAP_BOUNDARIES;
  const mapItemsForDisplay = mapHasTooManyItems ? [] : mapItems;
  const mapCenter = useMemo(() => {
    const center = currentSelection?.center || mapItems[0]?.center || DEFAULT_CENTER;
    return { lat: Number(center?.lat) || DEFAULT_CENTER.lat, lng: Number(center?.lng) || DEFAULT_CENTER.lng };
  }, [currentSelection, mapItems]);

  const clear = () => {
    setCurrentSelection(null);
    setStateId("");
    setDistrictId("");
    setSubdistrictId("");
    setIntermediateId("");
    setLocalBodyId("");
    setZoneId("");
    setWardId("");
    setDistricts([]);
    setSubdistricts([]);
    setIntermediateAreas([]);
    setLocalBodies([]);
    setZones([]);
    setWards([]);
    setMapFor(states, 4);
    onChange?.(null);
  };

  const chooseMapLevel = (items, level) => {
    if (items?.length) setMapFor(items, level);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Choose the area this organisation governs</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              India is the default country. Choose a state, then select any applicable administrative or local-government boundary. Districts, municipal corporations, zones and wards are separate choices.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/20 px-3 py-2.5">
        <div className="text-xs font-medium text-muted-foreground">Country</div>
        <div className="mt-0.5 text-sm font-medium">India</div>
      </div>

      {loadingStates ? (
        <div className="flex items-center gap-2 rounded-lg border px-3 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading states and Union territories…
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">State / Union territory</label>
            <Select value={stateId} onValueChange={handleStateChange} disabled={disabled}>
              <SelectTrigger><SelectValue placeholder="Choose a state or Union territory" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {states.map((item) => <SelectItem key={item.osm_id} value={String(item.osm_id)}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">District <span className="font-normal text-muted-foreground">(optional)</span></label>
            <Select value={districtId} onValueChange={handleDistrictChange} disabled={disabled || !stateId || loadingChildren || !districts.length}>
              <SelectTrigger>
                <SelectValue placeholder={!stateId ? "Choose a state first" : loadingChildren ? "Loading districts…" : districts.length ? "Choose a district" : "No mapped districts"} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {districts.map((item) => <SelectItem key={item.osm_id} value={String(item.osm_id)}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {stateId && (
        <div className="space-y-3 rounded-xl border p-4">
          <div>
            <p className="text-sm font-medium">Local government</p>
            <p className="mt-1 text-xs text-muted-foreground">This is independent of district and subdistrict. For Mumbai, this is where Brihanmumbai Municipal Corporation is selected.</p>
          </div>
          <Select value={localBodyId} onValueChange={handleLocalBodyChange} disabled={disabled || loadingChildren || !localBodies.length}>
            <SelectTrigger>
              <SelectValue placeholder={loadingChildren ? "Loading local governments…" : localBodies.length ? "Choose a local government" : "No mapped local governments"} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {localBodies.map((item) => (
                <SelectItem key={`${item.osm_type}:${item.osm_id}`} value={String(item.osm_id)}>
                  {item.name} · {displayType(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {district && (
        <div className="space-y-3 rounded-xl border p-4">
          <div>
            <p className="text-sm font-medium">Other administrative areas <span className="font-normal text-muted-foreground">(optional)</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Use these only when the organisation's jurisdiction is actually defined by them.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {subdistricts.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subdistrict / Taluka</label>
                <Select value={subdistrictId} onValueChange={async (id) => { const item = subdistricts.find((entry) => String(entry.osm_id) === String(id)); setSubdistrictId(id); await selectFinal(item); }} disabled={disabled || loadingChildren}>
                  <SelectTrigger><SelectValue placeholder="Choose a subdistrict" /></SelectTrigger>
                  <SelectContent className="max-h-72">{subdistricts.map((item) => <SelectItem key={item.osm_id} value={String(item.osm_id)}>{item.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}

            {intermediateAreas.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Intermediate area</label>
                <Select value={intermediateId} onValueChange={async (id) => { const item = intermediateAreas.find((entry) => String(entry.osm_id) === String(id)); setIntermediateId(id); await selectFinal(item); }} disabled={disabled || loadingChildren}>
                  <SelectTrigger><SelectValue placeholder="Choose an area" /></SelectTrigger>
                  <SelectContent className="max-h-72">{intermediateAreas.map((item) => <SelectItem key={item.osm_id} value={String(item.osm_id)}>{item.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}

      {localBody && (zones.length > 0 || wards.length > 0) && (
        <div className="space-y-3 rounded-xl border p-4">
          <div>
            <p className="text-sm font-medium">Municipal subdivisions</p>
            <p className="mt-1 text-xs text-muted-foreground">For a municipal corporation, zones and wards are subdivisions of the local government.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {zones.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Municipal zone</label>
                <Select value={zoneId} onValueChange={async (id) => { const item = zones.find((entry) => String(entry.osm_id) === String(id)); setZoneId(id); await selectFinal(item); chooseMapLevel(zones, 0); }} disabled={disabled || loadingChildren}>
                  <SelectTrigger><SelectValue placeholder="Choose a municipal zone" /></SelectTrigger>
                  <SelectContent className="max-h-72">{zones.map((item) => <SelectItem key={item.osm_id} value={String(item.osm_id)}>{item.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {wards.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ward</label>
                <Select value={wardId} onValueChange={async (id) => { const item = wards.find((entry) => String(entry.osm_id) === String(id)); setWardId(id); await selectFinal(item); chooseMapLevel(wards, 10); }} disabled={disabled || loadingChildren}>
                  <SelectTrigger><SelectValue placeholder="Choose a ward" /></SelectTrigger>
                  <SelectContent className="max-h-72">{wards.map((item) => <SelectItem key={item.osm_id} value={String(item.osm_id)}>{item.ward ? `Ward ${item.ward} · ` : ""}{item.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-muted/20">
        <div className="flex items-center justify-between gap-3 border-b bg-background/80 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Choose from the map</p>
            <p className="text-xs text-muted-foreground">{mapItems.length ? `Click a ${activeMapLabel} boundary to select it.` : "Boundaries will appear here."}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {districts.length > 0 && <Button type="button" variant={activeMapLevel === 5 ? "secondary" : "ghost"} size="sm" onClick={() => chooseMapLevel(districts, 5)}>Districts</Button>}
            {localBodies.length > 0 && <Button type="button" variant={activeMapLevel === 8 ? "secondary" : "ghost"} size="sm" onClick={() => chooseMapLevel(localBodies, 8)}>Local governments</Button>}
            {subdistricts.length > 0 && <Button type="button" variant={activeMapLevel === 6 ? "secondary" : "ghost"} size="sm" onClick={() => chooseMapLevel(subdistricts, 6)}>Subdistricts</Button>}
            {zones.length > 0 && <Button type="button" variant={activeMapLevel === 0 ? "secondary" : "ghost"} size="sm" onClick={() => chooseMapLevel(zones, 0)}>Zones</Button>}
            {wards.length > 0 && <Button type="button" variant={activeMapLevel === 10 ? "secondary" : "ghost"} size="sm" onClick={() => chooseMapLevel(wards, 10)}>Wards</Button>}
          </div>
        </div>

        <div className="relative h-80">
          <LeafletMap
            lat={mapCenter.lat}
            lng={mapCenter.lng}
            boundary={currentSelection?.geojson || null}
            boundaries={mapItemsForDisplay}
            selectedBoundaryId={currentSelection?.osm_id || null}
            showMarker={false}
            zoom={activeMapLevel === 4 ? 5 : activeMapLevel === 5 ? 7 : 10}
            onChange={() => {}}
            onBoundaryClick={handleMapClick}
          />
          {mapHasTooManyItems && (
            <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[1000] flex justify-center">
              <div className="rounded-full border bg-background/95 px-3 py-1.5 text-xs shadow-lg backdrop-blur">There are {mapItems.length} mapped boundaries here. Use the list above to choose one.</div>
            </div>
          )}
        </div>
      </div>

      {currentSelection?.name && (
        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background"><Check className="h-4 w-4" /></div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{currentSelection.name}</p>
            <p className="text-xs text-muted-foreground">{displayType(currentSelection)}{currentSelection.osm_id ? ` · OSM ${currentSelection.osm_id}` : ""}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={clear} disabled={disabled} aria-label="Start over"><RotateCcw className="h-4 w-4" /></Button>
        </div>
      )}

      {lookupLoading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading boundary…</div>}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex items-center gap-1 text-xs text-muted-foreground"><ChevronRight className="h-3.5 w-3.5" /> India is fixed as the country. Local government, district, zone and ward are independent jurisdiction types.</div>
    </div>
  );
}
