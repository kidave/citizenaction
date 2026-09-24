import { useEffect, useMemo, useState } from "react";
import { MapPinned } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxCollection,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import {
  DEFAULT_GEOGRAPHY_FOCUS_ID,
  useGeographyFocus,
} from "@/hooks/geography/useGeographyFocus";

function formatGeographyType(value) {
  return value
    ? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Geography";
}

export default function GeographyFocusSelector({
  value,
  onValueChange,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { effectiveValue, selected, options, isSearching } = useGeographyFocus({
    value,
    search,
    open,
  });

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const selectedLabel =
    selected?.name ||
    (effectiveValue === DEFAULT_GEOGRAPHY_FOCUS_ID ? "India" : "Choose area");

  const groupedOptions = useMemo(() => {
    const groups = new Map();
    for (const item of options) {
      const key = item.geography_type || "other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => formatGeographyType(a).localeCompare(formatGeographyType(b)))
      .map(([type, items]) => ({
        type,
        items: [...items].sort((a, b) =>
          (a.name || "").localeCompare(b.name || ""),
        ),
      }));
  }, [options]);

  const ids = useMemo(() => options.map((item) => item.id), [options]);

  const handleValueChange = (nextValue) => {
    onValueChange?.(
      nextValue === DEFAULT_GEOGRAPHY_FOCUS_ID ? null : nextValue,
    );
    setOpen(false);
  };

  return (
    <Combobox
      items={ids}
      value={effectiveValue}
      open={open}
      onOpenChange={setOpen}
      inputValue={search}
      onInputValueChange={setSearch}
      onValueChange={handleValueChange}
      itemToStringValue={(item) => {
        const option = options.find((candidate) => candidate.id === item);
        return option?.name || selectedLabel || "";
      }}
      autoHighlight
      className={className}
    >
      <ComboboxInput
        placeholder="Search geography..."
        className="h-8 w-[min(18rem,calc(100vw-2rem))]"
        showClear={effectiveValue !== DEFAULT_GEOGRAPHY_FOCUS_ID}
      >
        <InputGroupAddon>
          <MapPinned className="h-4 w-4 text-muted-foreground" />
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent className="w-[min(24rem,calc(100vw-1.5rem))]">
        <ComboboxEmpty>
          {isSearching ? "Searching..." : "No geographies found."}
        </ComboboxEmpty>

        <ComboboxList>
          {(group) => {
            const groupOptions = groupedOptions.find(
              (entry) => entry.type === group,
            );
            return (
              <ComboboxGroup key={group}>
                <ComboboxLabel>{formatGeographyType(group)}</ComboboxLabel>
                <ComboboxCollection>
                  {groupOptions?.items.map((item) => (
                    <ComboboxItem key={item.id} value={item.id}>
                      <div className="min-w-0">
                        <div className="truncate text-sm">{item.name}</div>
                      </div>
                    </ComboboxItem>
                  ))}
                </ComboboxCollection>
              </ComboboxGroup>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}