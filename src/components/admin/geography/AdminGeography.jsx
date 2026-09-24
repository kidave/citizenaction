"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPinned, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import GeographyEditor from "@/components/admin/geography/GeographyEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

const TYPES = {
  country: "Country",
  state: "State / Union territory",
  division: "Division",
  district: "District",
  city: "City",
  local_government: "Local government",
  zone: "Zone",
  ward: "Ward",
  other: "Other",
};

export default function AdminGeography() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jurisdiction_geography")
      .select("id,name,official_name,geography_type,parent_id,country_code,osm_type,osm_id,admin_level,source,source_url,geom")
      .order("name", { ascending: true })
      .limit(5000);
    setLoading(false);
    if (error) return toast.error(error.message || "Unable to load geography");
    setRows(data || []);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((row) => {
    if (type !== "all" && row.geography_type !== type) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return `${row.name || ""} ${row.official_name || ""} ${row.source || ""}`.toLowerCase().includes(needle);
  }), [query, rows, type]);

  const remove = async (id) => {
    const row = rows.find((item) => item.id === id);
    if (!row) return;
    const linked = await supabase.from("governance_boundary").select("id", { count: "exact", head: true }).eq("geography_id", id);
    if (linked.error) return toast.error(linked.error.message || "Unable to check geography links");
    if ((linked.count || 0) > 0) return toast.error("This geography is linked to governance entities and cannot be deleted yet.");
    const { error } = await supabase.rpc("delete_jurisdiction_geography", { p_id: id });
    if (error) return toast.error(error.message || "Unable to delete geography");
    toast.success(`${row.name} deleted`);
    load();
  };

  return <div className="min-h-dvh bg-background">
    <AdminPageHeader items={[{ label: "Geography" }]} />
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Geography</h1><p className="mt-1 text-sm text-muted-foreground">Manage reusable areas and their boundary geometry.</p></div>
        <Button onClick={() => { setEditing(null); setEditorOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add geography</Button>
      </div>
      <div className="flex items-center gap-3"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search geography" /></div><span className="text-sm text-muted-foreground">{filtered.length} areas</span></div>
      <Card><CardContent className="p-0">{loading ? <div className="p-8 text-center text-sm text-muted-foreground">Loading geography…</div> : filtered.length === 0 ? <div className="p-10 text-center"><MapPinned className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><p className="font-medium">No geography found</p><p className="mt-1 text-sm text-muted-foreground">Add a geography and upload its boundary.</p></div> : <div className="divide-y">{filtered.map((row) => <div key={row.id} className="flex items-center gap-4 p-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted"><MapPinned className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-medium">{row.name}</p><Badge variant="secondary">{TYPES[row.geography_type] || row.geography_type}</Badge>{row.geom && <Badge variant="outline">Boundary</Badge>}</div><p className="mt-1 text-xs text-muted-foreground">{row.official_name || ""}{row.source ? ` · ${row.source}` : ""}</p></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${row.name}`} onClick={() => { setEditing(row); setEditorOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${row.name}`} onClick={() => remove(row.id)}><Trash2 className="h-4 w-4" /></Button></div></div>)}</div>}</CardContent></Card>
    </main>
    <GeographyEditor open={editorOpen} onOpenChange={setEditorOpen} geography={editing} onSaved={() => { setEditing(null); load(); }} />
  </div>;
}
