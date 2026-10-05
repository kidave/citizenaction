"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, MapPin } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

import GeographySearch from "@/components/geography/GeographySearch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

const PAGE_SIZE = 50;

export default function GeographyPicker({ open, onOpenChange, value = null, onValueChange, excludeId = null, title = "Select geography" }) {
  const [search, setSearch] = useState("");
  const loadMoreRef = useRef(null);

  useEffect(() => { if (!open) setSearch(""); }, [open]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: queryKeys.geography.pickerSearch(search.trim()),
    enabled: open,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      let request = supabase.from("geographies")
        .select("id,name,official_name,geography_type,parent_id,country_code,osm_type,osm_id,admin_level,source,source_url,center")
        .order("name", { ascending: true })
        .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1);

      const needle = search.trim().replace(/[%_]/g, "").slice(0, 80);
      if (needle) request = request.or(`name.ilike.%${needle}%,official_name.ilike.%${needle}%`);

      const { data: rows, error } = await request;
      if (error) throw error;
      return rows || [];
    },
    getNextPageParam: (lastPage, allPages) => lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const rows = data?.pages?.flatMap((page) => page) || [];
  const visibleRows = rows.filter((item) => item.id !== excludeId);
  const groupedRows = visibleRows.reduce((groups, item) => {
    const type = item.geography_type || "other";
    const label = type === "state" ? "States & Union Territories" : type.replace(/_/g, " ").replace(/\\b\\w/g, (letter) => letter.toUpperCase());
    const group = groups.find((entry) => entry.value === type);
    if (group) group.items.push(item);
    else groups.push({ value: type, label, items: [item] });
    return groups;
  }, []);
  const groupOrder = ["state", "district", "subdistrict", "sub_district", "local_government", "zone", "ward"];
  groupedRows.sort((a, b) => {
    const ai = groupOrder.indexOf(a.value);
    const bi = groupOrder.indexOf(b.value);
    return (ai < 0 ? groupOrder.length : ai) - (bi < 0 ? groupOrder.length : bi) || a.label.localeCompare(b.label);
  });

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, rows.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-5 py-4 text-left"><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="border-b p-4">
          <GeographySearch value={search} onChange={setSearch} placeholder="Search boundary..." />
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading geographies…</div>
            ) : visibleRows.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No matching boundaries found.</div>
            ) : groupedRows.map((group) => (
              <div key={group.value} className="space-y-1">
                <div className="px-3 pt-3 text-xs font-medium text-muted-foreground">{group.label}</div>
                {group.items.map((item) => {
                  const selected = item.id === value;
                  return (
                <button key={item.id} type="button" onClick={() => { onValueChange?.(item); onOpenChange?.(false); }} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-muted">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.official_name || item.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{item.official_name && item.name !== item.official_name ? item.name : ""}</span>
                  </span>
                  {selected && <Check className="h-4 w-4 shrink-0" />}
                </button>
                  );
                })}
              </div>
            ))
            <div ref={loadMoreRef} className="h-2" aria-hidden="true" />
            {isFetchingNextPage && <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading more boundaries…</div>}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
