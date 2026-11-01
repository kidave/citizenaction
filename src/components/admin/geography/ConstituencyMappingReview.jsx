"use client";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Pencil, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const blank = { source_name:"", source_state:"", canonical_name:"", geography_id:"", resolution_type:"other_name", valid_from:"", valid_to:"", successor_geography_ids:"", review_status:"pending", source_reference:"", state_context_needed:"", notes:"", dry_run_issue:"", timeline_match_type:"", timeline_source:"", timeline_coverage_note:"" };
const labels = { other_name:"Other name / alias", former:"Former historical constituency", exact:"Exact match", successor:"Historical constituency with successor(s)", unresolved:"Unresolved / needs research" };
const dateText = value => value ? String(value).slice(0,10) : "";

export default function ConstituencyMappingReview() {
  const qc = useQueryClient();
  const [search,setSearch] = useState("");
  const [status,setStatus] = useState("pending");
  const [state,setState] = useState("all");
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState(blank);
  const [geoSearch,setGeoSearch] = useState("");
  const [saving,setSaving] = useState(false);
  const {data:mappings=[],isLoading,error,refetch,isFetching} = useQuery({
    queryKey:["sansad-constituency-mappings"],
    queryFn:async()=>{ const {data,error}=await supabase.from("sansad_constituency_mapping").select("*").order("review_status").order("affected_member_records",{ascending:false}).order("source_name"); if(error) throw error; return data||[]; },
    staleTime:15000,
  });
  const {data:geographies=[]} = useQuery({
    queryKey:["sansad-review-geographies"],
    queryFn:async()=>{ const {data,error}=await supabase.from("geographies").select("id,name,official_name,other_names,status").eq("geography_type","parliamentary_constituency").eq("boundary_category","political").order("name").limit(1000); if(error) throw error; return data||[]; },
    staleTime:300000,
  });
  const states = useMemo(()=>[...new Set(mappings.map(r=>r.source_state).filter(Boolean))].sort(),[mappings]);
  const rows = useMemo(()=>mappings.filter(r=>{
    const q=search.trim().toLowerCase();
    return (status==="all"||r.review_status===status)&&(state==="all"||r.source_state===state)&&(!q||[r.source_name,r.source_state,r.canonical_name,r.dry_run_issue,r.notes].some(v=>String(v||"").toLowerCase().includes(q)));
  }),[mappings,search,status,state]);
  const filteredGeographies = useMemo(()=>{
    const q=geoSearch.trim().toLowerCase();
    return geographies.filter(g=>!q||[g.name,g.official_name,...(g.other_names||[])].some(v=>String(v||"").toLowerCase().includes(q))).slice(0,100);
  },[geographies,geoSearch]);
  const counts = useMemo(()=>({pending:mappings.filter(r=>r.review_status==="pending").length,inReview:mappings.filter(r=>r.review_status==="in_review").length,approved:mappings.filter(r=>r.review_status==="approved").length}),[mappings]);
  const set = (key,value)=>setForm(old=>({...old,[key]:value}));
  const openReview = row => {
    setEditing(row);
    setForm({...blank,...row,geography_id:row.geography_id||"",valid_from:dateText(row.valid_from),valid_to:dateText(row.valid_to),successor_geography_ids:(row.successor_geography_ids||[]).join(", ")});
    setGeoSearch(row.canonical_name||"");
  };
  const save = async nextStatus => {
    if(!editing) return;
    if(nextStatus==="approved"&&form.resolution_type==="other_name"&&!form.geography_id) return toast.error("Select the current constituency this other name refers to.");
    if(nextStatus==="approved"&&["former","successor"].includes(form.resolution_type)&&!form.source_reference.trim()) return toast.error("Add a source reference before approving a historical constituency.");
    setSaving(true);
    try {
      const changes = {
        source_name:form.source_name.trim(),source_state:form.source_state.trim()||null,canonical_name:form.canonical_name.trim()||null,
        geography_id:form.resolution_type==="former"?null:(form.geography_id||null),resolution_type:form.resolution_type,
        valid_from:form.valid_from||null,valid_to:form.valid_to||null,
        successor_geography_ids:form.successor_geography_ids.split(",").map(v=>v.trim()).filter(Boolean),
        review_status:nextStatus,source_reference:form.source_reference.trim()||null,state_context_needed:form.state_context_needed.trim()||null,
        notes:form.notes.trim()||null,dry_run_issue:form.dry_run_issue.trim()||null,timeline_match_type:form.timeline_match_type||null,
        timeline_source:form.timeline_source.trim()||null,timeline_coverage_note:form.timeline_coverage_note.trim()||null,
      };
      const {data,error}=await supabase.rpc("review_sansad_constituency_mapping",{p_mapping_id:editing.id,p_changes:changes});
      if(error) throw error;
      if(!data) throw new Error("Database did not confirm the mapping update.");
      toast.success(nextStatus==="approved"?"Mapping approved and applied":"Review saved");
      setEditing(null);
      await Promise.all([
        qc.invalidateQueries({queryKey:["sansad-constituency-mappings"]}),
        qc.invalidateQueries({queryKey:["sansad-review-geographies"]}),
        qc.invalidateQueries({queryKey:["digital-sansad-import-reports"]}),
        qc.invalidateQueries({queryKey:["admin-geography-parents"]}),
      ]);
    } catch(e) { toast.error(e?.message||"Unable to save mapping"); }
    finally { setSaving(false); }
  };
  return <section className="mt-8 space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-xl font-semibold tracking-tight">Constituency mapping review</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Review source labels against current constituencies or document former constituencies. Approving an alias updates the selected geography’s other_names; a former constituency is stored separately without creating a geography.</p></div>
      <Button variant="outline" onClick={()=>refetch()} disabled={isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${isFetching?"animate-spin":""}`}/>Refresh mappings</Button>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{counts.pending}</p></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">In review</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{counts.inReview}</p></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{counts.approved}</p></CardContent></Card>
    </div>
    <Card><CardContent className="space-y-3 p-4">
      <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_180px_200px]">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search source, canonical name, notes"/></div>
        <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="in_review">In review</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="all">All statuses</SelectItem></SelectContent></Select>
        <Select value={state} onValueChange={setState}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All states</SelectItem>{states.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      </div>
      {isLoading?<div className="p-8 text-center text-sm text-muted-foreground">Loading mappings…</div>:error?<div className="rounded-md border border-destructive/40 p-4 text-sm text-destructive">Unable to load mappings: {error.message}. Confirm the review migration is deployed and this account is an admin.</div>:rows.length===0?<div className="p-8 text-center text-sm text-muted-foreground">No mappings match these filters.</div>:
      <div className="overflow-x-auto rounded-md border"><table className="w-full text-sm"><thead className="bg-muted/50 text-left"><tr><th className="p-3 font-medium">Source label</th><th className="p-3 font-medium">State</th><th className="p-3 font-medium">Resolution</th><th className="p-3 font-medium">Members</th><th className="p-3 font-medium">Status</th><th className="p-3 text-right font-medium">Action</th></tr></thead><tbody className="divide-y">{rows.map(r=><tr key={r.id}>
        <td className="min-w-[180px] p-3"><div className="font-medium">{r.source_name}</div>{r.dry_run_issue&&<div className="mt-1 max-w-[260px] text-xs text-muted-foreground">{r.dry_run_issue}</div>}</td><td className="p-3">{r.source_state||"Not known"}</td><td className="p-3">{labels[r.resolution_type]||r.resolution_type||"Not set"}{r.canonical_name&&<div className="text-xs text-muted-foreground">→ {r.canonical_name}</div>}</td><td className="p-3">{Number(r.affected_member_records||0).toLocaleString()}</td><td className="p-3"><Badge variant={r.review_status==="approved"?"default":r.review_status==="rejected"?"destructive":"secondary"}>{r.review_status.replace("_"," ")}</Badge></td><td className="p-3 text-right"><Button variant="outline" size="sm" onClick={()=>openReview(r)}><Pencil className="mr-2 h-4 w-4"/>Review</Button></td>
      </tr>)}</tbody></table></div>}
      <p className="text-xs text-muted-foreground">Showing {rows.length.toLocaleString()} of {mappings.length.toLocaleString()} mappings.</p>
    </CardContent></Card>
    <Dialog open={Boolean(editing)} onOpenChange={open=>{if(!open&&!saving)setEditing(null);}}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>Review constituency: {form.source_name}</DialogTitle><DialogDescription>Record the supporting evidence so the decision can be checked later.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Source name</Label><Input value={form.source_name} onChange={e=>set("source_name",e.target.value)}/></div><div className="space-y-1.5"><Label>Source state / context</Label><Input value={form.source_state||""} onChange={e=>set("source_state",e.target.value)} placeholder="State or union territory"/></div></div>
          <div className="space-y-1.5"><Label>Resolution</Label><Select value={form.resolution_type||"unresolved"} onValueChange={v=>{set("resolution_type",v);if(v==="former")set("geography_id","");}}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Object.entries(labels).map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
          {!["former","unresolved"].includes(form.resolution_type)&&<div className="space-y-2"><Label>Current parliamentary constituency</Label><Input value={geoSearch} onChange={e=>setGeoSearch(e.target.value)} placeholder="Search current constituency"/><div className="max-h-44 overflow-y-auto rounded-md border">{filteredGeographies.map(g=><button type="button" key={g.id} onClick={()=>{set("geography_id",g.id);set("canonical_name",g.name);setGeoSearch(g.name);}} className={`flex w-full items-start justify-between gap-3 border-b p-2 text-left last:border-0 hover:bg-muted ${form.geography_id===g.id?"bg-muted":""}`}><span><span className="block font-medium">{g.name}</span>{g.other_names?.length>0&&<span className="block text-xs text-muted-foreground">Also: {g.other_names.join(", ")}</span>}</span>{form.geography_id===g.id&&<Badge>Selected</Badge>}</button>)}{filteredGeographies.length===0&&<p className="p-3 text-sm text-muted-foreground">No constituency found.</p>}</div>{form.geography_id&&<p className="text-xs text-muted-foreground">Geography ID: {form.geography_id}</p>}</div>}
          <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Valid from</Label><Input type="date" value={form.valid_from||""} onChange={e=>set("valid_from",e.target.value)}/></div><div className="space-y-1.5"><Label>Valid to</Label><Input type="date" value={form.valid_to||""} onChange={e=>set("valid_to",e.target.value)}/></div></div>
          <div className="space-y-1.5"><Label>Successor geography IDs (comma-separated)</Label><Input value={form.successor_geography_ids||""} onChange={e=>set("successor_geography_ids",e.target.value)} placeholder="Optional UUIDs"/></div>
          <div className="space-y-1.5"><Label>Supporting source URL / reference</Label><div className="flex gap-2"><Input value={form.source_reference||""} onChange={e=>set("source_reference",e.target.value)} placeholder="ECI result, delimitation order, archival source…"/>{/^https?:\/\//i.test(form.source_reference||"")&&<Button variant="outline" size="icon" asChild><a href={form.source_reference} target="_blank" rel="noreferrer" aria-label="Open source reference"><ExternalLink className="h-4 w-4"/></a></Button>}</div><p className="text-xs text-muted-foreground">Prefer Election Commission of India documents, delimitation orders, official constituency histories, or reliable archival sources.</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Timeline match type</Label><Input value={form.timeline_match_type||""} onChange={e=>set("timeline_match_type",e.target.value)}/></div><div className="space-y-1.5"><Label>Timeline source</Label><Input value={form.timeline_source||""} onChange={e=>set("timeline_source",e.target.value)}/></div></div>
          <div className="space-y-1.5"><Label>Timeline coverage note</Label><Textarea value={form.timeline_coverage_note||""} onChange={e=>set("timeline_coverage_note",e.target.value)} rows={2}/></div>
          <div className="space-y-1.5"><Label>State context needed</Label><Textarea value={form.state_context_needed||""} onChange={e=>set("state_context_needed",e.target.value)} rows={2}/></div>
          <div className="space-y-1.5"><Label>Reviewer notes / evidence summary</Label><Textarea value={form.notes||""} onChange={e=>set("notes",e.target.value)} rows={3} placeholder="Why is this an alias or a separate historical constituency?"/></div>
          <div className="space-y-1.5"><Label>Dry-run issue</Label><Textarea value={form.dry_run_issue||""} onChange={e=>set("dry_run_issue",e.target.value)} rows={2}/></div>
          <div className="rounded-md border bg-muted/30 p-3 text-sm"><p className="font-medium">What approval does</p><p className="mt-1 text-muted-foreground">{form.resolution_type==="other_name"?"Adds the source name to the selected current geography’s other_names so the existing importer can resolve it without creating another geography.":(["former","successor"].includes(form.resolution_type)?"Stores a separate historical constituency record, including its source and timeline, without creating a geographies row.":"Saves the reviewed decision; no alias is added unless the resolution is Other name / alias.")}</p></div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between"><div className="flex flex-wrap gap-2"><Button variant="outline" disabled={saving} onClick={()=>save("in_review")}>Mark in review</Button><Button variant="outline" disabled={saving} onClick={()=>save("rejected")}>Reject</Button></div><div className="flex flex-wrap gap-2"><Button variant="outline" disabled={saving} onClick={()=>save(form.review_status)}>Save review</Button><Button disabled={saving} onClick={()=>save("approved")}>{saving?"Saving…":"Approve and apply"}</Button></div></DialogFooter>
      </DialogContent>
    </Dialog>
  </section>;
}
