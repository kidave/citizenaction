"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  Loader2,
  Search,
} from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { fetchGeographyGeometry } from "@/hooks/geography/useGeographyBrowser";
import { useGovernanceGeography, useGovernanceGeographyMutation } from "@/hooks/geography/useGovernanceGeography";
import {
  GEOGRAPHY_BOUNDARY_CATEGORIES,
  getGeographyBoundaryCategory,
  getGeographyTypeLabel,
} from "@/config/geography/boundaryCategories";

const GeographyTilesMap = dynamic(() => import("@/components/geography/GeographyTilesMap"), { ssr: false });
const LeafletMap = dynamic(() => import("@/components/geography/LeafletMap"), { ssr: false });
const DEFAULT_GEOGRAPHY_FOCUS_ID = "6f3dda25-6cf4-43f2-a5b7-1c8aa9d2113f";
const PAGE_SIZE = 80;

const FIELDS =
  "id,name,official_name,geography_type,boundary_category,parent_id,country_code,osm_type,osm_id,center,metadata";

function getGeographyZoom(geographyType) {
  if (geographyType === "state") return 6;
  if (geographyType === "district") return 8;
  if (geographyType === "parliamentary_constituency") return 8;
  if (geographyType === "assembly_constituency") return 10;
  if (geographyType === "metropolitan_area" || geographyType === "local_government") return 11;
  if (geographyType === "zone") return 13;
  if (geographyType === "ward") return 14;
  return 10;
}

export default function AddGeographyDialog({ open, onOpenChange, governanceId = null, entityId = null, entityType = "governance", entityName, onSaved, selectionOnly = false, value = null, onSelectBoundary, description: descriptionOverride, embedded = false, mapRenderer = "tiles" }) {
  const targetId = entityId || governanceId;
  const [category, setCategory] = useState("administrative");
  const [politicalLevel, setPoliticalLevel] = useState("state");
  const [browseMode, setBrowseMode] = useState("root");
  const [politicalStateFilter, setPoliticalStateFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [browsePath, setBrowsePath] = useState([]);
  const [geometry, setGeometry] = useState(null);
  const [loadingGeometry, setLoadingGeometry] = useState(false);
  const geometryRequestRef = useRef(0);
  const loadMoreRef = useRef(null);

  const { data: relationships = [] } = useGovernanceGeography(targetId, open && !selectionOnly, entityType);
  const { data: focusGeography = null } = useQuery({
    queryKey: ["geography-focus-dialog-selection", value],
    enabled: selectionOnly && Boolean(value),
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from("geographies").select(FIELDS).eq("id", value).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const currentGeography = selectionOnly ? focusGeography : relationships[0]?.geographies || null;
  const currentGeographyId = selectionOnly ? value : relationships[0]?.geography_id || null;
  const { setGeography, isSetting } = useGovernanceGeographyMutation();

  useEffect(() => {
    if (!open) return;

    const nextCategory = currentGeography
      ? getGeographyBoundaryCategory(currentGeography)
      : "administrative";

    setCategory(nextCategory);
    setPoliticalLevel("state");
    setBrowseMode("root");
    setPoliticalStateFilter("all");
    setSearch("");
    setBrowsePath([]);
    setSelected(currentGeography || null);
    setGeometry(null);
    geometryRequestRef.current += 1;
  }, [open, currentGeography, mapRenderer]);

  const isFlatMode = Boolean(search.trim());



  const {
    data: geographyPages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "geography-picker",
      category,
      politicalLevel,
      politicalStateFilter,
      browseMode,
      search.trim(),
      browsePath.map((item) => item.id).join("/"),
    ],
    enabled: open,
    staleTime: 5 * 60 * 1000,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const needle = search.trim().replace(/[%_]/g, "").slice(0, 80);
      const parent = browsePath[browsePath.length - 1] || null;

      if (!needle && category === "administrative") {
        let query = supabase.from("geographies").select(FIELDS)
          .order("name", { ascending: true }).range(from, to);
        if (browseMode === "state-districts" && parent) {
          query = query.eq("parent_id", parent.id).eq("geography_type", "district");
        } else if (browseMode === "all-districts") {
          query = query.eq("geography_type", "district");
        } else {
          query = query.eq("parent_id", DEFAULT_GEOGRAPHY_FOCUS_ID).eq("geography_type", "state");
        }
        query = query.or("boundary_category.eq.administrative,boundary_category.is.null");
        const { data, error } = await query;
        if (error) throw error;
        return { rows: data || [], hasMore: data?.length === PAGE_SIZE };
      }

      if (!needle && category === "local_government") {
        if (browseMode === "root") {
          const { data, error } = await supabase.from("geographies").select(FIELDS)
            .eq("parent_id", DEFAULT_GEOGRAPHY_FOCUS_ID).eq("geography_type", "state")
            .order("name", { ascending: true }).range(from, to);
          if (error) throw error;
          return { rows: data || [], hasMore: data?.length === PAGE_SIZE };
        }
        if (browseMode === "metropolitan" || browseMode === "local-bodies") {
          const kind = browseMode === "metropolitan" ? "metropolitan_area" : "local_government";
          let localQuery = supabase.from("geographies").select(FIELDS)
            .eq("boundary_category", "local_government")
            .eq("geography_type", kind).order("name", { ascending: true }).range(from, to);
          if (parent?.id) localQuery = localQuery.eq("parent_id", parent.id);
          const { data, error } = await localQuery;
          if (error) throw error;
          return { rows: data || [], hasMore: data?.length === PAGE_SIZE };
        }
        if (browseMode === "zones" || browseMode === "wards") {
          if (browseMode === "zones") {
            const { data, error } = await supabase.from("geographies").select(FIELDS)
              .eq("parent_id", parent?.id).eq("geography_type", "zone")
              .order("name", { ascending: true }).range(from, to);
            if (error) throw error;
            return { rows: data || [], hasMore: data?.length === PAGE_SIZE };
          }
          const { data: zones, error: zonesError } = await supabase.from("geographies")
            .select("id").eq("parent_id", parent?.id).eq("geography_type", "zone");
          if (zonesError) throw zonesError;
          const parentIds = [parent?.id, ...(zones || []).map((zone) => zone.id)].filter(Boolean);
          const { data, error } = await supabase.from("geographies").select(FIELDS)
            .in("parent_id", parentIds).eq("geography_type", "ward")
            .order("name", { ascending: true }).range(from, to);
          if (error) throw error;
          return { rows: data || [], hasMore: data?.length === PAGE_SIZE };
        }
      }

      if (!needle && category === "political" && ["all-parliamentary", "all-assembly"].includes(browseMode)) {
        const type = browseMode === "all-parliamentary" ? "parliamentary_constituency" : "assembly_constituency";
        let politicalQuery = supabase.from("geographies").select(FIELDS)
          .eq("boundary_category", "political").eq("geography_type", type)
          .order("name", { ascending: true }).range(from, to);
        if (politicalStateFilter !== "all") politicalQuery = politicalQuery.eq("parent_id", politicalStateFilter);
        const { data, error } = await politicalQuery;
        if (error) throw error;
        return { rows: data || [], hasMore: data?.length === PAGE_SIZE };
      }

      if (!needle && category === "political" && politicalLevel === "state") {
        const { data, error } = await supabase.from("geographies").select(FIELDS)
          .eq("parent_id", DEFAULT_GEOGRAPHY_FOCUS_ID).eq("geography_type", "state")
          .order("name", { ascending: true }).range(from, to);
        if (error) throw error;
        return { rows: data || [], hasMore: data?.length === PAGE_SIZE };
      }

      if (category === "political" && !needle && politicalLevel === "parliamentary") {
        let politicalQuery = supabase
          .from("geographies")
          .select(FIELDS)
          .eq("boundary_category", "political")
          .eq("geography_type", "parliamentary_constituency")
          .order("name", { ascending: true })
          .range(from, to);
        if (politicalStateFilter !== "all") {
          politicalQuery = politicalQuery.eq("parent_id", politicalStateFilter);
        }
        const { data, error } = await politicalQuery;
        if (error) throw error;
        return { rows: data || [], hasMore: data?.length === PAGE_SIZE };
      }

      if (category === "political" && !needle && ["parliamentary", "assembly"].includes(politicalLevel)) {
        let politicalQuery = supabase.from("geographies").select(FIELDS)
          .eq("boundary_category", "political")
          .eq("geography_type", politicalLevel === "parliamentary" ? "parliamentary_constituency" : "assembly_constituency")
          .order("name", { ascending: true }).range(from, to);
        if (politicalStateFilter !== "all") politicalQuery = politicalQuery.eq("parent_id", politicalStateFilter);
        const { data, error } = await politicalQuery;
        if (error) throw error;
        return { rows: data || [], hasMore: data?.length === PAGE_SIZE };
      }

      let query = supabase
        .from("geographies")
        .select(FIELDS)
        .order("name", { ascending: true })
        .range(from, to);

      if (category === "administrative") {
        query = query.or("boundary_category.eq.administrative,boundary_category.is.null");
      } else {
        query = query.eq("boundary_category", category);
      }

      if (isFlatMode) {
        if (needle) {
          const safeNeedle = needle.replace(/["\\]/g, "\\$&");
          const pattern = `%${safeNeedle}%`;
          query = query.or(
            `name.ilike."${pattern}",official_name.ilike."${pattern}"`,
          );
        }
      } else if (!parent) {
        query = query
          .eq("parent_id", DEFAULT_GEOGRAPHY_FOCUS_ID)
          .eq("geography_type", "state")
          .or("boundary_category.eq.administrative,boundary_category.is.null");
      } else {
        query = query.eq("parent_id", parent.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        rows: data || [],
        hasMore: data?.length === PAGE_SIZE,
      };
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length : undefined,
  });

  const items = useMemo(
    () => (geographyPages?.pages || []).flatMap((page) => page.rows || []),
    [geographyPages],
  );



  const selectGeography = async (item) => {
    const requestId = ++geometryRequestRef.current;
    setSelected(item);
    setGeometry(null);
    setLoadingGeometry(true);

    try {
      const nextGeometry = await fetchGeographyGeometry(item);
      if (requestId !== geometryRequestRef.current) return;
      setGeometry(nextGeometry);

      // If the row has no stored center (common for imported political
      // boundaries), derive a safe camera target from its geometry bounds.
      const geometryCoordinates = nextGeometry?.type === "Feature" ? nextGeometry.geometry?.coordinates : nextGeometry?.coordinates;
      if (geometryCoordinates) {
        const points = [];
        const visitCoordinates = (value) => {
          if (!Array.isArray(value)) return;
          if (typeof value[0] === "number" && typeof value[1] === "number") {
            points.push(value);
            return;
          }
          value.forEach(visitCoordinates);
        };
        visitCoordinates(geometryCoordinates);
        if (points.length) {
          const bounds = points.reduce((result, point) => ({
            minLng: Math.min(result.minLng, point[0]),
            maxLng: Math.max(result.maxLng, point[0]),
            minLat: Math.min(result.minLat, point[1]),
            maxLat: Math.max(result.maxLat, point[1]),
          }), { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity });
          setSelected((current) => current?.id === item.id ? {
            ...current,
            center: current.center || {
              lat: (bounds.minLat + bounds.maxLat) / 2,
              lng: (bounds.minLng + bounds.maxLng) / 2,
            },
            bounds: [[bounds.minLng, bounds.minLat], [bounds.maxLng, bounds.maxLat]],
          } : current);
        }
      }
    } catch {
      if (requestId !== geometryRequestRef.current) return;
      setGeometry(null);
    } finally {
      if (requestId === geometryRequestRef.current) setLoadingGeometry(false);
    }
  };

  const goBack = () => {
    if (["all-districts", "all-parliamentary", "all-assembly", "metropolitan", "local-bodies"].includes(browseMode) && browsePath.length === 0) {
      setBrowseMode("root");
      setPoliticalLevel("state");
      setSelected(null);
      setGeometry(null);
      setSearch("");
      return;
    }
    setBrowsePath((path) => path.slice(0, -1));
    setSelected(null);
    setGeometry(null);
    setLoadingGeometry(false);
    geometryRequestRef.current += 1;
    if (category === "local_government" && ["zones", "wards"].includes(browseMode)) {
      setBrowseMode("local-bodies");
    } else {
      setBrowseMode("root");
      if (category === "political") {
        setPoliticalLevel("state");
        setPoliticalStateFilter("all");
      }
    }
  };

  const backToStates = () => {
    setBrowsePath([]);
    setBrowseMode("root");
    setSelected(null);
    setGeometry(null);
    setSearch("");
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setSearch("");
    setBrowseMode("root");
    setPoliticalLevel("state");
    setPoliticalStateFilter("all");
    setBrowsePath([]);
    setSelected(null);
    setGeometry(null);
  };


  const resetActiveSelection = () => {
    setSelected(null);
    setGeometry(null);
    setLoadingGeometry(false);
    geometryRequestRef.current += 1;
  };

  const exploreAll = (mode) => {
    const currentPath = browsePath;
    const selectedState = selected?.geography_type === "state" ? selected : currentPath.find((item) => item.geography_type === "state");
    const selectedLocalBody = selected?.geography_type === "local_government"
      ? selected
      : currentPath.find((item) => item.geography_type === "local_government");

    if (["state-districts", "metropolitan", "local-bodies", "assembly-state"].includes(mode)) {
      const context = mode === "metropolitan" || mode === "local-bodies"
        ? selectedState
        : selected;
      setBrowsePath(context ? [context] : []);
    } else if (["zones", "wards"].includes(mode)) {
      setBrowsePath(selectedLocalBody ? [selectedLocalBody] : currentPath.filter((item) => item.geography_type === "local_government"));
    } else if (["all-parliamentary", "all-assembly", "all-districts"].includes(mode)) {
      setBrowsePath([]);
    }
    resetActiveSelection();
    setBrowseMode(mode);
    setSearch("");
  };

  const explorePoliticalLevel = (level) => {
    const state = selected?.geography_type === "state"
      ? selected
      : browsePath.find((item) => item.geography_type === "state");
    setPoliticalLevel(level);
    setPoliticalStateFilter(state?.id || "all");
    setBrowsePath(state ? [state] : []);
    resetActiveSelection();
    setBrowseMode(level === "parliamentary" ? "all-parliamentary" : "all-assembly");
    setSearch("");
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setBrowsePath([]);
    setBrowseMode("root");
  };

  const handleSave = async () => {
    if (!selected || selected.id === currentGeographyId) return;

    if (selectionOnly) {
      onSelectBoundary?.(selected);
      if (!embedded) onOpenChange?.(false);
      return;
    }

    try {
      await setGeography({ entityId: targetId, entityType, geographyId: selected.id });
      onSaved?.(selected);
      toast.success(currentGeographyId ? "Geography changed" : "Geography added");
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to save geography");
    }
  };

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: "240px" },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (!open || !currentGeography) return;

    let cancelled = false;

    const loadCurrentGeometry = async () => {
      try {
        const nextGeometry = await fetchGeographyGeometry(currentGeography);
        if (!cancelled) {
          setGeometry(nextGeometry);
          const coordinates = nextGeometry?.type === "Feature" ? nextGeometry.geometry?.coordinates : nextGeometry?.coordinates;
          const points = [];
          const visit = (value) => {
            if (!Array.isArray(value)) return;
            if (typeof value[0] === "number" && typeof value[1] === "number") { points.push(value); return; }
            value.forEach(visit);
          };
          visit(coordinates);
          if (points.length) {
            const bounds = points.reduce((result, point) => ({
              minLng: Math.min(result.minLng, point[0]), maxLng: Math.max(result.maxLng, point[0]),
              minLat: Math.min(result.minLat, point[1]), maxLat: Math.max(result.maxLat, point[1]),
            }), { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity });
            setSelected((current) => current?.id === currentGeography.id ? {
              ...current,
              center: current.center || { lat: (bounds.minLat + bounds.maxLat) / 2, lng: (bounds.minLng + bounds.maxLng) / 2 },
              bounds: [[bounds.minLng, bounds.minLat], [bounds.maxLng, bounds.maxLat]],
            } : current);
          }
        }
      } catch {
        if (!cancelled) setGeometry(null);
      }
    };

    loadCurrentGeometry();

    return () => {
      cancelled = true;
    };
  }, [open, currentGeography, mapRenderer]);

  const label = selected?.official_name || selected?.name || "Geography";
  const center = selected?.center || { lat: 20.5937, lng: 78.9629 };
  const politicalParent = browsePath[browsePath.length - 1] || null;
  const politicalState = selected?.geography_type === "state"
    ? selected
    : browsePath.find((item) => item.geography_type === "state") || null;
  const localBodyContext = browsePath.find((item) => item.geography_type === "local_government") || null;
  const mapParentId = category === "political"
    ? ["all-parliamentary", "all-assembly"].includes(browseMode) && politicalStateFilter === "all"
      ? "__all__"
      : politicalStateFilter !== "all" ? politicalStateFilter : DEFAULT_GEOGRAPHY_FOCUS_ID
    : category === "administrative"
      ? browseMode === "state-districts" ? politicalParent?.id : browseMode === "all-districts" ? "__all__" : DEFAULT_GEOGRAPHY_FOCUS_ID
      : browseMode === "root" ? DEFAULT_GEOGRAPHY_FOCUS_ID
        : ["metropolitan", "local-bodies"].includes(browseMode) && !politicalParent ? "__all__"
          : politicalParent?.id || DEFAULT_GEOGRAPHY_FOCUS_ID;
  const mapCategory = category === "local_government" && browseMode === "root" || category === "political" && politicalLevel === "state"
    ? "administrative"
    : category;
  const mapGeographyType = category === "political"
    ? politicalLevel === "state" ? "state" : politicalLevel === "parliamentary" ? "parliamentary_constituency" : "assembly_constituency"
    : category === "administrative"
      ? browseMode === "all-districts" || browseMode === "state-districts" ? "district" : "state"
      : browseMode === "metropolitan" ? "metropolitan_area"
        : browseMode === "local-bodies" ? "local_government"
          : browseMode === "zones" ? "zone"
            : browseMode === "wards" ? "ward" : "state";
  const mapBoundary =
    selected && geometry
      ? [
          {
            id: selected.id,
            osm_type: selected.osm_type,
            osm_id: selected.osm_id,
            name: label,
            center: selected.center,
            geojson: geometry,
          },
        ]
      : [];



  const browserContent = (
      <div className={embedded
        ? "grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden md:grid-cols-[360px_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)_auto]"
        : "grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden md:grid-cols-[360px_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)_auto]"
      }>
        <aside className="order-1 flex max-h-[43dvh] min-h-0 shrink-0 flex-col border-b md:order-none md:row-span-3 md:max-h-none md:border-b-0 md:border-r">
          <div className="space-y-2 border-b p-3 sm:space-y-3 sm:p-4">
            <Tabs value={category} onValueChange={handleCategoryChange} className="w-full">
              <TabsList className="grid h-10 w-full grid-cols-3">
                {GEOGRAPHY_BOUNDARY_CATEGORIES.map((item) => (
                  <TabsTrigger key={item.value} value={item.value} className="px-2 text-xs sm:text-sm">
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex min-w-0 gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search boundary..."
                  className="h-9 pl-9"
                />
              </div>


            </div>



          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="p-1.5 sm:p-2">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading boundaries...
                </div>
              ) : items.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No boundaries found.
                </div>
              ) : (
                <>
                  {items.map((item) => {
                    const isSelected = selected?.id === item.id;

                    return (
                      <div
                        key={item.id}
                        className={
                          "flex w-full items-center gap-3 border-b px-3 py-2.5 last:border-b-0 " +
                          (isSelected ? "bg-accent" : "hover:bg-muted")
                        }
                      >
                        <button
                          type="button"
                          onClick={() => selectGeography(item)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-3"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {item.official_name || item.name}
                            </span>

                          </span>
                        </button>


                      </div>
                    );
                  })}

                  <div ref={loadMoreRef} className="flex min-h-10 items-center justify-center">
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading more boundaries...
                      </div>
                    ) : hasNextPage ? (
                      <span className="py-3 text-xs text-muted-foreground">
                        Scroll for more boundaries
                      </span>
                    ) : (
                      <span className="py-3 text-xs text-muted-foreground">
                        All boundaries loaded
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </aside>

        {embedded ? (
          <div className="order-0 flex min-h-14 min-w-0 shrink-0 flex-wrap items-center gap-3 border-b px-4 py-2.5 sm:px-5 md:order-none">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={goBack}
              disabled={browseMode === "root" && browsePath.length === 0}
              aria-label="Go back"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              {category === "political" ? "Explore Constituency" : "Explore"}
            </span>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {category === "administrative" && (
                <>
                  <Button type="button" size="sm" variant={browseMode === "root" ? "secondary" : "outline"} onClick={backToStates}>States of India</Button>
                  <Button type="button" size="sm" variant={browseMode === "all-districts" || browseMode === "state-districts" ? "secondary" : "outline"} onClick={() => exploreAll(browsePath[0]?.geography_type === "state" ? "state-districts" : selected?.geography_type === "state" ? "state-districts" : "all-districts")}>
                    {browseMode === "state-districts" ? "Districts in " + (browsePath[0]?.name || "State") : selected?.geography_type === "state" ? "Districts in " + selected.name : "Districts of India"}
                  </Button>
                </>
              )}
              {category === "political" && (
                <>
                  <Button type="button" size="sm" variant={politicalLevel === "parliamentary" ? "secondary" : "outline"} onClick={() => explorePoliticalLevel("parliamentary")}>
                    Parliament{politicalState?.name ? " in " + politicalState.name : ""}
                  </Button>
                  <Button type="button" size="sm" variant={politicalLevel === "assembly" ? "secondary" : "outline"} onClick={() => explorePoliticalLevel("assembly")}>
                    Assembly{politicalState?.name ? " in " + politicalState.name : ""}
                  </Button>
                </>
              )}
              {category === "local_government" && (
                (localBodyContext || selected?.geography_type === "local_government") && ["local-bodies", "zones", "wards"].includes(browseMode) ? (
                  <>
                    <Button type="button" size="sm" variant={browseMode === "zones" ? "secondary" : "outline"} onClick={() => exploreAll("zones")}>Zones in {localBodyContext?.name || selected?.name || "Local Body"}</Button>
                    <Button type="button" size="sm" variant={browseMode === "wards" ? "secondary" : "outline"} onClick={() => exploreAll("wards")}>Wards in {localBodyContext?.name || selected?.name || "Local Body"}</Button>
                  </>
                ) : (
                  <>
                    <Button type="button" size="sm" variant={browseMode === "metropolitan" ? "secondary" : "outline"} onClick={() => exploreAll("metropolitan")}>Metropolitan Area{politicalState?.name ? " in " + politicalState.name : ""}</Button>
                    <Button type="button" size="sm" variant={browseMode === "local-bodies" ? "secondary" : "outline"} onClick={() => exploreAll("local-bodies")}>Local Body{politicalState?.name ? " in " + politicalState.name : ""}</Button>
                  </>
                )
              )}
            </div>

          </div>
        ) : null}

        <main className="relative order-2 min-h-[180px] min-w-0 flex-1 overflow-hidden bg-muted/20 md:order-none md:flex-none">
          {mapRenderer === "tiles" ? (
            <GeographyTilesMap
              key="geography-hierarchy-map"
              lat={Number(center?.lat) || 20.5937}
              lng={Number(center?.lng) || 78.9629}
              zoom={selected ? getGeographyZoom(selected.geography_type) : 4}
              focusEnabled
              parentId={mapParentId}
              selectedId={selected?.id || null}
              category={mapCategory}
              geographyType={mapGeographyType}
              selectedBounds={selected?.bounds || null}
              onFeatureClick={selectGeography}
            />
          ) : (
            <LeafletMap
              key={selected?.id || "empty-boundary-map"}
              lat={Number(center?.lat) || 20.5937}
              lng={Number(center?.lng) || 78.9629}
              boundaries={mapBoundary}
              selectedBoundaryId={selected?.id || null}
              showMarker={false}
              zoom={12}
              onChange={() => {}}
              onBoundaryClick={() => {}}
            />
          )}

          {loadingGeometry && (
            <div className="absolute right-3 top-3 flex items-center gap-2 rounded-md border bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading boundary...
            </div>
          )}

          {!selected && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-lg border bg-background/90 px-4 py-3 text-center text-sm shadow-sm">
                Select a boundary to preview it on the map.
              </div>
            </div>
          )}
        </main>

        <div className="order-3 flex min-w-0 shrink-0 flex-col gap-2 border-t bg-background px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3 md:order-none">
          <div className="min-w-0">
            {selected ? (
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <p className="truncate text-sm font-semibold">{label}</p>
                <p className="min-w-0 text-xs text-muted-foreground">
                  {descriptionOverride || (entityName ? `For ${entityName}` : getGeographyTypeLabel(selected.geography_type))}
                </p>
              </div>
            ) : (
              <p className="text-sm font-medium">No boundary selected</p>
            )}
          </div>

          {!embedded && <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={!selectionOnly && isSetting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={(!selectionOnly && isSetting) || !selected || selected.id === currentGeographyId || loadingGeometry}
            >
              {selectionOnly ? "Apply focus" : isSetting ? "Saving..." : currentGeographyId ? "Change boundary" : "Add geography"}
            </Button>
          </div>}
        </div>
      </div>
    );

  if (embedded) return browserContent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[90vh] sm:w-[96vw] sm:rounded-lg">
        <DialogTitle className="sr-only">
          {selectionOnly ? "Choose geographic focus" : currentGeographyId ? "Change boundary" : "Add geography"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {descriptionOverride || (entityName ? `Boundary for ${entityName}` : "Select a geographic boundary.")}
        </DialogDescription>
        {browserContent}
      </DialogContent>
    </Dialog>
  );
}
