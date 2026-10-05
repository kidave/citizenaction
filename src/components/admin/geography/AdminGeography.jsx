import { useState } from "react";
import { MapPinned, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import GeographyEditor from "@/components/admin/geography/GeographyEditor";
import GeographyTypeFilter, { geographyTypeLabel } from "@/components/geography/GeographyTypeFilter";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export default function AdminGeography({ embedded = false }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("district");
  const pageSize = 100;
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading, error, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: queryKeys.geography.list({ type, search: query.trim(), pageSize }),
    queryFn: async ({ pageParam = 0 }) => {
      let request = supabase
        .from("geographies")
        .select("id,name,official_name,geography_type,parent_id,country_code,osm_type,osm_id,admin_level,source,source_url")
        .order("name", { ascending: true })
        .range(pageParam * pageSize, pageParam * pageSize + pageSize - 1);

      if (type !== "all") {
        request = request.eq("geography_type", type);
      }

      const needle = query.trim();
      if (needle) {
        request = request.or(`name.ilike.%${needle}%,official_name.ilike.%${needle}%`);
      }

      const { data, error } = await request;
      if (error) throw error;
      return data || [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === pageSize ? allPages.length : undefined,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const filtered = data?.pages?.flatMap((pageRows) => pageRows) || [];
  const hasNextPage = Boolean(data?.pages?.length && data.pages[data.pages.length - 1]?.length === pageSize);

  const remove = async (id) => {
    const row = filtered.find((item) => item.id === id);
    if (!row) return;
    const linked = await supabase.from("governance_geography").select("id", { count: "exact", head: true }).eq("geography_id", id);
    if (linked.error) return toast.error(linked.error.message || "Unable to check geography links");
    if ((linked.count || 0) > 0) return toast.error("This geography is linked to governance entities and cannot be deleted yet.");
    const { error: deleteError } = await supabase.rpc("delete_geography", { p_id: id });
    if (deleteError) return toast.error(deleteError.message || "Unable to delete geography");
    toast.success(`${row.name} deleted`);
    queryClient.invalidateQueries({ queryKey: queryKeys.geography.all });
  };

  return <div className={embedded ? "w-full bg-background" : "min-h-dvh bg-background"}>
    <main className={embedded ? "w-full space-y-6" : "mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6"}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Geography</h1><p className="mt-1 text-sm text-muted-foreground">Manage reusable areas and their boundary geometry.</p></div>
        <Button onClick={() => { setEditing(null); setEditorOpen(true); }}> <Plus className="mr-2 h-4 w-4" />Add geography</Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <GeographyTypeFilter value={type} onValueChange={setType} className="w-full sm:w-52" />
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search within this geography type" />
        </div>
        <span className="self-center text-sm text-muted-foreground">{filtered.length} shown</span>
      </div>
      <Card><CardContent className="p-0">
        {isLoading ? <div className="p-8 text-center text-sm text-muted-foreground">Loading geography…</div>
          : error ? <div className="p-8 text-center text-sm text-destructive">Unable to load geography.</div>
          : filtered.length === 0 ? <div className="p-10 text-center"><MapPinned className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><p className="font-medium">No geography found</p><p className="mt-1 text-sm text-muted-foreground">Add a geography and upload its boundary.</p></div>
          : <div className="divide-y">{filtered.map((row) => <div key={row.id} className="flex items-center gap-4 p-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted"><MapPinned className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-medium">{row.name}</p><Badge variant="secondary">{geographyTypeLabel(row.geography_type)}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{row.official_name || ""}{row.source ? ` · ${row.source}` : ""}</p></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${row.name}`} onClick={() => { setEditing(row); setEditorOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${row.name}`} onClick={() => remove(row.id)}><Trash2 className="h-4 w-4" /></Button></div></div>)}</div>}
      </CardContent></Card>
      {filtered.length === pageSize && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => setPage((value) => value + 1)}>Load more</Button>
        </div>
      )}
    </main>
    <GeographyEditor open={editorOpen} onOpenChange={setEditorOpen} geography={editing} onSaved={() => { setEditing(null); setEditorOpen(false); queryClient.invalidateQueries({ queryKey: queryKeys.geography.all }); }} />
  </div>;
}
