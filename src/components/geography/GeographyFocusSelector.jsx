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
    effectiveValue, selected, options, isSearching, error,
    hasNextPage, fetchNextPage, isFetchingNextPage,
  } = useGeographyFocus({ value, search, open });

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const selectedLabel = selected?.name ||
    (effectiveValue === DEFAULT_GEOGRAPHY_FOCUS_ID ? "India" : "");

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
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
      <div className="relative">
        <ComboboxTrigger
          className="shadow-xs inline-flex h-9 w-[9.5rem] max-w-full items-center justify-between gap-2 rounded-md border border-input bg-background pl-3 pr-2 font-serif text-sm font-normal hover:bg-accent hover:text-accent-foreground"
          aria-label="Select geography"
        >
          <span className="flex min-w-0 items-center gap-2">
            <MapPinned className="h-4 w-4 shrink-0 text-muted-foreground" />
            <ComboboxValue placeholder={selectedLabel || "Select geography"} />
          </span>
        </ComboboxTrigger>
        {effectiveValue !== DEFAULT_GEOGRAPHY_FOCUS_ID && (
          <button
            type="button"
            aria-label="Clear geography boundary"
            title="Clear boundary"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onValueChange?.(null);
              setSearch("");
              setOpen(false);
            }}
            className="absolute left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-background text-muted-foreground shadow-sm ring-1 ring-border hover:bg-accent hover:text-foreground"
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
            if (hasNextPage && !isFetchingNextPage &&
                target.scrollTop + target.clientHeight >= target.scrollHeight - 80) {
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
