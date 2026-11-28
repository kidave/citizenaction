"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileUp, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const norm = (v) => String(v || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/district$/i, "").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
const lgd = (row) => row?.ref_lgd_district || row?.lgd_code || row?.metadata?.ref_lgd_district || row?.metadata?.lgd_district_code || row?.metadata?.lgd_code || null;

async function readArtifact(file) {
  if (!file) return null;
  const payload = JSON.parse(await file.text());
  const rows = Array.isArray(payload) ? payload : payload?.results;
  if (!Array.isArray(rows)) throw new Error("Expected an india-osm-districts.json file with a results array.");
  const byId = new Map(rows.filter((r) => r?.osm_id).map((r) => [String(r.osm_id), { ...r, osm_id: String(r.osm_id) }]));
  return { name: file.name, byId };
}

async function loadDistricts() {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from("geographies")
      .select("id,name,official_name,status,parent_id,country_code,osm_id,source_id,source_type,metadata")
      .eq("geography_type", "district").eq("country_code", "IN")
      .order("name").range(offset, offset + 999);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  const parentIds = [...new Set(rows.map((r) => r.parent_id).filter(Boolean))];
  const parents = [];
  for (let i = 0; i < parentIds.length; i += 500) {
    const { data, error } = await supabase.from("geographies").select("id,name,osm_id").in("id", parentIds.slice(i, i + 500));
    if (error) throw error;
    parents.push(...(data || []));
  }
  const parentMap = new Map(parents.map((p) => [p.id, p]));
  return rows.map((r) => {
    const parent = parentMap.get(r.parent_id);
    return { ...r, osm_id: r.osm_id != null ? String(r.osm_id) : (r.source_type === "relation" ? String(r.source_id || "") : ""), state_name: parent?.name || "Unknown state", lgd_code: lgd(r) };
  });
}

const filters = [
  ["all", "All records"], ["matched", "Matched in all three"],
  ["artifact_only", "In artifacts, not Supabase"], ["db_only", "In Supabase, not artifacts"],
  ["delta", "Artifact A / B difference"], ["name", "Name or state mismatch"], ["lgd", "LGD mapping review"],
];

export default function OsmLgdDistrictReview() {
  const [a, setA] = useState(null), [b, setB] = useState(null);
  const [filter, setFilter] = useState("all"), [search, setSearch] = useState(""), [state, setState] = useState("all");
  const query = useQuery({ queryKey: ["admin-osm-lgd-district-review"], queryFn: loadDistricts, staleTime: 30000 });
  const db = query.data || [];
  const comparison = useMemo(() => {
    if (!a || !b) return null;
    const dbMap = new Map();
    db.forEach((r) => { if (r.osm_id) { const list = dbMap.get(r.osm_id) || []; list.push(r); dbMap.set(r.osm_id, list); } });
    const ids = new Set([...a.byId.keys(), ...b.byId.keys(), ...dbMap.keys()]);
    const rows = [...ids].map((id) => {
      const x = a.byId.get(id), y = b.byId.get(id), matches = dbMap.get(id) || [], d = matches[0];
      const osm = y || x;
      const artifactOnly = Boolean(osm && !d), dbOnly = Boolean(d && !osm);
      const nameMismatch = Boolean(d && osm && (norm(d.name) !== norm(osm.name) || norm(d.state_name) !== norm(osm.state_name)));
      const al = lgd(x), bl = lgd(y), dl = d?.lgd_code || null;
      const lgdReview = Boolean(osm && (!bl || !dl || (bl && dl && bl !== dl)));
      return { id, x, y, d, matches, osm, stateName: osm?.state_name || d?.state_name || "Unknown state", artifactOnly, dbOnly, delta: Boolean(Boolean(x) !== Boolean(y)), nameMismatch, lgdReview, al, bl, dl, matched: Boolean(x && y && d) };
    });
    const count = (fn) => rows.filter(fn).length;
    return { rows, counts: { a: a.byId.size, b: b.byId.size, db: db.length, matched: count(r => r.matched), artifactOnly: count(r => r.artifactOnly), dbOnly: count(r => r.dbOnly), delta: count(r => r.delta), name: count(r => r.nameMismatch), lgd: count(r => r.lgdReview) } };
  }, [a, b, db]);
  const states = useMemo(() => [...new Set((comparison?.rows || []).map(r => r.stateName))].sort(), [comparison]);
  const visible = useMemo(() => {
    if (!comparison) return [];
    const q = norm(search);
    return comparison.rows.filter(r => {
      if (state !== "all" && r.stateName !== state) return false;
      if (q && ![r.stateName, r.osm?.name, r.d?.name, r.id, r.al, r.bl, r.dl].some(v => norm(v).includes(q))) return false;
      if (filter === "matched") return r.matched;
      if (filter === "artifact_only") return r.artifactOnly;
      if (filter === "db_only") return r.dbOnly;
      if (filter === "delta") return r.delta;
      if (filter === "name") return r.nameMismatch;
      if (filter === "lgd") return r.lgdReview;
      return true;
    }).sort((x, y) => x.stateName.localeCompare(y.stateName) || (x.osm?.name || x.d?.name || "").localeCompare(y.osm?.name || y.d?.name || ""));
  }, [comparison, filter, search, state]);
  const upload = async (event, slot) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    try { const value = await readArtifact(file); (slot === "a" ? setA : setB)(value); toast.success(file.name + ": " + value.byId.size + " unique relations loaded"); }
    catch (e) { toast.error(e.message || "Unable to parse artifact JSON"); }
  };
  return <Card id="osm-lgd-district-review" className="scroll-mt-6">
    <CardHeader>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div><CardTitle className="text-base">OSM and LGD district reconciliation</CardTitle><CardDescription className="mt-1 max-w-3xl">Compare two OSM workflow artifacts against live Supabase district records. OSM relation ID is the primary match; names and LGD codes are review signals, not automatic identity decisions.</CardDescription></div>
        <Button type="button" size="sm" variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}><RefreshCw className={"mr-2 h-4 w-4 " + (query.isFetching ? "animate-spin" : "")}/>Refresh database</Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {[{slot:"a",label:"OSM artifact A",value:a},{slot:"b",label:"OSM artifact B",value:b}].map(item => <div key={item.slot} className="rounded-lg border p-3"><div className="text-sm font-medium">{item.label}</div><div className="mt-1 min-h-8 text-xs text-muted-foreground">{item.value ? item.value.name + " · " + item.value.byId.size + " unique relations" : "Upload india-osm-districts.json"}</div><label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"><FileUp className="h-4 w-4"/>{item.value ? "Replace JSON" : "Upload JSON"}<input className="sr-only" type="file" accept=".json,application/json" onChange={e => upload(e,item.slot)}/></label></div>)}
        <div className="rounded-lg border p-3"><div className="text-sm font-medium">Supabase</div><div className="mt-1 min-h-8 text-xs text-muted-foreground">{query.isLoading ? "Loading district records…" : query.error ? "Unable to load district records" : db.length + " district records · live read-only query"}</div><div className="mt-2 text-xs text-muted-foreground">No database writes from this review</div></div>
      </div>
      {(!a || !b) && <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">Upload both extracted <code>india-osm-districts.json</code> files from the two workflow ZIP artifacts. Supabase data loads automatically.</div>}
      {query.error && <p className="text-sm text-destructive">{query.error.message}</p>}
      {comparison && <>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{[["Artifact A",comparison.counts.a],["Artifact B",comparison.counts.b],["Supabase",comparison.counts.db],["Exact in all 3",comparison.counts.matched],["Artifact-only",comparison.counts.artifactOnly],["DB-only",comparison.counts.dbOnly],["A / B difference",comparison.counts.delta],["Name/state mismatch",comparison.counts.name],["LGD review",comparison.counts.lgd]].map(([label,value]) => <div key={label} className="rounded-md border px-3 py-2"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-xl font-semibold tabular-nums">{value}</div></div>)}</div>
        <div className="flex flex-col gap-2 lg:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search district, state, OSM ID or LGD code"/></div>
          <Select value={state} onValueChange={setState}><SelectTrigger className="lg:w-[220px]"><SelectValue placeholder="All states / UTs"/></SelectTrigger><SelectContent><SelectItem value="all">All states / UTs</SelectItem>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <Select value={filter} onValueChange={setFilter}><SelectTrigger className="lg:w-[240px]"><SelectValue/></SelectTrigger><SelectContent>{filters.map(([v,label]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="overflow-x-auto rounded-md border"><Table><TableHeader><TableRow><TableHead>State / UT</TableHead><TableHead>District</TableHead><TableHead>Artifact A</TableHead><TableHead>Artifact B</TableHead><TableHead>Supabase</TableHead><TableHead>OSM relation</TableHead><TableHead>LGD A / B / DB</TableHead><TableHead>Review</TableHead></TableRow></TableHeader><TableBody>
          {visible.length ? visible.map(r => { const issues=[]; if(r.delta)issues.push("A/B difference"); if(r.artifactOnly)issues.push("Not in DB"); if(r.dbOnly)issues.push("Not in artifacts"); if(r.nameMismatch)issues.push("Name/state"); if(r.lgdReview)issues.push("LGD review"); if(r.matches.length>1)issues.push("Duplicate DB ID"); return <TableRow key={r.id}><TableCell className="whitespace-nowrap">{r.stateName}</TableCell><TableCell className="min-w-[170px]"><div className="font-medium">{r.osm?.name || r.d?.name || "Unnamed relation"}</div>{r.d?.name && r.osm?.name && r.d.name !== r.osm.name && <div className="text-xs text-muted-foreground">DB: {r.d.name}</div>}</TableCell><TableCell>{r.x ? <Badge variant="secondary">Present</Badge> : "—"}</TableCell><TableCell>{r.y ? <Badge variant="secondary">Present</Badge> : "—"}</TableCell><TableCell>{r.d ? <Badge variant={r.d.status === "active" ? "secondary" : "outline"}>{r.d.status || "unknown"}</Badge> : "—"}</TableCell><TableCell className="font-mono text-xs">{r.id}</TableCell><TableCell className="font-mono text-xs">{r.al || "—"} / {r.bl || "—"} / {r.dl || "—"}</TableCell><TableCell className="min-w-[140px]"><div className="flex flex-wrap gap-1">{issues.length ? issues.map(i=><Badge key={i} variant="outline">{i}</Badge>) : <Badge variant="secondary">Matched</Badge>}</div></TableCell></TableRow>; }) : <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No records match these filters.</TableCell></TableRow>}
        </TableBody></Table></div>
        <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Showing {visible.length} of {comparison.rows.length} unique OSM IDs.</span><span className="inline-flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5"/>Review only · no insert, update or deactivation</span></div>
      </>}
    </CardContent>
  </Card>;
}
