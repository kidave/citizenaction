"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/lib/supabase/client";
import { formatGovernanceType } from "@/utils/governance";

export default function GovernanceParentSelect({
  value = null,
  domain = null,
  excludeId = null,
  onValueChange,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!value) {
      setSelected(null);
      return () => { cancelled = true; };
    }

    const loadSelected = async () => {
      const { data, error } = await supabase
        .from("governance")
        .select("id,name,type,domain")
        .eq("id", value)
        .maybeSingle();
      if (cancelled) return;
      if (error) return;
      if (data && data.domain === domain) setSelected(data);
      else setSelected(null);
    };

    loadSelected();
    return () => { cancelled = true; };
  }, [value, domain]);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      setLoading(true);
      let query = supabase
        .from("governance")
        .select("id,name,type,domain")
        .order("name")
        .limit(40);

      query = domain ? query.eq("domain", domain) : query.is("domain", null);
      if (excludeId) query = query.neq("id", excludeId);
      if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);

      const { data, error } = await query;
      if (cancelled) return;
      setLoading(false);
      if (error) {
        setOptions([]);
        return;
      }
      setOptions(data || []);
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [open, search, domain, excludeId]);

  const selectedLabel = selected
    ? `${selected.name} · ${formatGovernanceType(selected.type)}`
    : "No parent organisation";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-10 w-full justify-between font-normal"
        >
          <span className="min-w-0 truncate text-left">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search parent organisations..."
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center gap-2 py-5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching organisations...
              </div>
            )}
            {!loading && <CommandEmpty>No matching organisations found.</CommandEmpty>}
            <CommandGroup>
              <CommandItem
                value="__no_parent__"
                onSelect={() => {
                  setSelected(null);
                  onValueChange?.(null);
                  setOpen(false);
                }}
              >
                <Check className={`h-4 w-4 ${!value ? "opacity-100" : "opacity-0"}`} />
                No parent organisation (root)
              </CommandItem>
              {options.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    setSelected(item);
                    onValueChange?.(item.id);
                    setOpen(false);
                  }}
                >
                  <Check className={`h-4 w-4 ${value === item.id ? "opacity-100" : "opacity-0"}`} />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    {formatGovernanceType(item.type)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
