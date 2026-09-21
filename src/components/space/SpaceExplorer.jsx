"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SpaceCard from "@/components/space/SpaceCard";

export default function SpaceExplorer({ open, onOpenChange, spaces = [], selectedSpaces = [], setSelectedSpaces }) {
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [draftSpaces, setDraftSpaces] = useState(selectedSpaces);

  useEffect(() => {
    if (open) {
      setDraftSpaces(selectedSpaces);
      setSearch("");
      setCategorySlug("");
    }
  }, [open, selectedSpaces]);

  const categories = useMemo(() => {
    const map = new Map();
    spaces.forEach((space) => {
      if (!space.category_id || !space.category_slug || map.has(space.category_id)) return;
      map.set(space.category_id, { id: space.category_id, slug: space.category_slug, name: space.category_name });
    });
    return Array.from(map.values());
  }, [spaces]);

  const filteredSpaces = useMemo(() => {
    const query = search.trim().toLowerCase();
    return spaces.filter((space) => {
      const matchesSearch = !query || space.name?.toLowerCase().includes(query) || space.description?.toLowerCase().includes(query);
      return matchesSearch && (!categorySlug || space.category_slug === categorySlug);
    });
  }, [spaces, search, categorySlug]);

  function toggleSpace(space) {
    setDraftSpaces((current) =>
      current.some((selected) => selected.id === space.id)
        ? current.filter((selected) => selected.id !== space.id)
        : [...current, space],
    );
  }

  function cancel() {
    setDraftSpaces(selectedSpaces);
    onOpenChange(false);
  }

  function save() {
    setSelectedSpaces(draftSpaces);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : cancel())}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <SheetHeader className="shrink-0 border-b px-6 py-4"><SheetTitle>Spaces</SheetTitle></SheetHeader>

        <div className="flex shrink-0 items-center justify-between gap-3 border-b px-6 py-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => setDraftSpaces([])} disabled={!draftSpaces.length}>Clear</Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={cancel}>Cancel</Button>
            <Button type="button" size="sm" onClick={save}>Save</Button>
          </div>
        </div>

        <div className="shrink-0 border-b px-6 py-3">
          <div className="flex w-full items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search spaces..." aria-label="Search spaces" className="h-10 rounded-xl pl-9" />
            </div>
            <Select value={categorySlug || "all"} onValueChange={(value) => setCategorySlug(value === "all" ? "" : value)}>
              <SelectTrigger className="h-10 w-[150px] shrink-0 rounded-xl sm:w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => <SelectItem key={category.id} value={category.slug}>{category.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-4 flex items-center gap-2 overflow-x-auto">
            <Button type="button" size="sm" variant={draftSpaces.length === 0 ? "default" : "outline"} onClick={() => setDraftSpaces([])} className="shrink-0 rounded-full gap-2">
              Global {draftSpaces.length === 0 && <Check className="h-3.5 w-3.5" />}
            </Button>
            {draftSpaces.slice(0, 5).map((space) => (
              <div key={space.id} className="flex h-8 shrink-0 items-center gap-2 rounded-full border px-2 text-xs">
                {space.logo_url ? <img src={space.logo_url} alt="" className="h-5 w-5 rounded-full object-cover" /> : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">{space.name?.[0]?.toUpperCase() || "S"}</span>}
                <span className="max-w-28 truncate">{space.name}</span>
              </div>
            ))}
            {draftSpaces.length > 5 && <span className="shrink-0 text-xs text-muted-foreground">+{draftSpaces.length - 5} more</span>}
          </div>

          {filteredSpaces.length === 0 ? (
            <div className="flex min-h-[240px] items-center justify-center text-center"><div><p className="font-medium">No Spaces found</p><p className="mt-1 text-sm text-muted-foreground">Try another search or category.</p></div></div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredSpaces.map((space) => <SpaceCard key={space.id} space={space} selectable selected={draftSpaces.some((selected) => selected.id === space.id)} onSelect={toggleSpace} />)}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
