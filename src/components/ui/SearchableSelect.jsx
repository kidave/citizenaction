import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function SearchableSelect({
  value,
  onValueChange,
  options = [],
  placeholder = "Search...",
  emptyText = "No results found.",
  searchPlaceholder = "Search...",
  disabled = false,
  ariaLabel,
  className,
  contentClassName = "w-[var(--radix-popover-trigger-width)] p-0",
  renderOption,
  renderValue,
  onSearch,
  searchLoading = false,
  searchDebounceMs = 300,
  loadingText = "Searching...",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open || !onSearch) return undefined;
    const timeout = setTimeout(() => onSearch(search.trim()), searchDebounceMs);
    return () => clearTimeout(timeout);
  }, [open, search, onSearch, searchDebounceMs]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel || placeholder}
          disabled={disabled}
          className={cn("h-9 w-full justify-between font-normal", !selected && "text-muted-foreground", className)}
        >
          <span className="min-w-0 flex-1 text-left">{selected ? (renderValue ? renderValue(selected) : <span className="block truncate">{selected.label}</span>) : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={contentClassName}>
        <Command shouldFilter={!onSearch}>
          <CommandInput placeholder={searchPlaceholder} value={onSearch ? search : undefined} onValueChange={onSearch ? setSearch : undefined} />
          <CommandList>
            {onSearch && searchLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{loadingText}</div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                {options.map((option) => (
              <CommandItem
                key={option.value}
                value={(option.label + " " + (option.searchValue ?? "")).trim()}
                onSelect={() => {
                  onValueChange?.(option.value);
                  setOpen(false);
                }}
              >
                <Check className={cn("h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                {renderOption ? renderOption(option) : <span className="min-w-0 flex-1 truncate">{option.label}</span>}
              </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
