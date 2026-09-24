import { useEffect, useMemo, useState } from "react";
import { MapPinned } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import {
  DEFAULT_GEOGRAPHY_FOCUS_ID,
  useGeographyFocus,
} from "@/hooks/geography/useGeographyFocus";

function formatGeographyType(value) {
  return value
    ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Other";
}

export default function GeographyFocusSelector({ value, onValueChange, className }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { effectiveValue, selected, options, isSearching, error } =
    useGeographyFocus({ value, search, open });

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const selectedLabel =
    selected?.name ||
    (effectiveValue === DEFAULT_GEOGRAPHY_FOCUS_ID ? "India" : "");

  const sortedOptions = useMemo(
    () =>
      [...options].sort((a, b) => {
        const typeCompare = (a.geography_type || "other").localeCompare(
          b.geography_type || "other",
        );
        return typeCompare || (a.name || "").localeCompare(b.name || "");
      }),
    [options],
  );

  const items = useMemo(() => {
    if (!selected?.id || sortedOptions.some((item) => item.id === selected.id)) {
      return sortedOptions;
    }
    return [selected, ...sortedOptions];
  }, [selected, sortedOptions]);

  return (
    <Combobox
      items={items}
      value={selected || undefined}
      open={open}
      onOpenChange={setOpen}
      inputValue={search}
      onInputValueChange={setSearch}
      onValueChange={(item) => {
        const nextId = item?.id || item || null;
        onValueChange?.(nextId === DEFAULT_GEOGRAPHY_FOCUS_ID ? null : nextId);
        setOpen(false);
        setSearch("");
      }}
      itemToStringValue={(item) => item?.name || ""}
      autoHighlight
      className={className}
    >
      <ComboboxInput
        placeholder={selectedLabel || "Search geography..."}
        className="h-8 w-[min(18rem,calc(100vw-2rem))]"
        showClear={Boolean(value)}
      >
        <InputGroupAddon>
          <MapPinned className="h-4 w-4 text-muted-foreground" />
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent className="w-[min(28rem,calc(100vw-1.5rem))]">
        <ComboboxEmpty>
          {error
            ? "Unable to search geographies."
            : isSearching
              ? "Searching..."
              : "No geographies found."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item}>
              <div className="min-w-0">
                <div className="truncate text-sm">{item.name}</div>
                {item.geography_type && (
                  <div className="text-xs text-muted-foreground">
                    {formatGeographyType(item.geography_type)}
                  </div>
                )}
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
