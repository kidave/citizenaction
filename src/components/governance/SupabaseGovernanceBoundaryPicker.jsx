"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPinned, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";

const TYPES = {
  state: "State / Union territory",
  division: "Division",
  district: "District",
  city: "City",
  local_government: "Local government",
  zone: "Zone",
  ward: "Ward",
  other: "Other",
};

const getName = (row) => row?.official_name || row?.name || "Unnamed geography";

async function loadRows(type, parentId) {
  let q = supabase.from("jurisdiction_geography").select("id,name,official_name,geography_type,parent_id,source").eq("geography_type", type).order("name");
  q = parentId ? q.eq("parent_id", parentId) : q.is("parent_id", null);
  const { data, error } = await q.limit(2000);
  if (error) throw error;
  return data || [];
}

export default function SupabaseGovernanceBoundaryPicker({ governanceId, disabled = false }) {
  const [states, setStates] = useState([]);
  const [boundaries, setBoundaries] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [types, setTypes] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [{ data: stateData, error: stateError }, { data: linkData, error: linkError }] = await Promise.all([
        supabase.from("jurisdiction_geography").select("id,name,official_name,geography_type,parent_id,source").eq("geography_type", "state").order("name").limit(500),
        governanceId ? supabase.from("governance_boundary").select("id,governance_id,geography_id,boundary_type,is_primary,notes").eq("governance_id", governanceId).order("is_primary", { ascending: false }).order("created_at") : Promise.resolve({ data: [], error: null }),
      ]);
      if (stateError) throw stateError;
      if (linkError) throw linkError;
      const linkRows = linkData || [];
      if (linkRows.length) {
        const { data: geographyRows, error: geographyError } = await supabase.from("jurisdiction_geography").select("id,name,official_name,geography_type,parent_id,source").in("id", linkRows.map((r) => r.geography_id));
        if (geographyError) throw geographyError;
        const byId = new Map((geographyRows || []).map((r) => [r.id, r]));
        setBoundaries(linkRows.map((r) => ({ ...r, geography: byId.get(r.geography_id) || null })));
      } else setBoundaries([]);
      setStates(stateData || []);
    } catch (error) {
      toast.error(error?.message || "Unable to load boundaries");
    } finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); }, [governanceId]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedState) { setTypes([]); return undefined; }
    setLoadingOptions(true);
    Promise.all(Object.keys(TYPES).map(async (type) => ({ type, rows: await loadRows(type, selectedState).catch(() => []) })))
      .then((results) => { if (!cancelled) setTypes(results.filter((r) => r.rows.length).map((r) => r.type)); })
      .finally(() => { if (!cancelled) setLoadingOptions(false); });
    return () => { cancelled = true; };
  }, [selectedState]);

  const chooseType = async (type) => {
    setSelectedType(type);
    setLoadingOptions(true);
    try { setOptions(await loadRows(type, selectedState || null)); }
    catch (error) { toast.error(error?.message || "Unable to load geographies"); }
    finally { setLoadingOptions(false); }
  };

  const add = async (geography) => {
    if (!governanceId) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc("set_governance_boundary", {
        p_governance_id: governanceId,
        p_geography_id: geography.id,
        p_boundary_type: geography.geography_type,
        p_is_primary: boundaries.length === 0,
        p_valid_from: null,
        p_valid_to: null,
        p_notes: null,
      });
      if (error) throw error;
      setBoundaries((current) => [...current.filter((row) => row.id !== data.id), { ...data, geography }]);
      toast.success(`${getName(geography)} linked`);
    } catch (error) { toast.error(error?.message || "Unable to link boundary"); }
    finally { setSaving(false); }
  };

  const remove = async (row) => {
    setSaving(true);
    try {
      const { error } = await supabase.rpc("delete_governance_boundary", { p_id: row.id });
      if (error) throw error;
      setBoundaries((current) => current.filter((item) => item.id !== row.id));
      toast.success("Boundary removed");
    } catch (error) { toast.error(error?.message || "Unable to remove boundary"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 rounded-lg border px-3 py-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading boundaries…</div>;

  return <div className="space-y-4">
    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">Boundary</p><p className="text-xs text-muted-foreground">Link the entity to reusable geography records. Geometry is not copied into the governance record.</p></div><MapPinned className="h-4 w-4 text-muted-foreground" /></div>
    {boundaries.length > 0 && <div className="rounded-lg border p-3 space-y-2">{boundaries.map((row) => <div key={row.id} className="flex items-center gap-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{getName(row.geography)}</p><p className="text-xs text-muted-foreground">{TYPES[row.boundary_type] || row.boundary_type}</p></div><Button type="button" variant="ghost" size="icon" disabled={disabled || saving} onClick={() => remove(row)}><X className="h-4 w-4" /></Button></div>)}</div>}
    <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><label className="text-sm font-medium">State / Union territory</label><Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setSelectedType(""); setOptions([]); }} disabled={disabled || loadingOptions}><SelectTrigger><SelectValue placeholder="Choose a state" /></SelectTrigger><SelectContent className="max-h-72">{states.map((state) => <SelectItem key={state.id} value={state.id}>{getName(state)}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1.5"><label className="text-sm font-medium">Boundary type</label><Select value={selectedType} onValueChange={chooseType} disabled={disabled || !selectedState || loadingOptions}><SelectTrigger><SelectValue placeholder={!selectedState ? "Choose a state first" : "Choose a type"} /></SelectTrigger><SelectContent>{types.map((type) => <SelectItem key={type} value={type}>{TYPES[type]}</SelectItem>)}</SelectContent></Select></div></div>
    {selectedType && <div className="rounded-lg border">{loadingOptions ? <div className="p-4 text-sm text-muted-foreground">Loading…</div> : options.length === 0 ? <div className="p-4 text-sm text-muted-foreground">No geography is available for this selection.</div> : <div className="max-h-56 divide-y overflow-y-auto">{options.map((row) => <button type="button" key={row.id} onClick={() => add(row)} disabled={disabled || saving} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/60"><Plus className="h-4 w-4 text-muted-foreground" /><span className="truncate text-sm">{getName(row)}</span></button>)}</div>}</div>}
  </div>;
}
