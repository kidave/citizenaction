"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";

const TYPES = { state: "State / Union territory", division: "Division", district: "District", city: "City", local_government: "Local government", zone: "Zone", ward: "Ward", other: "Other" };

const blank = { id: null, name: "", official_name: "", geography_type: "state", parent_id: "none", country_code: "IN", osm_type: "", osm_id: "", admin_level: "", source: "manual", source_url: "", metadata: "{}", geojson: "" };

export default function GeographyEditor({ open, onOpenChange, geography, onSaved }) {
  const [form, setForm] = useState(blank);
  const [parents, setParents] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(geography ? { ...blank, ...geography, parent_id: geography.parent_id || "none", osm_id: geography.osm_id ? String(geography.osm_id) : "", admin_level: geography.admin_level != null ? String(geography.admin_level) : "" } : blank);
  }, [geography, open]);

  useEffect(() => {
    if (!open) return;
    supabase.from("jurisdiction_geography").select("id,name,geography_type").order("name").limit(5000).then(({ data, error }) => { if (error) toast.error(error.message); else setParents(data || []); });
  }, [open]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const importGeoJson = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const geometry = parsed.type === "FeatureCollection" ? parsed.features?.[0]?.geometry : parsed.type === "Feature" ? parsed.geometry : parsed;
      if (!geometry?.type) throw new Error("No geometry found in file");
      set("geojson", JSON.stringify(geometry));
      if (!form.source || form.source === "manual") set("source", "GeoJSON import");
      toast.success("Geometry imported");
    } catch (error) { toast.error(error?.message || "Unable to import GeoJSON"); }
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    let metadata = {};
    try { metadata = form.metadata.trim() ? JSON.parse(form.metadata) : {}; } catch { return toast.error("Metadata must be valid JSON"); }
    let geojson = null;
    if (form.geojson.trim()) { try { geojson = JSON.parse(form.geojson); } catch { return toast.error("Boundary must be valid GeoJSON"); } }
    setSaving(true);
    const { data, error } = await supabase.rpc("set_jurisdiction_geography", {
      p_id: form.id || null,
      p_name: form.name.trim(),
      p_official_name: form.official_name.trim() || null,
      p_slug: null,
      p_geography_type: form.geography_type,
      p_country_code: form.country_code.trim() || "IN",
      p_parent_id: form.parent_id === "none" ? null : form.parent_id,
      p_osm_type: form.osm_type.trim() || null,
      p_osm_id: form.osm_id.trim() ? Number(form.osm_id) : null,
      p_admin_level: form.admin_level.trim() ? Number(form.admin_level) : null,
      p_source: form.source.trim() || "manual",
      p_source_url: form.source_url.trim() || null,
      p_metadata: metadata,
      p_geojson: geojson,
      p_center: null,
    });
    setSaving(false);
    if (error) return toast.error(error.message || "Unable to save geography");
    toast.success(form.id ? "Geography updated" : "Geography created");
    onSaved?.(data);
    onOpenChange?.(false);
  };

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{form.id ? "Edit geography" : "Add geography"}</DialogTitle></DialogHeader><div className="grid gap-4 py-2">
    <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Name</span><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></label><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Type</span><Select value={form.geography_type} onValueChange={(v) => set("geography_type", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPES).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></label></div>
    <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Official name</span><Input value={form.official_name} onChange={(e) => set("official_name", e.target.value)} /></label><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Parent geography</span><Select value={form.parent_id} onValueChange={(v) => set("parent_id", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No parent</SelectItem>{parents.filter((p) => p.id !== form.id).map((p) => <SelectItem key={p.id} value={p.id}>{p.name} · {TYPES[p.geography_type] || p.geography_type}</SelectItem>)}</SelectContent></Select></label></div>
    <div className="grid gap-4 sm:grid-cols-3"><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Country code</span><Input value={form.country_code} onChange={(e) => set("country_code", e.target.value)} /></label><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">OSM type</span><Input value={form.osm_type} onChange={(e) => set("osm_type", e.target.value)} /></label><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">OSM ID</span><Input value={form.osm_id} onChange={(e) => set("osm_id", e.target.value)} /></label></div>
    <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Source</span><Input value={form.source} onChange={(e) => set("source", e.target.value)} /></label><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Source URL</span><Input value={form.source_url} onChange={(e) => set("source_url", e.target.value)} /></label></div>
    <div className="space-y-2"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium">Boundary geometry</p><p className="text-xs text-muted-foreground">Upload or paste GeoJSON. This geometry is stored on the reusable geography record.</p></div><label className="cursor-pointer"><input type="file" accept=".geojson,.json,application/geo+json,application/json" className="hidden" onChange={importGeoJson} /><span className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"><Upload className="mr-2 h-4 w-4" />Import</span></label></div><Textarea value={form.geojson} onChange={(e) => set("geojson", e.target.value)} rows={9} className="font-mono text-xs" placeholder='{"type":"MultiPolygon","coordinates":[...]}' /></div>
    <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Metadata JSON</span><Textarea value={form.metadata} onChange={(e) => set("metadata", e.target.value)} rows={4} className="font-mono text-xs" /></label>
  </div><DialogFooter><Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save geography"}</Button></DialogFooter></DialogContent></Dialog>;
}
