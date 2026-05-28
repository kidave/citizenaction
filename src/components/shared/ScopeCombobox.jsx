"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

export default function ScopeCombobox({
  items = [],
  value,
  onChange,
  placeholder = "Select",
  disabled,
  className,
}) {
  const [open, setOpen] = useState(false);

  const selected = items.find((i) => i.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          disabled={disabled}
          className={cn("w-full min-w-[160px] justify-between", className)}
        >
          {selected ? (
            <div className="flex items-center gap-2 truncate">
              {selected.logo_url ? (
                <Image
                  src={selected.logo_url}
                  alt={selected.name}
                  width={16}
                  height={16}
                  className="shrink-0 rounded-sm"
                />
              ) : (
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-muted text-[10px]">
                  {selected.name?.[0]}
                </div>
              )}

              <span className="truncate">{selected.name}</span>
            </div>
          ) : (
            <span className="truncate text-muted-foreground">
              {placeholder}
            </span>
          )}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder={`Search ${placeholder}`} />

          <CommandEmpty>No results found</CommandEmpty>

          <CommandList>
            {items.map((item) => {
              const isSelected = value === item.code;

              return (
                <CommandItem
                  key={item.code}
                  onSelect={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  <div className="flex w-full items-center gap-2">
                    {item.logo_url ? (
                      <Image
                        src={item.logo_url}
                        alt={item.name}
                        width={16}
                        height={16}
                        className="shrink-0 rounded-sm"
                      />
                    ) : (
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-muted text-[10px]">
                        {item.name?.[0]}
                      </div>
                    )}

                    <span className="truncate">{item.name}</span>

                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </div>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
