"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronsUpDown, Landmark, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase/client";
import {
  getGovernanceInitials,
  getGovernanceLabel,
} from "@/utils/governance";

export default function GovernanceSelector({ editor }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const selected = Array.isArray(editor?.governance) ? editor.governance : [];
  const selectedIds = useMemo(
    () => new Set(selected.map((item) => item?.id).filter(Boolean)),
    [selected],
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadGovernance() {
      setLoading(true);

      const pattern = search.trim() ? `%${search.trim()}%` : "%";
      const { data, error } = await supabase
        .from("governance")
        .select("id,name,short_name,slug,image_url,type,status")
        .neq("status", "deleted")
        .or(`name.ilike.${pattern},short_name.ilike.${pattern}`)
        .order("name")
        .limit(50);

      if (cancelled) return;

      if (error) {
        console.warn("Failed to load governance selector:", error);
        setOptions([]);
      } else {
        setOptions(data || []);
      }

      setLoading(false);
    }

    const timer = window.setTimeout(loadGovernance, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, search]);

  function toggleGovernance(entity) {
    const next = selectedIds.has(entity.id)
      ? selected.filter((item) => item.id !== entity.id)
      : [...selected, entity];

    editor.setSelectedAuthorities?.(next);
  }

  const visibleSelected = selected.slice(0, 2);
  const remaining = Math.max(selected.length - visibleSelected.length, 0);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 max-w-[210px] gap-1.5 rounded-full px-2.5"
      >
        {selected.length ? (
          <div className="flex shrink-0 -space-x-1">
            {visibleSelected.map((entity) => (
              <Avatar
                key={entity.id}
                className="h-5 w-5 border border-background"
              >
                <AvatarImage src={entity.image_url || undefined} alt="" />
                <AvatarFallback className="text-[9px]">
                  {getGovernanceInitials(getGovernanceLabel(entity))}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        ) : (
          <Landmark className="h-3.5 w-3.5 shrink-0" />
        )}

        {remaining > 0 && (
          <span className="text-[10px] text-muted-foreground">
            +{remaining}
          </span>
        )}

        <span className="hidden truncate text-xs sm:inline">
          {selected.length ? "Governance" : "Governance"}
        </span>

        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Governance</SheetTitle>
          </SheetHeader>

          <div className="space-y-3 px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search governance..."
                className="pl-9"
                autoFocus
              />
            </div>

            <div className="max-h-[calc(100dvh-170px)] overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading governance...
                </div>
              ) : options.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No governance found.
                </div>
              ) : (
                <div className="space-y-1">
                  {options.map((entity) => {
                    const isSelected = selectedIds.has(entity.id);

                    return (
                      <button
                        key={entity.id}
                        type="button"
                        onClick={() => toggleGovernance(entity)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={entity.image_url || undefined} alt="" />
                          <AvatarFallback>
                            {getGovernanceInitials(getGovernanceLabel(entity))}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {getGovernanceLabel(entity)}
                          </div>
                          {entity.short_name && entity.name !== entity.short_name ? (
                            <div className="truncate text-xs text-muted-foreground">
                              {entity.short_name}
                            </div>
                          ) : null}
                        </div>

                        <div
                          className={`h-4 w-4 rounded border ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
