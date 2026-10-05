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

export default function GeographyFocusSelector({ value, onValueChange, className }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const {
    effectiveValue,
    selected,
    groupedOptions,
    isSearching,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGeographyFocus({ value, search, open });

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const isIndia = effectiveValue === DEFAULT_GEOGRAPHY_FOCUS_ID;
  const selectedLabel = selected?.name || (isIndia ? "India" : "");
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
      items={groupedOptions}
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
      <div className="relative w-[min(16rem,calc(100vw-7rem))] min-w-[12rem]">
        <ComboboxTrigger
          className="inline-flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-2.5 shadow-xs hover:bg-accent hover:text-accent-foreground"
          aria-label="Select geography"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground">
            <MapPinned className="h-4 w-4" />
          </span>

          <span className="min-w-0 flex-1 overflow-hidden text-left">
            <ComboboxValue
              placeholder={selectedLabel || "Select geography"}
              className="block min-w-0 max-w-full truncate whitespace-nowrap font-serif text-sm font-normal"
            />
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
          {error
            ? "Unable to search boundaries."
            : isSearching
              ? "Searching..."
              : "No boundaries found."}
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
              <ComboboxLabel>{group.label}</ComboboxLabel>
              <ComboboxCollection>
                {(item) => (
                  <ComboboxItem key={item.id} value={item}>
                    <div className="min-w-0">
                      <div className="truncate text-sm">{item.name}</div>
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
