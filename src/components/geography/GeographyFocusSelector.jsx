import { useEffect, useMemo, useState } from "react";
import { MapPinned } from "lucide-react";

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
      const type = item.geography_type || "other";
      if (!groups.has(type)) groups.set(type, []);
      groups.get(type).push(item);
    }

    return [...groups.entries()]
      .sort(([a], [b]) =>
        formatGeographyType(a).localeCompare(formatGeographyType(b)),
      )
      .map(([type, items]) => ({
        value: type,
        items: [...items].sort((a, b) =>
          (a.name || "").localeCompare(b.name || ""),
        ),
      }));
  }, [options]);

  const items = useMemo(
    () => groupedOptions.map((group) => group.value),
    [groupedOptions],
  );

  const optionById = useMemo(
    () => new Map(options.map((item) => [item.id, item])),
    [options],
  );

  const handleValueChange = (nextValue) => {
    onValueChange?.(
      nextValue === DEFAULT_GEOGRAPHY_FOCUS_ID ? null : nextValue,
    );
    setOpen(false);
  };

  return (
    <Combobox
      items={options}
      value={selected || undefined}
      onValueChange={(nextValue) => {
        const nextId =
          nextValue && typeof nextValue === "object"
            ? nextValue.id
            : nextValue;
        handleValueChange(nextId);
      }}
      itemToStringValue={(item) => {
        if (!item) return "";
        const id = typeof item === "object" ? item.id : item;
        return optionById.get(id)?.name || (id === DEFAULT_GEOGRAPHY_FOCUS_ID ? "India" : selectedLabel);
      }}
      autoHighlight
      className={className}
    >
      <ComboboxInput
        placeholder="Search geography..."
        className="h-8 w-[min(18rem,calc(100vw-2rem))]"
        showClear={effectiveValue !== DEFAULT_GEOGRAPHY_FOCUS_ID}
        onFocus={() => setOpen(true)}
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
          {() =>
            groupedOptions.map((group) => (
              <ComboboxGroup key={group.value} items={group.items}>
                <ComboboxLabel>{formatGeographyType(group.value)}</ComboboxLabel>
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
            ))
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}