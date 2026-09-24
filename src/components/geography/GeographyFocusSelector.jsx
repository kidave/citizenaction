import { useEffect, useMemo, useState } from "react";
import { MapPinned, RotateCcw } from "lucide-react";

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

  const optionById = useMemo(
    () => new Map(options.map((item) => [item.id, item])),
    [options],
  );
  const items = useMemo(() => {
    const ids = options.map((item) => item.id);
    if (selected?.id && !ids.includes(selected.id)) ids.unshift(selected.id);
    return ids;
  }, [options, selected?.id]);
  const labels = useMemo(
    () => new Map(options.map((item) => [item.id, item.name])),
    [options],
  );

  const selectedLabel =
    selected?.name ||
    (effectiveValue === DEFAULT_GEOGRAPHY_FOCUS_ID ? "India" : "Choose area");

  const selectValue = (nextValue) => {
    onValueChange?.(
      nextValue === DEFAULT_GEOGRAPHY_FOCUS_ID ? null : nextValue,
    );
    setOpen(false);
  };

  return (
    <Combobox
      items={items}
      value={effectiveValue}
      open={open}
      onOpenChange={setOpen}
      inputValue={search}
      onInputValueChange={setSearch}
      onValueChange={selectValue}
      itemToStringValue={(item) => labels.get(item) || selectedLabel || ""}
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

      <ComboboxContent className="w-[min(20rem,calc(100vw-1.5rem))]">
        <ComboboxEmpty>
          {isSearching ? "Searching..." : "No geographies found."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item) => {
            const option = optionById.get(item) || (selected?.id === item ? selected : null);
            if (!option) return null;

            return (
              <ComboboxItem key={item} value={item}>
                <div className="min-w-0">
                  <div className="truncate text-sm">{option.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {formatGeographyType(option.geography_type)}
                  </div>
                </div>
              </ComboboxItem>
            );
          }}
        </ComboboxList>

        {effectiveValue !== DEFAULT_GEOGRAPHY_FOCUS_ID && (
          <button
            type="button"
            className="flex w-full items-center gap-2 border-t px-2 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => selectValue(DEFAULT_GEOGRAPHY_FOCUS_ID)}
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span>Reset to India</span>
          </button>
        )}
      </ComboboxContent>
    </Combobox>
  );
}