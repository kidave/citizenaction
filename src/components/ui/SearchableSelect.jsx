import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
  className,
  contentClassName = "w-[var(--radix-popover-trigger-width)] p-0",
  renderOption,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("h-9 w-full justify-between font-normal", !selected && "text-muted-foreground", className)}
        >
          <span className="min-w-0 truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={contentClassName}>
        <Command shouldFilter={!options.some((option) => option.searchValue === undefined)}>
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.searchValue ?? option.label}
                onSelect={() => {
                  onValueChange?.(option.value);
                  setOpen(false);
                }}
              >
                <Check className={cn("h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                <span className="min-w-0 flex-1 truncate">{renderOption ? renderOption(option) : option.label}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
