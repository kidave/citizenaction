import { useEffect, useState } from "react";
import { MapPinned, Pencil, Plus, Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GeographyEditor from "@/components/admin/geography/GeographyEditor";
import DigitalSansadDiagnostics from "@/components/admin/geography/DigitalSansadDiagnostics";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";
import { GEOGRAPHY_BOUNDARY_CATEGORIES, getGeographyTypeLabel } from "@/config/geography/boundaryCategories";

export default function AdminGeography({ embedded = false }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const activeCategory = GEOGRAPHY_BOUNDARY_CATEGORIES.find((item) => item.value === category);
  const typeOptions = activeCategory?.types || [];

  const { data: result = { rows: [], count: 0 }, isLoading, error } = useQuery({
    queryKey: queryKeys.geography.list({ category, type, search: query.trim(), page, pageSize }),
    queryFn: async () => {
      let request = supabase.from("geographies").select("id,name,official_name,other_names,status,geography_type,boundary_category,parent_id,country_code,source_id,source_type,osm_type,osm_id,admin_level,source,source_url", { count: "exact" }).order("name", { ascending: true }).range(page * pageSize, page * pageSize + pageSize - 1);
      if (category !== "all") request = request.eq("boundary_category", category);
      if (type !== "all") request = request.eq("geography_type", type);
      const needle = query.trim();
      if (needle) request = request.or(`name.ilike.%${needle}%,official_name.ilike.%${needle}%`);
      const { data, count, error } = await request;
      if (error) throw error;
      return { rows: data || [], count: count || 0 };
    },
    staleTime: 30 * 1000,
  });

  useEffect(() => { setPage(0); }, [category, type, query]);

  const rows = result.rows;
  const totalCount = result.count;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const parentIds = [...new Set(rows.map((row) => row.parent_id).filter(Boolean))];
  const { data: parentRows = [] } = useQuery({ queryKey: ["admin-geography-parents", parentIds], enabled: parentIds.length > 0, queryFn: async () => { const { data, error } = await supabase.from("geographies").select("id,name").in("id", parentIds); if (error) throw error; return data || []; } });
  const parentNames = new Map(parentRows.map((item) => [item.id, item.name]));

  const remove = async (id) => {
    const row = rows.find((item) => item.id === id);
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
        <Button onClick={() => { setEditing(null); setEditorOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add geography</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[180px_180px_1fr]">
        <Select value={category} onValueChange={(v) => { setCategory(v); setType("all"); }}>
          <SelectTrigger><SelectValue placeholder="Boundary category" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All boundaries</SelectItem>{GEOGRAPHY_BOUNDARY_CATEGORIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={type} onValueChange={setType} disabled={category === "all"}>
          <SelectTrigger><SelectValue placeholder="Boundary type" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All types</SelectItem>{typeOptions.map((value) => <SelectItem key={value} value={value}>{getGeographyTypeLabel(value)}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search boundaries" /></div>
      </div>
      <Card><CardContent className="p-0">
        {isLoading ? <div className="p-8 text-center text-sm text-muted-foreground">Loading geography…</div> : error ? <div className="p-8 text-center text-sm text-destructive">Unable to load geography.</div> : rows.length === 0 ? <div className="p-10 text-center"><MapPinned className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><p className="font-medium">No geography found</p><p className="mt-1 text-sm text-muted-foreground">Add a geography and upload its boundary.</p></div> : <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Type</TableHead><TableHead>Parent</TableHead><TableHead>Status</TableHead><TableHead>Source</TableHead><TableHead className="w-[88px] text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>{rows.map((row) => <TableRow key={row.id}>
            <TableCell className="min-w-[180px]"><div className="font-medium">{row.name}</div>{row.official_name && row.official_name !== row.name && <div className="text-xs text-muted-foreground">{row.official_name}</div>}{row.other_names?.length > 0 && <div className="text-xs text-muted-foreground">Also: {row.other_names.join(", ")}</div>}</TableCell>
            <TableCell className="whitespace-nowrap"><Badge variant="secondary">{row.boundary_category ? row.boundary_category.replace("_", " ") : "Administrative"}</Badge></TableCell>
            <TableCell className="whitespace-nowrap">{getGeographyTypeLabel(row.geography_type)}</TableCell>
            <TableCell className="max-w-[180px] truncate">{row.parent_id ? (parentNames.get(row.parent_id) || "Loading…") : <span className="text-muted-foreground">—</span>}</TableCell>
            <TableCell><Badge variant={row.status === "defunct" ? "destructive" : row.status === "former" ? "outline" : "secondary"}>{row.status || "active"}</Badge></TableCell>
            <TableCell><div>{row.source || "—"}</div>{row.source_id && <div className="text-xs text-muted-foreground">{row.source_type ? row.source_type + ": " : ""}{row.source_id}</div>}</TableCell>
            <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${row.name}`} onClick={() => { setEditing(row); setEditorOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${row.name}`} onClick={() => remove(row.id)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
          </TableRow>)}</TableBody>
        </Table>}
      </CardContent></Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Rows per page</span><Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(0); }}><SelectTrigger className="h-8 w-[76px]"><SelectValue /></SelectTrigger><SelectContent>{[25, 50, 100].map((value) => <SelectItem key={value} value={String(value)}>{value}</SelectItem>)}</SelectContent></Select></div>
        <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{totalCount === 0 ? "0 results" : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, totalCount)} of ${totalCount}`}</span><div className="flex gap-1"><Button variant="outline" size="sm" disabled={page === 0 || isLoading} onClick={() => setPage((value) => Math.max(0, value - 1))}><ChevronLeft className="mr-1 h-4 w-4" />Previous</Button><Button variant="outline" size="sm" disabled={page + 1 >= pageCount || isLoading} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>Next<ChevronRight className="ml-1 h-4 w-4" /></Button></div></div>
      </div>
      <DigitalSansadDiagnostics />
    </main>
    <GeographyEditor open={editorOpen} onOpenChange={setEditorOpen} geography={editing} onSaved={() => { setEditing(null); setEditorOpen(false); queryClient.invalidateQueries({ queryKey: queryKeys.geography.all }); }} />
  </div>;
}
