"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Map, Search, ChevronLeft, ChevronRight, MapPinned } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import {
  GEOGRAPHY_BOUNDARY_CATEGORIES,
  getGeographyTypeLabel,
} from "@/config/geography/boundaryCategories";

const PAGE_SIZE = 24;
const CATEGORY_VALUES = new Set(GEOGRAPHY_BOUNDARY_CATEGORIES.map((item) => item.value));

export default function GeographyDirectoryPage() {
  const router = useRouter();
  const routeCategory = typeof router.query.category === "string" ? router.query.category : "all";
  const category = CATEGORY_VALUES.has(routeCategory) ? routeCategory : "all";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [category, search]);

  const selectedCategory = useMemo(
    () => GEOGRAPHY_BOUNDARY_CATEGORIES.find((item) => item.value === category),
    [category],
  );

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["public-geography-directory", category, search.trim(), page],
    enabled: router.isReady,
    queryFn: async () => {
      let request = supabase
        .from("geographies")
        .select("id,name,official_name,other_names,slug,geography_type,boundary_category,parent_id,status,country_code", { count: "exact" })
        .eq("status", "active")
        .order("name", { ascending: true })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (category !== "all") request = request.eq("boundary_category", category);
      const needle = search.trim().replace(/[%_]/g, "").slice(0, 80);
      if (needle) request = request.or(`name.ilike.%${needle}%,official_name.ilike.%${needle}%`);

      const { data: rows, count, error: queryError } = await request;
      if (queryError) throw queryError;

      const parentIds = [...new Set((rows || []).map((row) => row.parent_id).filter(Boolean))];
      let parentNames = {};
      if (parentIds.length) {
        const { data: parents, error: parentError } = await supabase
          .from("geographies")
          .select("id,name")
          .in("id", parentIds);
        if (parentError) throw parentError;
        parentNames = Object.fromEntries((parents || []).map((item) => [item.id, item.name]));
      }

      return { rows: (rows || []).map((row) => ({ ...row, parent_name: parentNames[row.parent_id] || null })), count: count || 0 };
    },
    staleTime: 60 * 1000,
  });

  const rows = data?.rows || [];
  const count = data?.count || 0;
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const changeCategory = (value) => {
    router.push(value === "all" ? "/geography" : `/geography?category=${value}`, undefined, { shallow: true });
  };

  return (
    <div className="min-h-dvh w-full overflow-x-hidden">
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Map className="h-4 w-4" />
            <span>Explore</span>
            <span>/</span>
            <span>Geography</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Geography</h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Explore India’s administrative, local government and political boundaries.
            Each boundary is linked to its parent geography where available.
          </p>
        </header>

        <Tabs value={category} onValueChange={changeCategory}>
          <TabsList className="h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="all">All boundaries</TabsTrigger>
            {GEOGRAPHY_BOUNDARY_CATEGORIES.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {selectedCategory && (
          <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search boundaries by name"
              aria-label="Search boundaries by name"
              className="pl-9"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Loading boundaries…" : `${count.toLocaleString()} boundaries`}
          </span>
        </div>

        {error ? (
          <Card><CardContent className="p-10 text-center text-sm text-destructive">Unable to load geography boundaries. Please try again.</CardContent></Card>
        ) : isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <Card key={index} className="h-28 animate-pulse bg-muted/40" />)}
          </div>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
              <MapPinned className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No boundaries found</p>
              <p className="text-sm text-muted-foreground">Try another search or boundary category.</p>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
            {rows.map((row) => (
              <Card key={row.id} className="h-full">
                <CardContent className="flex h-full flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-medium leading-snug">{row.name}</h2>
                    <Badge variant="secondary" className="shrink-0">{getGeographyTypeLabel(row.geography_type)}</Badge>
                  </div>
                  {row.official_name && row.official_name !== row.name && (
                    <p className="text-xs text-muted-foreground">{row.official_name}</p>
                  )}
                  <div className="mt-auto space-y-1 text-xs text-muted-foreground">
                    {row.parent_name && <p>Part of {row.parent_name}</p>}
                    {row.other_names?.length > 0 && <p>Also known as {row.other_names.join(", ")}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {count > PAGE_SIZE && (
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">Page {page + 1} of {pageCount}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0 || isFetching} onClick={() => setPage((value) => Math.max(0, value - 1))}>
                <ChevronLeft className="mr-1 h-4 w-4" />Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page + 1 >= pageCount || isFetching} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>
                Next<ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

GeographyDirectoryPage.getLayout = (page) => page;
