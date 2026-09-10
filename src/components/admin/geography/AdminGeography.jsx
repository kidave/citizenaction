"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, MapPinned, Trash2, Pencil, Upload } from "lucide-react";
import { toast } from "sonner";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";

const TYPES = [
  ["country", "Country"],
  ["state", "State / Union territory"],
  ["division", "Division"],
  ["district", "District"],
  ["city", "City"],
  ["local_government", "Local government"],
  ["zone", "Zone"],
  ["ward", "Ward"],
  ["other", "Other"],
];

function typeLabel(value) {
  return TYPES.find(([key]) => key === value)?.[1] || value || "Geography";
}

function emptyForm() {
  return {
    id: null,
    name: "",
    official_name: "",
    slug: "",
    geography_type: "state",
    country_code: "IN",
    parent_id: "none",
    osm_type: "",
    osm_id: "",
    admin_level: "",
    source: "manual",
    source_url: "",
    metadata: "{}",
    geojson: "",
  };
}

export default function AdminGeography() {
  const [rows, setRows] = useState([]);
  const [parents, setParents] = useState([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyForm());

  async function load() {
    setLoading(true);
    const [{ data, error }, { data: parentData, error: parentError }] = await Promise.all([
      supabase.from("jurisdiction_geography").select("id,name,official_name,geography_type,country_code,parent_id,osm_type,osm_id,admin_level,source,source_url,geom,created_at,updated_at").order("name", { ascending: true }).limit(5000),
      supabase.from("jurisdiction_geography").select("id,name,geography_type,parent_id").order("name", { ascending: true }).limit(5000),
    ]);
    setLoading(false);
    if (error) return toast.error(error.message || "Unable to load geography");
    if (parentError) return toast.error(parentError.message || "Unable to load parent geography");
    setRows(data || []);
    setParents(parentData || []);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (typeFilter !== "all" && row.geography_type !== typeFilter) return false;
      if (!needle) return true;
      return [row.name, row.official_name, row.source, row.country_code].filter(Boolean).join(" ").toLowerCase().includes(needle);
    });
  }, [query, rows, typeFilter]);

  const parentOptions = parents.filter((item) => item.id !== form.id);

  const openCreate = () => { setForm(emptyForm()); setOpen(true); };
  const openEdit = (row) => {
    setForm({
      ...emptyForm(),
      ...row,
      parent_id: row.parent_id || "none",
      osm_id: row.osm_id ? String(row.osm_id) : "",
      admin_level: row.admin_level != null ? String(row.admin_level) : "",
    });
    setOpen(true);
  };

  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const lower = file.name.toLowerCase();
      let json;
      if (lower.endsWith(".json") || lower.endsWith(".geojson")) {
        json = JSON.parse(text);
      } else {
        throw new Error("Use a GeoJSON or JSON file");
      }
      const geometry = json.type === "FeatureCollection" ? (json.features?.[0]?.geometry || null) : json.type === "Feature" ? json.geometry : json;
      if (!geometry || !geometry.type) throw new Error("No GeoJSON geometry found");
      setValue("geojson", JSON.stringify(geometry));
      toast.success("Geometry loaded from file");
    } catch (error) {
      toast.error(error?.message || "Unable to read geometry file");
    }
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.geography_type) return toast.error("Geography type is required");
    let metadata = {};
    if (form.metadata.trim()) {
      try { metadata = JSON.parse(form.metadata); } catch { return toast.error("Metadata must be valid JSON"); }
    }
    if (form.geojson.trim()) {
      try { JSON.parse(form.geojson); } catch { return toast.error("Geometry must be valid GeoJSON"); }
    }
    setSaving(true);
    const { data, error } = await supabase.rpc("set_jurisdiction_geography", {
      p_id: form.id || null,
      p_name: form.name.trim(),
      p_official_name: form.official_name.trim() || null,
      p_slug: form.slug.trim() || null,
      p_geography_type: form.geography_type,
      p_country_code: form.country_code.trim() || "IN",
      p_parent_id: form.parent_id === "none" ? null : form.parent_id,
      p_osm_type: form.osm_type.trim() || null,
      p_osm_id: form.osm_id.trim() ? Number(form.osm_id) : null,
      p_admin_level: form.admin_level.trim() ? Number(form.admin_level) : null,
      p_source: form.source.trim() || "manual",
      p_source_url: form.source_url.trim() || null,
      p_metadata: metadata,
      p_geojson: form.geojson.trim() ? JSON.parse(form.geojson) : null,
      p_center: null,
    });
    setSaving(false);
    if (error) return toast.error(error.message || "Unable to save geography");
    toast.success(form.id ? "Geography updated" : "Geography created");
    setOpen(false);
    await load();
    return data;
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this geography? This cannot be undone.")) return;
    setDeleting(id);
    const result = await supabase.from("jurisdiction_geography").delete().eq("id", id);
    setDeleting(null);
    if (result.error) return toast.error(result.error.message || "Unable to delete geography");
    toast.success("Geography deleted");
    await load();
  };

  return (
    <div className="min-h-dvh bg-background">
      <AdminPageHeader items={[{ label: "Geography" }]} />

      <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Geography</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage reusable geographic areas and their boundaries.</p>
          </div>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add geography</Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search geography" className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All types</SelectItem>{TYPES.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading geography…</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center"><MapPinned className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><p className="font-medium">No geography found</p><p className="mt-1 text-sm text-muted-foreground">Create a reusable area and add its boundary geometry.</p></div>
            ) : (
              <div className="divide-y">
                {filtered.map((row) => (
                  <div key={row.id} className="flex items-center gap-4 p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted"><MapPinned className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><p className="truncate font-medium">{row.name}</p><Badge variant="secondary">{typeLabel(row.geography_type)}</Badge>{row.geom && <Badge variant="outline">Boundary</Badge>}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{row.official_name || row.country_code || ""}{row.source ? ` · ${row.source}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Edit ${row.name}`} onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${row.name}`} disabled={deleting === row.id} onClick={() => remove(row.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{form.id ? "Edit geography" : "Add geography"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Name</span><Input value={form.name} onChange={(e) => setValue("name", e.target.value)} /></label>
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Type</span><Select value={form.geography_type} onValueChange={(v) => setValue("geography_type", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Official name</span><Input value={form.official_name} onChange={(e) => setValue("official_name", e.target.value)} /></label>
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Parent geography</span><Select value={form.parent_id} onValueChange={(v) => setValue("parent_id", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No parent</SelectItem>{parentOptions.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} · {typeLabel(item.geography_type)}</SelectItem>)}</SelectContent></Select></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Country code</span><Input value={form.country_code} onChange={(e) => setValue("country_code", e.target.value)} /></label>
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">OSM type</span><Input value={form.osm_type} onChange={(e) => setValue("osm_type", e.target.value)} placeholder="relation" /></label>
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">OSM ID</span><Input value={form.osm_id} onChange={(e) => setValue("osm_id", e.target.value)} inputMode="numeric" /></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Source</span><Input value={form.source} onChange={(e) => setValue("source", e.target.value)} placeholder="manual / OSM / LGD" /></label>
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Source URL</span><Input value={form.source_url} onChange={(e) => setValue("source_url", e.target.value)} placeholder="https://" /></label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium">Boundary geometry</p><p className="text-xs text-muted-foreground">Paste GeoJSON geometry or upload a GeoJSON file. KML can be converted to GeoJSON before import.</p></div><label className="inline-flex cursor-pointer items-center"><input type="file" accept=".json,.geojson,application/geo+json,application/json" className="hidden" onChange={onFile} /><Button type="button" variant="outline" asChild><span><Upload className="mr-2 h-4 w-4" />Import GeoJSON</span></Button></label></div>
              <Textarea value={form.geojson} onChange={(e) => setValue("geojson", e.target.value)} rows={8} placeholder='{"type":"MultiPolygon","coordinates":[...]}' className="font-mono text-xs" />
            </div>
            <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Metadata JSON</span><Textarea value={form.metadata} onChange={(e) => setValue("metadata", e.target.value)} rows={4} className="font-mono text-xs" /></label>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save geography"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
