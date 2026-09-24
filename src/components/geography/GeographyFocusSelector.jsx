"use client";

import { useEffect, useMemo, useState } from "react";
import { Globe2 } from "lucide-react";

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

function formatGeographyType(value) {
  return value
    ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Other";
}

export default function GeographyFocusSelector({
  value,
  onValueChange,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { effectiveValue, selected, options, isSearching, error } =
    useGeographyFocus({ value, search, open });

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const selectedLabel =
    selected?.name ||
    (effectiveValue === DEFAULT_GEOGRAPHY_FOCUS_ID ? "India" : "");

  const groupedOptions = useMemo(() => {
    const groups = new Map();

    for (const item of options) {
      const type = item.geography_type || "other";
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type).push(item);
    }

    if (
      selected?.id &&
      !options.some((item) => item.id === selected.id)
    ) {
      const type = selected.geography_type || "other";
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type).push(selected);
    }

    return [...groups.entries()]
      .sort(([a], [b]) =>
        formatGeographyType(a).localeCompare(formatGeographyType(b)),
      )
      .map(([type, items]) => ({
        value: formatGeographyType(type),
        items: [...items].sort((a, b) =>
          (a.name || "").localeCompare(b.name || ""),
        ),
      }));
  }, [options, selected]);

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
        onValueChange?.(
          nextId === DEFAULT_GEOGRAPHY_FOCUS_ID ? null : nextId,
        );
        setOpen(false);
        setSearch("");
      }}
      itemToStringLabel={(item) => item?.name || ""}
      itemToStringValue={(item) => item?.name || ""}
      isItemEqualToValue={(item, currentValue) =>
        item?.id === currentValue?.id
      }
      autoHighlight
      className={className}
    >
      <ComboboxTrigger
        className="h-9 w-full justify-between rounded-md border border-input bg-background px-3 text-sm font-normal shadow-xs hover:bg-accent hover:text-accent-foreground"
        aria-label="Select geography"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Globe2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <ComboboxValue placeholder={selectedLabel || "Select geography"} />
        </span>
      </ComboboxTrigger>

      <ComboboxContent className="w-[min(28rem,calc(100vw-1.5rem))]">
        <ComboboxInput
          showTrigger={false}
          showClear={false}
          placeholder="Search geography..."
          aria-label="Search geography"
          className="h-8"
        />
        <ComboboxEmpty>
          {error
            ? "Unable to search geographies."
            : isSearching
              ? "Searching..."
              : "No geographies found."}
        </ComboboxEmpty>

        <ComboboxList>
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
      </ComboboxContent>
    </Combobox>
  );
}
