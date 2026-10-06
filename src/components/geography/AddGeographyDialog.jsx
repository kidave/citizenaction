"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, MapPin, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
  }, [open, currentGeography]);

  const activeCategory = GEOGRAPHY_BOUNDARY_CATEGORIES.find((item) => item.value === category) || GEOGRAPHY_BOUNDARY_CATEGORIES[0];

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["geography-picker", category, type, search.trim()],
    enabled: open,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      let query = supabase.from("geographies")
        .select("id,name,official_name,geography_type,boundary_category,parent_id,country_code,osm_type,osm_id,center,metadata")
        .eq("boundary_category", category)
        .order("name", { ascending: true })
        .limit(PAGE_SIZE);
      if (type !== "all") query = query.eq("geography_type", type);
      const needle = search.trim().replace(/[%_]/g, "").slice(0, 80);
      if (needle) query = query.or(`name.ilike.%${needle}%,official_name.ilike.%${needle}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const typeOptions = useMemo(() => activeCategory.types, [activeCategory]);

  const selectGeography = async (item) => {
    setSelected(item);
    setLoadingGeometry(true);
    try { setGeometry(await fetchGeographyGeometry(item)); }
    catch { setGeometry(null); }
    finally { setLoadingGeometry(false); }
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

  const label = selected?.official_name || selected?.name || "Geography";
  const center = selected?.center || { lat: 20.5937, lng: 78.9629 };
  const mapBoundary = selected && geometry ? [{ osm_type: selected.osm_type, osm_id: selected.osm_id, name: label, center: selected.center, geojson: geometry }] : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-3xl md:max-w-5xl">
        <SheetHeader className="border-b px-4 py-3 text-left sm:px-5">
          <SheetTitle className="text-base">{currentGeographyId ? "Change geography" : "Add geography"}</SheetTitle>
          <SheetDescription>Choose the boundary associated with {entityName || "this entity"}.</SheetDescription>
        </SheetHeader>
        <div className="grid min-h-0 flex-1 md:grid-cols-[280px_1fr]">
          <div className="flex min-h-0 flex-col border-r">
            <div className="relative space-y-2 border-b p-3 pt-14">
              <div className="absolute left-4 right-4 top-3 z-[1000] grid grid-cols-3 rounded-md border bg-background/95 p-0.5 shadow-sm backdrop-blur">
                {GEOGRAPHY_BOUNDARY_CATEGORIES.map((item) => (
                  <button key={item.value} type="button" onClick={() => { setCategory(item.value); setType("all"); setSearch(""); }} className={`rounded px-2 py-1.5 text-xs font-medium ${category === item.value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{activeCategory.description}</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search boundary..." className="pl-9" />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-0.5">
                <button type="button" onClick={() => setType("all")} className={`shrink-0 rounded-full border px-2 py-1 text-[11px] ${type === "all" ? "bg-foreground text-background" : "hover:bg-muted"}`}>All</button>
                {typeOptions.map((item) => (
                  <button key={item} type="button" onClick={() => setType(item)} className={`shrink-0 rounded-full border px-2 py-1 text-[11px] ${type === item ? "bg-foreground text-background" : "hover:bg-muted"}`}>
                    {getGeographyTypeLabel(item)}
                  </button>
                ))}
              </div>
            </div>
            <ScrollArea className="min-h-0 flex-1">
              <div className="p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading boundaries...</div>
                ) : items.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">No boundaries found.</div>
                ) : items.map((item) => {
                  const isSelected = selected?.id === item.id;
                  return <button key={item.id} type="button" onClick={() => selectGeography(item)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left ${isSelected ? "bg-accent" : "hover:bg-muted"}`}>
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{item.official_name || item.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{getGeographyTypeLabel(item.geography_type)}</span>
                    </span>
                  </button>;
                })}
              </div>
            </ScrollArea>
          </div>
          <div className="flex min-h-0 flex-col">
            <div className="relative min-h-[22rem] flex-1 bg-muted/20">
              <LeafletMap lat={Number(center?.lat) || 20.5937} lng={Number(center?.lng) || 78.9629} boundaries={mapBoundary} selectedBoundaryId={selected?.osm_id || null} showMarker={false} zoom={8} onChange={() => {}} onBoundaryClick={() => {}} />
              {loadingGeometry && <div className="absolute right-3 top-3 flex items-center gap-2 rounded-md border bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm"><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading boundary...</div>}
              {!selected && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="rounded-lg border bg-background/90 px-4 py-3 text-center text-sm shadow-sm">Select a boundary to preview it on the map.</div></div>}
            </div>
          </div>
        </div>
        <SheetFooter className="border-t bg-background px-5 py-4 sm:px-6">
          {selected ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{label}</p><p className="text-xs text-muted-foreground">{getGeographyTypeLabel(selected.geography_type)}</p></div>
              <div className="flex shrink-0 gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={isSetting}>Cancel</Button><Button type="button" onClick={handleSave} disabled={isSetting || selected.id === currentGeographyId || loadingGeometry}>{isSetting ? "Saving..." : currentGeographyId ? "Change geography" : "Add geography"}</Button></div>
            </div>
          )  : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
