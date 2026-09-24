import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function Combobox({
  value,
  onValueChange,
  options = [],
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  multiple = false,
  className,
  contentClassName = "w-[var(--radix-popover-trigger-width)] p-0",
  renderOption,
}) {
  const [open, setOpen] = useState(false);
  const values = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value
      ? [value]
      : [];
  const selected = options.filter((option) => values.includes(option.value));

  const selectValue = (nextValue) => {
    if (multiple) {
      const nextValues = values.includes(nextValue)
        ? values.filter((item) => item !== nextValue)
        : [...values, nextValue];
      onValueChange?.(nextValues);
      return;
    }

    onValueChange?.(nextValue);
    setOpen(false);
  };

  const clear = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onValueChange?.(multiple ? [] : null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between font-normal",
            !selected.length && "text-muted-foreground",
            className,
          )}
        >
          <span className="min-w-0 truncate">
            {selected.length
              ? multiple
                ? `${selected.length} selected`
                : selected[0].label
              : placeholder}
          </span>
          <span className="ml-2 flex shrink-0 items-center gap-1">
            {selected.length > 0 && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={clear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={contentClassName}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = values.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={(option.label + " " + (option.searchValue ?? "")).trim()}
                    onSelect={() => selectValue(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {renderOption ? renderOption(option) : option.label}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
