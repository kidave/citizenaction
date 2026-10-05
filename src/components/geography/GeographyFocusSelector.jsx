"use client";

import { useEffect, useState } from "react";
import { MapPinned, X } from "lucide-react";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import {
  DEFAULT_GEOGRAPHY_FOCUS_ID,
  useGeographyFocus,
} from "@/hooks/geography/useGeographyFocus";

"use client";

import { useEffect, useState } from "react";
import { MapPinned, X } from "lucide-react";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import {
  DEFAULT_GEOGRAPHY_FOCUS_ID,
  useGeographyFocus,
} from "@/hooks/geography/useGeographyFocus";

const GEOGRAPHY_TYPE_LABELS = {
  ward: "Ward",
  zone: "Zone",
  constituency: "Constituency",
  district: "District",
  sub_district: "Sub-district",
  local_government: "Local government",
  administrative_area: "Administrative area",
  neighborhood: "Neighborhood",
  suburb: "Suburb",
  village: "Village",
  town: "Town",
  city: "City",
  state: "State",
  country: "Country",
};

function getGeographyTypeLabel(type) {
  if (!type) return "Boundary";
  return GEOGRAPHY_TYPE_LABELS[type] || type.replace(/_/g, " ");
}

export default function GeographyFocusSelector({ value, onValueChange, className }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const {
    effectiveValue, selected, options, isSearching, error,
    hasNextPage, fetchNextPage, isFetchingNextPage,
  } = useGeographyFocus({ value, search, open });

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const isIndia = effectiveValue === DEFAULT_GEOGRAPHY_FOCUS_ID;
  const selectedLabel = selected?.name || (isIndia ? "India" : "");
  const selectedType = selected?.geography_type
    ? getGeographyTypeLabel(selected.geography_type)
    : null;

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const clearBoundary = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onValueChange?.(null);
    setSearch("");
    setOpen(false);
  };

  return (
    <Combobox
      items={[{ value: "Boundaries", items: options }]}
      value={selected || undefined}
      open={open}
      onOpenChange={setOpen}
      inputValue={search}
      onInputValueChange={setSearch}
      onValueChange={(item) => {
        const nextId = item?.id || null;
        onValueChange?.(nextId === DEFAULT_GEOGRAPHY_FOCUS_ID ? null : nextId);
        setOpen(false);
        setSearch("");
      }}
      itemToStringLabel={(item) => item?.name || ""}
      itemToStringValue={(item) => item?.name || ""}
      isItemEqualToValue={(item, currentValue) => item?.id === currentValue?.id}
      autoHighlight
      className={className}
    >
      <div className="relative w-[12rem] max-w-full">
        <ComboboxTrigger
          className={`shadow-xs inline-flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-2.5 hover:bg-accent hover:text-accent-foreground ${!isIndia ? "pl-11" : ""}`}
          aria-label="Select geography"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground">
            <MapPinned className="h-4 w-4" />
          </span>

          <span className="min-w-0 flex-1 text-left">
          <ComboboxValue
            placeholder={selectedLabel || "Select geography"}
            className="block truncate font-serif text-sm font-normal"
          />
          {!isIndia && selectedType && (
            <span className="block truncate text-[11px] leading-3 text-muted-foreground">
              {selectedType}
            </span>
          )}
          </span>
        </ComboboxTrigger>

        {!isIndia && (
          <button
            type="button"
            aria-label="Clear geography boundary"
            title="Clear boundary"
            onClick={clearBoundary}
            className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-border hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <ComboboxContent className="w-[min(28rem,calc(100vw-1.5rem))]">
        <ComboboxInput
          showTrigger={false}
          showClear={false}
          showInputClear={Boolean(search)}
          onClearInput={() => setSearch("")}
          placeholder="Search boundary..."
          aria-label="Search geography boundary"
          className="h-9 rounded-md"
        />
        <ComboboxEmpty>
          {error ? "Unable to search boundaries." : isSearching ? "Searching..." : "No boundaries found."}
        </ComboboxEmpty>
        <ComboboxList
          className="max-h-[min(24rem,calc(100vh-10rem))] overflow-y-auto"
          onScroll={(event) => {
            const target = event.currentTarget;
            if (
              hasNextPage &&
              !isFetchingNextPage &&
              target.scrollTop + target.clientHeight >= target.scrollHeight - 80
            ) {
              loadMore();
            }
          }}
        >
          {(group) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel>{group.value}</ComboboxLabel>
              <ComboboxCollection>
                {(item) => (
                  <ComboboxItem key={item.id} value={item}>
                    <div className="min-w-0">
                      <div className="truncate text-sm">{item.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {getGeographyTypeLabel(item.geography_type)}
                      </div>
                    </div>
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
        {isFetchingNextPage && (
          <div className="border-t px-3 py-2 text-center text-xs text-muted-foreground">
            Loading more boundaries…
          </div>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
