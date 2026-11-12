"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { GEOGRAPHY_BOUNDARY_CATEGORIES, getGeographyTypeLabel } from "@/config/geography/boundaryCategories";

const PAGE_SIZE = 80;

export default function GeographyPicker({ open, onOpenChange, value = null, onValueChange, excludeId = null, title = "Select geography" }) {
  const [category, setCategory] = useState("administrative");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setCategory("administrative");
    setType("all");
    setSearch("");
  }, [open]);

  const active = GEOGRAPHY_BOUNDARY_CATEGORIES.find((item) => item.value === category) || GEOGRAPHY_BOUNDARY_CATEGORIES[0];

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["geography-picker-parent", category, type, search.trim()],
    enabled: open,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      let query = supabase.from("geographies")
        .select("id,name,official_name,geography_type,boundary_category,parent_id")
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

  const types = useMemo(() => active.types, [active]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-5 py-4 text-left"><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3 border-b p-4">
          <div className="grid grid-cols-3 rounded-lg border bg-muted/40 p-1">
            {GEOGRAPHY_BOUNDARY_CATEGORIES.map((item) => (
              <button key={item.value} type="button" onClick={() => { setCategory(item.value); setType("all"); setSearch(""); }} className={`rounded-md px-2 py-2 text-xs font-medium ${category === item.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {item.label}
              </button>
            ))}
          </div>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search boundary..." />
          <div className="flex gap-1.5 overflow-x-auto">
            <button type="button" onClick={() => setType("all")} className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${type === "all" ? "bg-foreground text-background" : "hover:bg-muted"}`}>All</button>
            {types.map((item) => <button key={item} type="button" onClick={() => setType(item)} className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${type === item ? "bg-foreground text-background" : "hover:bg-muted"}`}>{getGeographyTypeLabel(item)}</button>)}
          </div>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-2">
            {isLoading ? <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading boundaries…</div> :
              rows.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">No matching boundaries found.</div> :
              rows.map((item) => {
                if (item.id === excludeId) return null;
                const selected = item.id === value;
                return <button key={item.id} type="button" onClick={() => { onValueChange?.(item); onOpenChange?.(false); }} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-muted">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.official_name || item.name}</span><span className="block truncate text-xs text-muted-foreground">{getGeographyTypeLabel(item.geography_type)}</span></span>
                  {selected && <Check className="h-4 w-4 shrink-0" />}
                </button>;
              })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
