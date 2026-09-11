"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ChevronRight, Loader2, MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  fetchGeographyGeometry,
  useGeographyBrowser,
} from "@/hooks/geography/useGeographyBrowser";
import {
  useGovernanceGeography,
  useGovernanceGeographyMutation,
} from "@/hooks/geography/useGovernanceGeography";

const LeafletMap = dynamic(
  () => import("@/components/shared/LeafletMap"),
  { ssr: false },
);

function geographyLabel(item) {
  return item?.official_name || item?.name || "Geography";
}

function geographyTypeLabel(item) {
  if (!item) return "Boundary";

  const labels = {
    country: "Country",
    state: "State / Union territory",
    division: "Division",
    district: "District",
    subdistrict: "Subdistrict / Taluka",
    city: "City",
    local_government: "Local government",
    metropolitan_area: "Metropolitan area",
    zone: "Zone",
    ward: "Ward",
  };

  return labels[item.geography_type] || "Boundary";
}

export default function AddGeographyDialog({
  open,
  onOpenChange,
  governanceId,
  entityName,
  onSaved,
}) {
  const [parent, setParent] = useState(null);
  const [selected, setSelected] = useState(null);
  const [geometry, setGeometry] = useState(null);
  const [search, setSearch] = useState("");
  const [path, setPath] = useState([]);
  const [loadingGeometry, setLoadingGeometry] = useState(false);

  const { data: relationships = [] } = useGovernanceGeography(
    governanceId,
    open,
  );

  const currentGeography = relationships[0]?.geographies || null;
  const currentGeographyId = relationships[0]?.geography_id || null;

  const { data: items = [], isLoading } = useGeographyBrowser({
    parentId: parent?.id || null,
    search,
    enabled: open,
  });

  const { setGeography, isSetting } = useGovernanceGeographyMutation();

  useEffect(() => {
    if (!open) return;

    setParent(null);
    setSelected(currentGeography || null);
    setGeometry(null);
    setSearch("");
    setPath([]);

    if (currentGeography) {
      setLoadingGeometry(true);
      fetchGeographyGeometry(currentGeography)
        .then(setGeometry)
        .catch(() => setGeometry(null))
        .finally(() => setLoadingGeometry(false));
    }
  }, [open, currentGeography]);

  const selectedId = selected?.id || "";

  const mapBoundary = selected && geometry
    ? [{
        osm_type: selected.osm_type,
        osm_id: selected.osm_id,
        name: geographyLabel(selected),
        center: selected.center,
        geojson: geometry,
      }]
    : [];

  const selectGeography = async (item) => {
    setSelected(item);
    setSearch("");
    setLoadingGeometry(true);

    try {
      const nextGeometry = await fetchGeographyGeometry(item);
      setGeometry(nextGeometry);
    } catch {
      setGeometry(null);
    } finally {
      setLoadingGeometry(false);
    }
  };

  const openChildren = (item) => {
    setParent(item);
    setPath((current) => [...current, item]);
    setSearch("");
  };

  const goBack = () => {
    if (!path.length) return;

    const nextPath = path.slice(0, -1);
    const nextParent = nextPath[nextPath.length - 1] || null;

    setPath(nextPath);
    setParent(nextParent);
    setSearch("");
  };

  const handleSave = async () => {
    if (!selected || selected.id === currentGeographyId) return;

    try {
      await setGeography({
        governanceId,
        geographyId: selected.id,
      });

      onSaved?.(selected);
      toast.success(currentGeographyId ? "Geography changed" : "Geography added");
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to save geography");
    }
  };

  const center = selected?.center || {
    lat: 20.5937,
    lng: 78.9629,
  };

  const submitLabel = currentGeographyId ? "Change geography" : "Add geography";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>
            {currentGeographyId ? "Change geography" : "Add geography"}
          </DialogTitle>
          <DialogDescription>
            Choose the jurisdiction associated with {entityName || "this entity"}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 md:grid-cols-[360px_1fr]">
          <div className="flex min-h-0 flex-col border-r">
            <div className="space-y-3 border-b p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search India, Mumbai, BMC..."
                  className="pl-9"
                />
              </div>

              {path.length > 0 && !search && (
                <div className="flex items-center gap-1 overflow-hidden text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => {
                      setParent(null);
                      setPath([]);
                      setSearch("");
                    }}
                    className="shrink-0 hover:text-foreground"
                  >
                    India
                  </button>

                  {path.slice(1).map((item) => (
                    <span
                      key={item.id}
                      className="flex min-w-0 items-center gap-1"
                    >
                      <ChevronRight className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {geographyLabel(item)}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <RadioGroup
                value={selectedId}
                onValueChange={(value) => {
                  const item = items.find((candidate) => candidate.id === value);
                  if (item) selectGeography(item);
                }}
                className="p-2"
              >
                {path.length > 0 && !search && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                )}

                {isLoading ? (
                  <div className="flex items-center gap-2 px-3 py-8 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading boundaries...
                  </div>
                ) : items.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No matching boundaries found.
                  </div>
                ) : (
                  items.map((item) => {
                    const isSelected = selected?.id === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2 rounded-lg px-2 py-1 ${
                          isSelected ? "bg-accent" : ""
                        }`}
                      >
                        <label
                          htmlFor={`geography-${item.id}`}
                          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted"
                        >
                          <RadioGroupItem
                            id={`geography-${item.id}`}
                            value={item.id}
                            className="shrink-0"
                          />
                          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {geographyLabel(item)}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {geographyTypeLabel(item)}
                            </span>
                          </span>
                        </label>

                        {!search && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 shrink-0"
                            onClick={() => openChildren(item)}
                            title={`Browse inside ${geographyLabel(item)}`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </RadioGroup>
            </ScrollArea>
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="relative min-h-[22rem] flex-1 bg-muted/20">
              <LeafletMap
                lat={Number(center?.lat) || 20.5937}
                lng={Number(center?.lng) || 78.9629}
                boundaries={mapBoundary}
                selectedBoundaryId={selected?.osm_id || null}
                showMarker={false}
                zoom={
                  selected?.admin_level <= 4
                    ? 6
                    : selected?.admin_level === 5
                      ? 9
                      : 11
                }
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
            </div>

            <div className="border-t bg-background p-4">
              {selected ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {geographyLabel(selected)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {geographyTypeLabel(selected)}
                    </p>
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
                        selected.id === currentGeographyId ||
                        loadingGeometry
                      }
                    >
                      {isSetting ? "Saving..." : submitLabel}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  India is the default starting point. Browse down through the administrative hierarchy or search for a boundary directly.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
