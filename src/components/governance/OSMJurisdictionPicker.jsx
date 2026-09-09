"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Loader2, MapPin, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LeafletMap = dynamic(() => import("@/components/shared/LeafletMap"), {
  ssr: false,
});

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const MAX_MAP_BOUNDARIES = 180;

const TYPE_LABELS = {
  4: "State / Union territory",
  5: "District",
  6: "Subdistrict / Taluka",
  7: "Intermediate area",
  8: "Local government",
  9: "Village",
  10: "Ward",
};

const STATE_HELP = "Choose a state or Union territory to begin.";

function displayType(item) {
  if (item?.local_authority === "metropolitan_area") return "Metropolitan area";
  if (item?.local_authority === "municipal_corporation") return "Municipal Corporation";
  if (item?.local_authority === "municipality") return "Municipality";
  if (item?.local_authority === "nagar_panchayat") return "Nagar Panchayat";
  if (item?.local_authority === "gram_panchayat") return "Gram Panchayat";
  if (item?.local_authority === "municipal_corporation_zone") return "Municipal zone";
  if (item?.local_authority === "ward") return "Ward";
  if (Number(item?.admin_level) === 7) return "Block / Revenue circle";
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
  const params = new URLSearchParams({ list: "1", include_geometry: "1" });
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

export default function OSMJurisdictionPicker({
  value,
  onChange,
  disabled = false,
}) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [intermediateAreas, setIntermediateAreas] = useState([]);
  const [localBodies, setLocalBodies] = useState([]);
  const [villages, setVillages] = useState([]);
  const [zones, setZones] = useState([]);
  const [wards, setWards] = useState([]);

  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [subdistrictId, setSubdistrictId] = useState("");
  const [intermediateId, setIntermediateId] = useState("");
  const [localBodyId, setLocalBodyId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [wardId, setWardId] = useState("");

  const [activeMapLevel, setActiveMapLevel] = useState(4);
  const [mapItems, setMapItems] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(value || null);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState("");

  const state = useMemo(
    () => states.find((item) => String(item.osm_id) === String(stateId)) || null,
    [states, stateId],
  );
  const district = useMemo(
    () => districts.find((item) => String(item.osm_id) === String(districtId)) || null,
    [districts, districtId],
  );
  const subdistrict = useMemo(
    () => subdistricts.find((item) => String(item.osm_id) === String(subdistrictId)) || null,
    [subdistricts, subdistrictId],
  );
  const localBody = useMemo(
    () => localBodies.find((item) => String(item.osm_id) === String(localBodyId)) || null,
    [localBodies, localBodyId],
  );

  const setMapFor = useCallback((items, level) => {
    setActiveMapLevel(level);
    setMapItems(items);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadStates = async () => {
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
    };

    loadStates();
    return () => {
      cancelled = true;
    };
  }, [setMapFor]);

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

  const loadDistricts = useCallback(
    async (nextState) => {
      if (!nextState) return;
      try {
        setLoadingChildren(true);
        setError("");
        const result = await fetchBoundaryList({
          parentOsmId: nextState.osm_id,
          adminLevel: 5,
        });
        setDistricts(result);
        setDistrictId("");
        setSubdistricts([]);
        setSubdistrictId("");
        setIntermediateAreas([]);
        setIntermediateId("");
        setLocalBodies([]);
        setLocalBodyId("");
        setVillages([]);
        setVillageId("");
        setZones([]);
        setZoneId("");
        setWards([]);
        setWardId("");
        setMapFor(result, 5);
      } catch {
        setDistricts([]);
        setError("We could not load the districts for this state. Please try again.");
      } finally {
        setLoadingChildren(false);
      }
    },
    [setMapFor],
  );

  const loadDistrictChildren = useCallback(
    async (nextDistrict) => {
      if (!nextDistrict) return;

      try {
        setLoadingChildren(true);
        setError("");

        const [level6, level7, level8] = await Promise.all([
          fetchBoundaryList({ parentOsmId: nextDistrict.osm_id, adminLevel: 6 }),
          fetchBoundaryList({ parentOsmId: nextDistrict.osm_id, adminLevel: 7 }),
          fetchBoundaryList({ parentOsmId: nextDistrict.osm_id, adminLevel: 8 }),
        ]);

        setSubdistricts(level6);
        setIntermediateAreas(level7);
        setLocalBodies(level8);
        setSubdistrictId("");
        setIntermediateId("");
        setLocalBodyId("");
        setVillages([]);
        setVillageId("");
        setZones([]);
        setZoneId("");
        setWards([]);
        setWardId("");

        const firstAvailable = level6.length ? level6 : level8.length ? level8 : level7;
        const firstLevel = level6.length ? 6 : level8.length ? 8 : 7;
        setMapFor(firstAvailable, firstLevel);
      } catch {
        setSubdistricts([]);
        setIntermediateAreas([]);
        setLocalBodies([]);
        setError("We could not load the areas inside this district. You can still save the district itself.");
      } finally {
        setLoadingChildren(false);
      }
    },
    [setMapFor],
  );

  const loadSubdistrictChildren = useCallback(
    async (nextSubdistrict) => {
      if (!nextSubdistrict) return;
      try {
        setLoadingChildren(true);
        const result = await fetchBoundaryList({
          parentOsmId: nextSubdistrict.osm_id,
          adminLevel: 9,
        });
        setVillages(result);
        setVillageId("");
        if (result.length) setMapFor(result, 9);
      } catch {
        setVillages([]);
      } finally {
        setLoadingChildren(false);
      }
    },
    [setMapFor],
  );

  const loadLocalBodyChildren = useCallback(
    async (nextLocalBody) => {
      if (!nextLocalBody) return;
      try {
        setLoadingChildren(true);
        const [nextZones, nextWards] = await Promise.all([
          fetchBoundaryList({ parentOsmId: nextLocalBody.osm_id, localAuthority: "municipal_corporation_zone" }),
          fetchBoundaryList({ parentOsmId: nextLocalBody.osm_id, adminLevel: 10 }),
        ]);
        setZones(nextZones);
        setWards(nextWards);
        setZoneId("");
        setWardId("");
        const firstAvailable = nextZones.length ? nextZones : nextWards;
        setMapFor(firstAvailable, nextZones.length ? 0 : 10);
      } catch {
        setZones([]);
        setWards([]);
      } finally {
        setLoadingChildren(false);
      }
    },
    [setMapFor],
  );

  const handleStateChange = async (id) => {
    const nextState = states.find((item) => String(item.osm_id) === String(id));
    setStateId(id);
    setCurrentSelection(null);
    if (nextState) {
      await selectFinal(nextState);
      await loadDistricts(nextState);
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

  const handleMapClick = async (item) => {
    if (!item) return;

    if (activeMapLevel === 4) {
      await handleStateChange(String(item.osm_id));
      return;
    }

    if (activeMapLevel === 5) {
      await handleDistrictChange(String(item.osm_id));
      return;
    }

    if (activeMapLevel === 6) {
      setSubdistrictId(String(item.osm_id));
      setCurrentSelection(null);
      await selectFinal(item);
      await loadSubdistrictChildren(item);
      return;
    }

    if (activeMapLevel === 8) {
      setLocalBodyId(String(item.osm_id));
      setCurrentSelection(null);
      await selectFinal(item);
      await loadLocalBodyChildren(item);
      return;
    }

    if (activeMapLevel === 9) {
      setVillageId(String(item.osm_id));
      await selectFinal(item);
      return;
    }

    if (activeMapLevel === 10) {
      setWardId(String(item.osm_id));
      await selectFinal(item);
      return;
    }

    if (activeMapLevel === 7) {
      setIntermediateId(String(item.osm_id));
      await selectFinal(item);
    }
  };

  const activeMapLabel = useMemo(() => {
    if (activeMapLevel === 0) return "Zones";
    return TYPE_LABELS[activeMapLevel] || "Areas";
  }, [activeMapLevel]);

  const mapHasTooManyItems = mapItems.length > MAX_MAP_BOUNDARIES;
  const mapItemsForDisplay = mapHasTooManyItems ? [] : mapItems;

  const mapCenter = useMemo(() => {
    const center = currentSelection?.center || mapItems[0]?.center || DEFAULT_CENTER;
    return {
      lat: Number(center?.lat) || DEFAULT_CENTER.lat,
      lng: Number(center?.lng) || DEFAULT_CENTER.lng,
    };
  }, [currentSelection, mapItems]);

  const clear = () => {
    setCurrentSelection(null);
    setStateId("");
    setDistrictId("");
    setSubdistrictId("");
    setIntermediateId("");
    setLocalBodyId("");
    setVillageId("");
    setZoneId("");
    setWardId("");
    setDistricts([]);
    setSubdistricts([]);
    setIntermediateAreas([]);
    setLocalBodies([]);
    setVillages([]);
    setZones([]);
    setWards([]);
    setMapFor(states, 4);
    onChange?.(null);
  };

  const chooseMapLevel = (items, level) => {
    if (!items.length) return;
    setMapFor(items, level);
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
              Start with a state. Then choose a district and, if needed, a smaller administrative or local-government area. You can choose from the lists or click a boundary on the map.
            </p>
          </div>
        </div>
      </div>

      {loadingStates ? (
        <div className="flex items-center gap-2 rounded-lg border px-3 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading states and Union territories…
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">State / Union territory</label>
            <Select value={stateId} onValueChange={handleStateChange} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a state" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {states.map((item) => (
                  <SelectItem key={item.osm_id} value={String(item.osm_id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!stateId && <p className="text-xs text-muted-foreground">{STATE_HELP}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">District</label>
            <Select
              value={districtId}
              onValueChange={handleDistrictChange}
              disabled={disabled || !stateId || loadingChildren || !districts.length}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !stateId
                      ? "Choose a state first"
                      : loadingChildren
                        ? "Loading districts…"
                        : districts.length
                          ? "Choose a district"
                          : "No mapped districts"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {districts.map((item) => (
                  <SelectItem key={item.osm_id} value={String(item.osm_id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {district && (
        <div className="space-y-3 rounded-xl border p-4">
          <div>
            <p className="text-sm font-medium">Make it more specific <span className="font-normal text-muted-foreground">(optional)</span></p>
            <p className="mt-1 text-xs text-muted-foreground">
              Only areas that OSM actually has mapped are shown. You do not have to choose every level.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {subdistricts.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subdistrict / Taluka</label>
                <Select
                  value={subdistrictId}
                  onValueChange={async (id) => {
                    const item = subdistricts.find((entry) => String(entry.osm_id) === String(id));
                    setSubdistrictId(id);
                    await selectFinal(item);
                    await loadSubdistrictChildren(item);
                  }}
                  disabled={disabled || loadingChildren}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subdistrict" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {subdistricts.map((item) => (
                      <SelectItem key={item.osm_id} value={String(item.osm_id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {intermediateAreas.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{intermediateAreas.some((item) => item.local_authority === "metropolitan_area") ? "Metropolitan area / intermediate area" : "Block / revenue circle"}</label>
                <Select
                  value={intermediateId}
                  onValueChange={async (id) => {
                    const item = intermediateAreas.find((entry) => String(entry.osm_id) === String(id));
                    setIntermediateId(id);
                    await selectFinal(item);
                    chooseMapLevel(intermediateAreas, 7);
                  }}
                  disabled={disabled || loadingChildren}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an area" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {intermediateAreas.map((item) => (
                      <SelectItem key={item.osm_id} value={String(item.osm_id)}>
                        <span className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.local_authority === "metropolitan_area" && (
                            <span className="text-xs text-muted-foreground">Metropolitan area</span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {localBodies.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Local government</label>
                <Select
                  value={localBodyId}
                  onValueChange={async (id) => {
                    const item = localBodies.find((entry) => String(entry.osm_id) === String(id));
                    setLocalBodyId(id);
                    await selectFinal(item);
                    await loadLocalBodyChildren(item);
                  }}
                  disabled={disabled || loadingChildren}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a municipality or local body" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {localBodies.map((item) => (
                      <SelectItem key={item.osm_id} value={String(item.osm_id)}>
                        {item.name}{item.local_authority ? ` · ${displayType(item)}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {subdistrict && villages.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Village / revenue village</label>
                <Select
                  value={villageId}
                  onValueChange={async (id) => {
                    const item = villages.find((entry) => String(entry.osm_id) === String(id));
                    setVillageId(id);
                    await selectFinal(item);
                    chooseMapLevel(villages, 9);
                  }}
                  disabled={disabled || loadingChildren}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a village" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {villages.map((item) => (
                      <SelectItem key={item.osm_id} value={String(item.osm_id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {localBody && (zones.length > 0 || wards.length > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {zones.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Municipal zone</label>
                  <Select
                    value={zoneId}
                    onValueChange={async (id) => {
                      const item = zones.find((entry) => String(entry.osm_id) === String(id));
                      setZoneId(id);
                      await selectFinal(item);
                      chooseMapLevel(zones, 0);
                    }}
                    disabled={disabled || loadingChildren}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a zone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {zones.map((item) => (
                        <SelectItem key={item.osm_id} value={String(item.osm_id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {wards.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Ward</label>
                  <Select
                    value={wardId}
                    onValueChange={async (id) => {
                      const item = wards.find((entry) => String(entry.osm_id) === String(id));
                      setWardId(id);
                      await selectFinal(item);
                      chooseMapLevel(wards, 10);
                    }}
                    disabled={disabled || loadingChildren}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a ward" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {wards.map((item) => (
                        <SelectItem key={item.osm_id} value={String(item.osm_id)}>
                          {item.ward ? `Ward ${item.ward} · ` : ""}{item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-muted/20">
        <div className="flex items-center justify-between gap-3 border-b bg-background/80 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Choose from the map</p>
            <p className="text-xs text-muted-foreground">
              {mapItems.length ? `Click a ${activeMapLabel.toLowerCase()} boundary to select it.` : "Boundaries will appear here."}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {district && subdistricts.length > 0 && (
              <Button type="button" variant={activeMapLevel === 6 ? "secondary" : "ghost"} size="sm" onClick={() => chooseMapLevel(subdistricts, 6)}>
                Subdistricts
              </Button>
            )}
            {district && localBodies.length > 0 && (
              <Button type="button" variant={activeMapLevel === 8 ? "secondary" : "ghost"} size="sm" onClick={() => chooseMapLevel(localBodies, 8)}>
                Local bodies
              </Button>
            )}
            {localBody && wards.length > 0 && (
              <Button type="button" variant={activeMapLevel === 10 ? "secondary" : "ghost"} size="sm" onClick={() => chooseMapLevel(wards, 10)}>
                Wards
              </Button>
            )}
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
              <div className="rounded-full border bg-background/95 px-3 py-1.5 text-xs shadow-lg backdrop-blur">
                There are {mapItems.length} mapped boundaries here. Use the list above to choose one.
              </div>
            </div>
          )}
        </div>
      </div>

      {currentSelection?.name ? (
        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background">
            <Check className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{currentSelection.name}</p>
            <p className="text-xs text-muted-foreground">
              {displayType(currentSelection)}
              {currentSelection.osm_id ? ` · OSM ${currentSelection.osm_id}` : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clear}
            disabled={disabled}
            aria-label="Start over"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {lookupLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading the selected boundary…
        </div>
      )}

      {loadingChildren && !lookupLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Looking for smaller areas inside your selection…
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {!currentSelection?.name && !stateId && !loadingStates && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ChevronRight className="h-3.5 w-3.5" />
          You can use either the dropdowns or the map. They select the same OSM boundary.
        </div>
      )}
    </div>
  );
}
