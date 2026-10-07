"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
} from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GeographySearch from "@/components/geography/GeographySearch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { fetchGeographyGeometry } from "@/hooks/geography/useGeographyBrowser";
import { useGovernanceGeography, useGovernanceGeographyMutation } from "@/hooks/geography/useGovernanceGeography";
import {
  GEOGRAPHY_BOUNDARY_CATEGORIES,
  getGeographyBoundaryCategory,
  getGeographyCategoryLabel,
  getGeographyTypeLabel,
} from "@/config/geography/boundaryCategories";

const LeafletMap = dynamic(() => import("@/components/geography/LeafletMap"), { ssr: false });
const PAGE_SIZE = 80;

const FIELDS =
  "id,name,official_name,geography_type,boundary_category,parent_id,country_code,osm_type,osm_id,center,metadata";

const HIERARCHY_ROOT_TYPES = {
  administrative: ["state"],
  local_government: ["metropolitan_area", "local_government"],
  political: ["parliamentary_constituency"],
};

function canDrillDown(item) {
  if (!item) return false;

  return (
    item.geography_type === "state" ||
    item.geography_type === "district" ||
    item.geography_type === "local_government" ||
    item.geography_type === "zone" ||
    item.geography_type === "parliamentary_constituency"
  );
}

function getBrowseLabel(category, path) {
  if (!path.length) {
    if (category === "administrative") return "States";
    if (category === "local_government") return "Metropolitan areas and municipal bodies";
    return "Parliamentary constituencies";
  }

  const current = path[path.length - 1];
  if (current.geography_type === "state") return "Districts";
  if (current.geography_type === "district") return "Sub-districts";
  if (current.geography_type === "local_government") return "Zones";
  if (current.geography_type === "zone") return "Wards";
  if (current.geography_type === "parliamentary_constituency") return "Assembly constituencies";
  return "Boundaries";
}

export default function AddGeographyDialog({ open, onOpenChange, governanceId, entityName, onSaved }) {
  const [category, setCategory] = useState("administrative");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [browsePath, setBrowsePath] = useState([]);
  const [geometry, setGeometry] = useState(null);
  const [loadingGeometry, setLoadingGeometry] = useState(false);
  const geometryRequestRef = useRef(0);
  const loadMoreRef = useRef(null);

  const { data: relationships = [] } = useGovernanceGeography(governanceId, open);
  const currentGeography = relationships[0]?.geographies || null;
  const currentGeographyId = relationships[0]?.geography_id || null;
  const { setGeography, isSetting } = useGovernanceGeographyMutation();

  useEffect(() => {
    if (!open) return;

    const nextCategory = currentGeography
      ? getGeographyBoundaryCategory(currentGeography)
      : "administrative";

    setCategory(nextCategory);
    setType("all");
    setSearch("");
    setBrowsePath([]);
    setSelected(currentGeography || null);
    setGeometry(null);
    geometryRequestRef.current += 1;
  }, [open, currentGeography]);

  const activeCategory =
    GEOGRAPHY_BOUNDARY_CATEGORIES.find((item) => item.value === category) ||
    GEOGRAPHY_BOUNDARY_CATEGORIES[0];

  const isFlatMode = Boolean(search.trim()) || type !== "all";

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
      type,
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

      if (
        !isFlatMode &&
        category === "political" &&
        parent?.geography_type === "parliamentary_constituency"
      ) {
        const { data, error } = await supabase.rpc("get_political_geography_children", {
          p_parent_id: parent.id,
        });

        if (error) throw error;

        return {
          rows: data || [],
          hasMore: false,
        };
      }

      let query = supabase
        .from("geographies")
        .select(FIELDS)
        .eq("boundary_category", category)
        .order("name", { ascending: true })
        .range(from, to);

      if (isFlatMode) {
        if (type !== "all") {
          query = query.eq("geography_type", type);
        }

        if (needle) {
          query = query.or(
            "name.ilike.%" + needle + "%,official_name.ilike.%" + needle + "%",
          );
        }
      } else if (!parent) {
        query = query.in("geography_type", HIERARCHY_ROOT_TYPES[category] || []);
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

  const typeOptions = useMemo(
    () => activeCategory.types.filter((item) => item !== "country"),
    [activeCategory],
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
    } catch {
      if (requestId !== geometryRequestRef.current) return;
      setGeometry(null);
    } finally {
      if (requestId === geometryRequestRef.current) setLoadingGeometry(false);
    }
  };

  const drillInto = (item) => {
    if (!canDrillDown(item)) return;
    setSearch("");
    setType("all");
    setBrowsePath((path) => [...path, item]);
  };

  const goBack = () => {
    setBrowsePath((path) => path.slice(0, -1));
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setType("all");
    setSearch("");
    setBrowsePath([]);
  };

  const handleTypeChange = (value) => {
    setType(value);
    setBrowsePath([]);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setBrowsePath([]);
  };

  const handleSave = async () => {
    if (!selected || selected.id === currentGeographyId) return;

    try {
      await setGeography({ governanceId, geographyId: selected.id });
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
        if (!cancelled) setGeometry(nextGeometry);
      } catch {
        if (!cancelled) setGeometry(null);
      }
    };

    loadCurrentGeometry();

    return () => {
      cancelled = true;
    };
  }, [open, currentGeography]);

  const label = selected?.official_name || selected?.name || "Geography";
  const center = selected?.center || { lat: 20.5937, lng: 78.9629 };
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

  const selectionPath = browsePath.length
    ? browsePath.map((item) => item.name).join(" / ")
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid h-[90vh] w-[96vw] max-w-[1400px] grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 md:grid-cols-[400px_minmax(0,1fr)]">
        <aside className="row-span-3 flex min-h-0 flex-col border-b md:border-b-0 md:border-r">
          <div className="space-y-3 border-b p-4">
            <div className="grid grid-cols-3 rounded-md border bg-muted/30 p-0.5">
              {GEOGRAPHY_BOUNDARY_CATEGORIES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleCategoryChange(item.value)}
                  className={
                    "rounded px-2 py-2 text-sm font-medium transition-colors " +
                    (category === item.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>

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

              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className="h-9 w-[150px] shrink-0">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {typeOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {getGeographyTypeLabel(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isFlatMode && (
              <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                {browsePath.length > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-1 font-medium text-foreground hover:bg-muted"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                )}
                <span className="truncate">{getBrowseLabel(category, browsePath)}</span>
                {browsePath.length > 0 && (
                  <span className="truncate text-muted-foreground/70">
                    · {browsePath.map((item) => item.name).join(" / ")}
                  </span>
                )}
              </div>
            )}

            {isFlatMode && (
              <div className="text-xs text-muted-foreground">
                Search results match any boundary in this category.
              </div>
            )}
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="p-2">
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
                    const drillable = !isFlatMode && canDrillDown(item);

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
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {item.official_name || item.name}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {getGeographyTypeLabel(item.geography_type)}
                            </span>
                          </span>
                        </button>

                        {drillable && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => drillInto(item)}
                            aria-label={"Browse " + item.name}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
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

        <DialogHeader className="min-w-0 border-b px-5 py-4 pr-14 text-left">
          <DialogTitle className="text-lg">
            {currentGeographyId ? "Change geography" : "Add geography"}
          </DialogTitle>
          <DialogDescription className="truncate">
            Choose the boundary associated with {entityName || "this entity"}.
          </DialogDescription>
        </DialogHeader>

        <main className="relative min-h-0 overflow-hidden bg-muted/20">
          <LeafletMap
            key={selected?.id || "empty-boundary-map"}
            lat={Number(center?.lat) || 20.5937}
            lng={Number(center?.lng) || 78.9629}
            boundaries={mapBoundary}
            selectedBoundaryId={selected?.id || null}
            showMarker={false}
            zoom={8}
            onChange={() => {}}
            onBoundaryClick={() => {}}
          />

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

        <div className="flex min-w-0 flex-col border-t bg-background px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            {selected ? (
              <>
                <p className="truncate text-sm font-semibold">{label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {getGeographyCategoryLabel(getGeographyBoundaryCategory(selected))}
                  {" · "}
                  {getGeographyTypeLabel(selected.geography_type)}
                  {selectionPath ? " · " + selectionPath : ""}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">No boundary selected</p>
                <p className="text-xs text-muted-foreground">
                  Select a boundary from the list to preview it on the map.
                </p>
              </>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isSetting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={
                isSetting ||
                !selected ||
                selected.id === currentGeographyId ||
                loadingGeometry
              }
            >
              {isSetting
                ? "Saving..."
                : currentGeographyId
                  ? "Change geography"
                  : "Add geography"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
