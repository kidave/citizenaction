import { useDeferredValue, useEffect, useState } from "react";
import { Check, ChevronsUpDown, MapPinned, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandItem, CommandList } from "@/components/ui/command";
import { CommandInput as SearchInput } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const DEFAULT_COUNTRY_ID = "6f3dda25-6cf4-43f2-a5b7-1c8aa9d2113f";

export default function GeographyFocusSelector({ value, onValueChange, className }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const effectiveValue = value || DEFAULT_COUNTRY_ID;

  const selectedQuery = useQuery({
    queryKey: ["geography-focus-selected", effectiveValue],
    enabled: !!effectiveValue,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("geographies")
        .select("id,name,official_name,geography_type,parent_id")
        .eq("id", effectiveValue)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const searchQuery = useQuery({
    queryKey: ["geography-focus-search", deferredSearch],
    queryFn: async () => {
      let query = supabase
        .from("geographies")
        .select("id,name,official_name,geography_type,parent_id")
        .order("name")
        .limit(50);

      if (deferredSearch) {
        query = query.or(`name.ilike.%${deferredSearch}%,official_name.ilike.%${deferredSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: open,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (!value) return;
  }, [value]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const selected = selectedQuery.data;
  const options = searchQuery.data || [];
  const selectedLabel = selected?.name || (effectiveValue === DEFAULT_COUNTRY_ID ? "India" : "Choose area");
  const canReset = effectiveValue !== DEFAULT_COUNTRY_ID;

  function selectValue(nextValue) {
    onValueChange?.(nextValue === DEFAULT_COUNTRY_ID ? null : nextValue);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-2">
      <MapPinned className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Focus</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className={cn("h-8 max-w-[18rem] justify-between px-2 font-medium", className)}
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[320px] p-0">
          <Command shouldFilter={false}>
            <SearchInput placeholder="Search countries, states, cities, wards..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>{searchQuery.isLoading ? "Searching..." : "No areas found."}</CommandEmpty>
              {canReset && (
                <CommandItem value="india" onSelect={() => selectValue(DEFAULT_COUNTRY_ID)}>
                  <RotateCcw className="h-4 w-4" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">India</div>
                    <div className="text-xs text-muted-foreground">Reset focus area</div>
                  </div>
                </CommandItem>
              )}
              {options.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => selectValue(item.id)}
                >
                  <Check className={cn("h-4 w-4", effectiveValue === item.id ? "opacity-100" : "opacity-0")} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{item.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{item.geography_type?.replace(/_/g, " ")}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
