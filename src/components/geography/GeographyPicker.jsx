"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, MapPin } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

import GeographySearch from "@/components/geography/GeographySearch";
import GeographyTypeFilter, { geographyTypeLabel } from "@/components/geography/GeographyTypeFilter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

const PAGE_SIZE = 50;

export default function GeographyPicker({
  open,
  onOpenChange,
  value = null,
  onValueChange,
  excludeId = null,
  title = "Select geography",
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  useEffect(() => {
    if (!open) {
      setSearch("");
      setType("all");
    }
  }, [open]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: queryKeys.geography.search({
        search: search.trim(),
        type,
        limit: PAGE_SIZE,
      }),
      enabled: open,
      initialPageParam: 0,
      queryFn: async ({ pageParam = 0 }) => {
        let request = supabase
          .from("geographies")
          .select(
            "id,name,official_name,geography_type,parent_id,country_code,osm_type,osm_id,admin_level,source,source_url,center",
          )
          .order("name", { ascending: true })
          .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1);

        if (type !== "all") request = request.eq("geography_type", type);

        const needle = search.trim().replace(/[%_]/g, "").slice(0, 80);
        if (needle) {
          request = request.or(
            `name.ilike.%${needle}%,official_name.ilike.%${needle}%`,
          );
        }

        const { data: rows, error } = await request;
        if (error) throw error;
        return rows || [];
      },
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === PAGE_SIZE ? allPages.length : undefined,
      staleTime: 5 * 60 * 1000,
    });

  const rows = data?.pages?.flatMap((page) => page) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 border-b p-4">
          <div className="flex gap-2">
            <GeographyTypeFilter
              value={type}
              onValueChange={setType}
              className="w-48 shrink-0"
            />
            <GeographySearch
              value={search}
              onChange={setSearch}
              placeholder="Search by name..."
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Choose the boundary type first, then search. Results load in pages.
          </p>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading geographies…
              </div>
            ) : rows.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No matching boundaries found.
              </div>
            ) : (
              rows.map((item) => {
                if (item.id === excludeId) return null;
                const selected = item.id === value;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onValueChange?.(item);
                      onOpenChange?.(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-muted"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {item.official_name || item.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {geographyTypeLabel(item.geography_type)}
                      </span>
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })
            )}

            {hasNextPage && (
              <div className="flex justify-center border-t p-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
