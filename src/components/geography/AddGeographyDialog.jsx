"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const GeographyTilesMap = dynamic(() => import("@/components/geography/GeographyTilesMap"), { ssr: false });
const LeafletMap = dynamic(() => import("@/components/geography/LeafletMap"), { ssr: false });
const DEFAULT_GEOGRAPHY_FOCUS_ID = "6f3dda25-6cf4-43f2-a5b7-1c8aa9d2113f";
const PAGE_SIZE = 80;

const FIELDS =
  "id,name,official_name,geography_type,boundary_category,parent_id,country_code,osm_type,osm_id,center,metadata";

function getBrowseLabel(category, path, browseMode, politicalLevel) {
  if (!path.length) {
    if (category === "administrative") {
      return browseMode === "all-districts" ? "Districts across India" : "States and Union Territories";
    }
    if (category === "local_government") return "States and Union Territories";
    if (category === "political") {
      if (politicalLevel === "parliamentary") return "Parliamentary constituencies across India";
      if (politicalLevel === "assembly") return "Select a state";
      return "States and Union Territories";
    }
    return "States and Union Territories";
  }

  const current = path[path.length - 1];
  if (category === "political" && current.geography_type === "state") return "Parliamentary constituencies in " + current.name;
  if (category === "political" && current.geography_type === "parliamentary_constituency") return "Assembly constituencies in " + current.name;
  if (category === "local_government" && current.geography_type === "state") {
    return browseMode === "metropolitan" ? "Metropolitan areas in " + current.name : "Local bodies in " + current.name;
  }
  if (category === "local_government" && current.geography_type === "metropolitan_area") return "Local bodies in " + current.name;
  if (category === "local_government" && current.geography_type === "local_government") {
    return browseMode === "zones" ? "Zones in " + current.name : "Wards in " + current.name;
  }
  if (current.geography_type === "state") return "Districts in " + current.name;
  if (current.geography_type === "district") return "Sub-districts in " + current.name;
  if (current.geography_type === "zone") return "Wards in " + current.name;
  return "Boundaries";
}

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

export default function AddGeographyDialog({ open, onOpenChange, governanceId = null, entityId = null, entityType = "governance", entityName, onSaved, selectionOnly = false, value = null, onSelectBoundary, title: titleOverride, embedded = false, mapRenderer = "leaflet" }) {
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
          const { data, error } = await supabase.from("geographies").select(FIELDS)
            .eq("parent_id", parent?.id).eq("boundary_category", "local_government")
            .eq("geography_type", kind).order("name", { ascending: true }).range(from, to);
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

      if (!needle && category === "political" && browseMode === "all-parliamentary") {
        const { data, error } = await supabase.from("geographies").select(FIELDS)
          .eq("boundary_category", "political").eq("geography_type", "parliamentary_constituency")
          .order("name", { ascending: true }).range(from, to);
        if (error) throw error;
        return { rows: data || [], hasMore: data?.length === PAGE_SIZE };
      }

      if (!needle && category === "political" && browseMode === "all-assembly") {
        const { data, error } = await supabase.from("geographies").select(FIELDS)
          .eq("boundary_category", "political").eq("geography_type", "assembly_constituency")
          .order("name", { ascending: true }).range(from, to);
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

      if (category === "political" && !needle && politicalLevel === "assembly") {
        if (!parent) {
          const { data, error } = await supabase
            .from("geographies")
            .select(FIELDS)
            .eq("parent_id", DEFAULT_GEOGRAPHY_FOCUS_ID)
            .eq("geography_type", "state")
            .order("name", { ascending: true })
            .range(from, to);
          if (error) throw error;
          return { rows: data || [], hasMore: data?.length === PAGE_SIZE };
        }

        if (parent.geography_type === "state") {
          const { data, error } = await supabase
            .from("geographies")
            .select(FIELDS)
            .eq("parent_id", parent.id)
            .eq("boundary_category", "political")
            .eq("geography_type", "parliamentary_constituency")
            .order("name", { ascending: true })
            .range(from, to);
          if (error) throw error;
          return { rows: data || [], hasMore: data?.length === PAGE_SIZE };
        }

        if (parent.geography_type === "parliamentary_constituency") {
          const { data, error } = await supabase.rpc("get_political_geography_children", {
            p_parent_id: parent.id,
          });
          if (error) throw error;
          return { rows: data || [], hasMore: false };
        }
      }

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
      const nextGeometry = mapRenderer === "tiles" ? null : await fetchGeographyGeometry(item);
      if (requestId !== geometryRequestRef.current) return;
      setGeometry(nextGeometry);

      // If the row has no stored center (common for imported political
      // boundaries), derive a safe camera target from its geometry bounds.
      if (!item.center && nextGeometry?.coordinates) {
        const points = [];
        const visitCoordinates = (value) => {
          if (!Array.isArray(value)) return;
          if (typeof value[0] === "number" && typeof value[1] === "number") {
            points.push(value);
            return;
          }
          value.forEach(visitCoordinates);
        };
        visitCoordinates(nextGeometry.coordinates);
        if (points.length) {
          const bounds = points.reduce((result, point) => ({
            minLng: Math.min(result.minLng, point[0]),
            maxLng: Math.max(result.maxLng, point[0]),
            minLat: Math.min(result.minLat, point[1]),
            maxLat: Math.max(result.maxLat, point[1]),
          }), { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity });
          setSelected((current) => current?.id === item.id ? {
            ...current,
            center: {
              lat: (bounds.minLat + bounds.maxLat) / 2,
              lng: (bounds.minLng + bounds.maxLng) / 2,
            },
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
    setBrowsePath((path) => path.slice(0, -1));
    setBrowseMode("root");
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

  const exploreMode = (mode) => {
    if (!selected) return;
    setBrowsePath([selected]);
    setBrowseMode(mode);
    setSearch("");
  };



  const exploreAll = (mode) => {
    if (mode === "state-districts" && selected?.geography_type === "state") {
      setBrowsePath([selected]);
    } else {
      setBrowsePath([]);
      setSelected(null);
      setGeometry(null);
    }
    setBrowseMode(mode);
    setSearch("");
  };

  const handlePoliticalLevelChange = (value) => {
    setPoliticalLevel(value);
    setBrowseMode("root");
    setPoliticalStateFilter("all");
    setBrowsePath([]);
    setSearch("");
    setSelected(null);
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
    if (!open || !currentGeography || mapRenderer === "tiles") return;

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
  }, [open, currentGeography, mapRenderer]);

  const label = selected?.official_name || selected?.name || "Geography";
  const center = selected?.center || { lat: 20.5937, lng: 78.9629 };
  const politicalParent = browsePath[browsePath.length - 1] || null;
  const mapParentId = category === "political"
    ? browseMode === "all-assembly" ? "__all__" : politicalLevel === "state" || (politicalLevel === "assembly" && !politicalParent)
      ? DEFAULT_GEOGRAPHY_FOCUS_ID
      : politicalLevel === "parliamentary"
        ? politicalStateFilter === "all" ? "__all__" : politicalStateFilter
        : politicalParent?.id || DEFAULT_GEOGRAPHY_FOCUS_ID
    : category === "administrative"
      ? browseMode === "state-districts" ? politicalParent?.id : browseMode === "all-districts" ? "__all__" : DEFAULT_GEOGRAPHY_FOCUS_ID
      : browseMode === "root" ? DEFAULT_GEOGRAPHY_FOCUS_ID : politicalParent?.id || DEFAULT_GEOGRAPHY_FOCUS_ID;
  const mapCategory = category === "local_government" && browseMode === "root" || category === "political" && (politicalLevel === "state" || (politicalLevel === "assembly" && !politicalParent && browseMode !== "all-assembly"))
    ? "administrative"
    : category;
  const mapGeographyType = category === "political"
    ? browseMode === "all-assembly" ? "assembly_constituency" : politicalLevel === "state" || (politicalLevel === "assembly" && !politicalParent)
      ? "state"
      : politicalLevel === "parliamentary" || politicalParent?.geography_type === "state"
        ? "parliamentary_constituency"
        : "assembly_constituency"
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

  const selectionPath = browsePath.length
    ? browsePath.map((item) => item.name).join(" / ")
    : "";

  const contextualActions = (() => {
    if (!selected || browsePath.some((item) => item.id === selected.id)) return [];
    if (category === "administrative" && selected.geography_type === "state") {
      return [
        { label: "Explore districts in " + selected.name, description: "Show districts belonging to this state", mode: "state-districts" },
        { label: "View all districts in India", description: "Show district boundaries nationwide", mode: "all-districts" },
      ];
    }
    if (category === "local_government" && selected.geography_type === "state") {
      return [
        { label: "Metropolitan areas", description: "Explore metropolitan regions in this state", mode: "metropolitan" },
        { label: "Local bodies", description: "Explore municipal corporations, municipalities and panchayats", mode: "local-bodies" },
      ];
    }
    if (category === "local_government" && selected.geography_type === "local_government") {
      return [
        { label: "Zones", description: "Explore zones within this local body", mode: "zones" },
        { label: "Wards", description: "Explore all wards belonging to this local body", mode: "wards" },
      ];
    }
    if (category === "political" && politicalLevel === "assembly" && selected.geography_type === "parliamentary_constituency") {
      return [{ label: "Explore assembly constituencies", description: "Show assembly constituencies within " + selected.name, mode: "assembly-constituencies" }];
    }
    return [];
  })();

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

            {category === "political" && (
              <Tabs value={politicalLevel} onValueChange={handlePoliticalLevelChange} className="w-full">
                <TabsList className="grid h-10 w-full grid-cols-3">
                  <TabsTrigger value="state" className="px-2 text-xs sm:text-sm">States</TabsTrigger>
                  <TabsTrigger value="parliamentary" className="px-2 text-xs sm:text-sm">Parliamentary</TabsTrigger>
                  <TabsTrigger value="assembly" className="px-2 text-xs sm:text-sm">Assembly</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

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

            {contextualActions.length > 0 && (
              <div className="space-y-1 border-t pt-2">
                <p className="px-1 text-xs font-medium text-muted-foreground">Explore this selection</p>
                {contextualActions.map((action) => (
                  <button
                    key={action.mode}
                    type="button"
                    onClick={() => exploreMode(action.mode)}
                    className="flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{action.label}</span>
                      <span className="block text-xs text-muted-foreground">{action.description}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

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
                <span className="truncate">{getBrowseLabel(category, browsePath, browseMode, politicalLevel)}</span>
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
          <div className="order-0 flex min-h-14 min-w-0 shrink-0 items-center gap-2 overflow-x-auto border-b px-4 py-2.5 sm:px-5 md:order-none">
            {category === "administrative" && (
              browseMode === "state-districts" ? (
                <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={goBack}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back to states
                </Button>
              ) : browseMode === "all-districts" ? (
                <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={() => exploreAll("root")}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back to states
                </Button>
              ) : selected?.geography_type === "state" ? (
                <Button type="button" size="sm" className="shrink-0" onClick={() => exploreAll("state-districts")}>
                  Explore districts in {selected.name}
                </Button>
              ) : (
                <Button type="button" size="sm" className="shrink-0" onClick={() => exploreAll("all-districts")}>
                  Explore all districts of India
                </Button>
              )
            )}
            {category === "political" && politicalLevel === "parliamentary" && (
              <Button type="button" size="sm" className="shrink-0" onClick={() => exploreAll("all-parliamentary")}>
                Explore all parliamentary constituencies
              </Button>
            )}
            {category === "political" && politicalLevel === "assembly" && (
              <Button type="button" size="sm" className="shrink-0" onClick={() => exploreAll("all-assembly")}>
                Explore all assembly constituencies
              </Button>
            )}
          </div>
        ) : (
          <DialogHeader className="order-0 min-w-0 shrink-0 border-b px-4 py-3 pr-14 text-left sm:px-5 sm:py-4 md:order-none">
            <DialogTitle className="text-lg">
              {titleOverride || (selectionOnly ? "Choose geographic focus" : currentGeographyId ? "Change geography" : "Add geography")}
            </DialogTitle>
            <DialogDescription className="truncate">
              {selectionOnly ? "Search or browse a boundary, preview it on the map, then apply it to the governance directory." : "Choose the boundary associated with " + (entityName || "this entity") + "."}
            </DialogDescription>
          </DialogHeader>
        )}

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
              <>
                <p className="truncate text-xs font-semibold sm:text-sm">{label}</p>
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
              {selectionOnly ? "Apply focus" : isSetting ? "Saving..." : currentGeographyId ? "Change geography" : "Add geography"}
            </Button>
          </div>}
        </div>
      </div>
    );

  if (embedded) return browserContent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[90vh] sm:w-[96vw] sm:rounded-lg">
        {browserContent}
      </DialogContent>
    </Dialog>
  );
}
