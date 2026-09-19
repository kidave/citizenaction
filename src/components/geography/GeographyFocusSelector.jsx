import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, MapPinned, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandItem, CommandList } from "@/components/ui/command";
import { CommandInput as SearchInput } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DEFAULT_GEOGRAPHY_FOCUS_ID, useGeographyFocus } from "@/hooks/geography/useGeographyFocus";

export default function GeographyFocusSelector({ value, onValueChange, className }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const {
    effectiveValue,
    selected,
    options,
    isSearching,
  } = useGeographyFocus({
    value,
    search,
    open,
  });

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const selectedLabel = selected?.name || (effectiveValue === DEFAULT_GEOGRAPHY_FOCUS_ID ? "India" : "Choose area");
  const canReset = effectiveValue !== DEFAULT_GEOGRAPHY_FOCUS_ID;

  function selectValue(nextValue) {
    onValueChange?.(nextValue === DEFAULT_GEOGRAPHY_FOCUS_ID ? null : nextValue);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-8 max-w-[12rem] shrink-0 justify-between gap-1.5 px-2 font-medium",
            className,
          )}
        >
          <MapPinned className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Focus</span>
          <span className="min-w-0 truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-0.5 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-[min(20rem,calc(100vw-1.5rem))] p-0"
      >
        <Command shouldFilter={false}>
          <SearchInput
            placeholder="Search countries, states, cities, wards..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{isSearching ? "Searching..." : "No areas found."}</CommandEmpty>
            {canReset && (
              <CommandItem value="india" onSelect={() => selectValue(DEFAULT_GEOGRAPHY_FOCUS_ID)}>
                <RotateCcw className="h-4 w-4" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">India</div>
                  <div className="text-xs text-muted-foreground">Reset focus area</div>
                </div>
              </CommandItem>
            )}
            {options.map((item) => (
              <CommandItem key={item.id} value={item.id} onSelect={() => selectValue(item.id)}>
                <Check className={cn("h-4 w-4", effectiveValue === item.id ? "opacity-100" : "opacity-0")} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{item.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {item.geography_type?.replace(/_/g, " ")}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
