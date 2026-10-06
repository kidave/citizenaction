"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, MapPin, Search } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { fetchGeographyGeometry } from "@/hooks/geography/useGeographyBrowser";
import { useGovernanceGeography, useGovernanceGeographyMutation } from "@/hooks/geography/useGovernanceGeography";
import { GEOGRAPHY_BOUNDARY_CATEGORIES, getGeographyBoundaryCategory, getGeographyTypeLabel } from "@/config/geography/boundaryCategories";

const LeafletMap = dynamic(() => import("@/components/geography/LeafletMap"), { ssr: false });
const PAGE_SIZE = 80;

export default function AddGeographyDialog({ open, onOpenChange, governanceId, entityName, onSaved }) {
  const [category, setCategory] = useState("administrative");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
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
    setCategory(currentGeography ? getGeographyBoundaryCategory(currentGeography) : "administrative");
    setType("all");
    setSearch("");
    setSelected(currentGeography || null);
    setGeometry(null);
    geometryRequestRef.current += 1;
  }, [open, currentGeography]);

  const activeCategory = GEOGRAPHY_BOUNDARY_CATEGORIES.find((item) => item.value === category) || GEOGRAPHY_BOUNDARY_CATEGORIES[0];

  const {
    data: geographyPages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["geography-picker", category, type, search.trim()],
    enabled: open,
    staleTime: 5 * 60 * 1000,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const needle = search.trim().replace(/[%_]/g, "").slice(0, 80);

      let query = supabase
        .from("geographies")
        .select(
          "id,name,official_name,geography_type,boundary_category,parent_id,country_code,osm_type,osm_id,center,metadata",
        )
        .eq("boundary_category", category)
        .order("name", { ascending: true })
        .range(from, to);

      if (category === "administrative" && type === "all") {
        query = query.neq("geography_type", "country");
      } else if (type !== "all") {
        query = query.eq("geography_type", type);
      }

      if (needle) {
        query = query.or(`name.ilike.%${needle}%,official_name.ilike.%${needle}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const rows = data || [];

      // India is the default national context, not a type filter.
      // Only add it once at the beginning of the unfiltered administrative list.
      if (pageParam === 0 && category === "administrative" && type === "all" && !needle) {
        const { data: india } = await supabase
          .from("geographies")
          .select(
            "id,name,official_name,geography_type,boundary_category,parent_id,country_code,osm_type,osm_id,center,metadata",
          )
          .eq("geography_type", "country")
          .eq("name", "India")
          .maybeSingle();

        return {
          rows: india ? [india, ...rows] : rows,
          hasMore: rows.length === PAGE_SIZE,
        };
      }

      return {
        rows,
        hasMore: rows.length === PAGE_SIZE,
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
    // Clear the previous boundary immediately so it can never remain visible
    // while the newly selected boundary is loading.
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

  const handleSave = async () => {
    if (!selected || selected.id === currentGeographyId) return;
    try {
      await setGeography({ governanceId, geographyId: selected.id });
      onSaved?.(selected);
      toast.success(currentGeographyId ? "Geography changed" : "Geography added");
      onOpenChange?.(false);
    } catch (error) { toast.error(error?.message || "Unable to save geography"); }
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

  const label = selected?.official_name || selected?.name || "Geography";
  const center = selected?.center || { lat: 20.5937, lng: 78.9629 };
  const mapBoundary = selected && geometry
    ? [{
        id: selected.id,
        osm_type: selected.osm_type,
        osm_id: selected.osm_id,
        name: label,
        center: selected.center,
        geojson: geometry,
      }]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid h-[90vh] w-[96vw] max-w-[1400px] grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 md:grid-cols-[400px_minmax(0,1fr)]">
        <aside className="row-span-3 flex min-h-0 flex-col border-b md:border-b-0 md:border-r">
          <div className="space-y-3 border-b p-4">
            <div className="grid grid-cols-3 rounded-md border bg-muted/30 p-0.5">
              {GEOGRAPHY_BOUNDARY_CATEGORIES.map((item) => (
                <button key={item.value} type="button" onClick={() => { setCategory(item.value); setType("all"); setSearch(""); }}
                  className={`rounded px-2 py-2 text-sm font-medium transition-colors ${category === item.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{activeCategory.description}</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search boundary..." className="pl-9" />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="All boundary types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All boundary types</SelectItem>
                {typeOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {getGeographyTypeLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />Loading boundaries...
                </div>
              ) : items.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No boundaries found.</div>
              ) : (
                <>
                  {items.map((item) => {
                const isSelected = selected?.id === item.id;
                return (
                  <button key={item.id} type="button" onClick={() => selectGeography(item)}
                    className={`flex w-full items-center gap-3 border-b px-3 py-3 text-left last:border-b-0 ${isSelected ? "bg-accent" : "hover:bg-muted"}`}>
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{item.official_name || item.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{getGeographyTypeLabel(item.geography_type)}</span>
                    </span>
                  </button>
                  );
                  })}
                  <div ref={loadMoreRef} className="flex min-h-10 items-center justify-center">
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading more boundaries...
                      </div>
                    ) : hasNextPage ? (
                      <span className="py-3 text-xs text-muted-foreground">Scroll for more boundaries</span>
                    ) : (
                      <span className="py-3 text-xs text-muted-foreground">All boundaries loaded</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </aside>

        <DialogHeader className="min-w-0 border-b px-5 py-4 pr-14 text-left">
          <DialogTitle className="text-lg">{currentGeographyId ? "Change geography" : "Add geography"}</DialogTitle>
          <DialogDescription className="truncate">Choose the boundary associated with {entityName || "this entity"}.</DialogDescription>
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
            onChange={() => {}} onBoundaryClick={() => {}} />
          {loadingGeometry && (
            <div className="absolute right-3 top-3 flex items-center gap-2 rounded-md border bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />Loading boundary...
            </div>
          )}
          {!selected && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-lg border bg-background/90 px-4 py-3 text-center text-sm shadow-sm">Select a boundary to preview it on the map.</div>
            </div>
          )}
        </main>

        <div className="flex min-w-0 flex-col border-t bg-background px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            {selected ? (
              <>
                <p className="truncate text-sm font-semibold">{label}</p>
                <p className="truncate text-xs text-muted-foreground">{getGeographyTypeLabel(selected.geography_type)}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">No boundary selected</p>
                <p className="text-xs text-muted-foreground">Select a boundary from the list to preview it on the map.</p>
              </>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={isSetting}>Cancel</Button>
            <Button type="button" onClick={handleSave}
              disabled={isSetting || !selected || selected.id === currentGeographyId || loadingGeometry}>
              {isSetting ? "Saving..." : currentGeographyId ? "Change geography" : "Add geography"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
