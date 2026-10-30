import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formatDate = (value) => value ? new Date(value).toLocaleString() : "Not available";

export default function DigitalSansadDiagnostics() {
  const [filter, setFilter] = useState("unresolved");
  const [search, setSearch] = useState("");
  const { data: runs = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["digital-sansad-import-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("digital_sansad_import_reports")
        .select("id,created_at,mode,fetched_source_rows,advertised_source_total,unresolved_assignment_count,unresolved_unique_names,ambiguous_assignment_count,matched_former_count,matched_defunct_count,report,workflow_run_url,status,error_message")
        .order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });
  const latest = runs[0];
  const issues = useMemo(() => {
    const report = latest?.report || {};
    const unresolved = (report.unresolved_constituencies || []).map((item) => ({ ...item, issue_type: "Unresolved" }));
    const ambiguous = (report.ambiguous_constituencies || []).map((item) => ({ ...item, issue_type: "Ambiguous" }));
    return [...unresolved, ...ambiguous].filter((item) => {
      const label = String(item.constituency || "");
      const matchesFilter = filter === "all" || item.issue_type.toLowerCase() === filter;
      const needle = search.trim().toLowerCase();
      return matchesFilter && (!needle || label.toLowerCase().includes(needle) || String(item.name || "").toLowerCase().includes(needle) || String(item.mpsno || "").toLowerCase().includes(needle));
    }).sort((a, b) => String(a.constituency || "").localeCompare(String(b.constituency || "")));
  }, [latest, filter, search]);

  return <section className="mt-8 space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-xl font-semibold tracking-tight">Digital Sansad data quality</h2><p className="mt-1 text-sm text-muted-foreground">Scheduled dry-run diagnostics. Reports do not import or modify member records.</p></div>
      <Button variant="outline" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Refresh report</Button>
    </div>
    {isLoading ? <div className="p-6 text-sm text-muted-foreground">Loading report history…</div> : error ? <Card><CardContent className="p-5 text-sm text-destructive">Unable to load reports: {error.message}. Confirm the diagnostics migration has been applied.</CardContent></Card> : !latest ? <Card><CardContent className="p-6"><p className="font-medium">No report published yet</p><p className="mt-1 text-sm text-muted-foreground">Run the Digital Sansad member sync workflow after deploying the database migration.</p></CardContent></Card> : <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Source records</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{Number(latest.fetched_source_rows || 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Advertised total: {latest.advertised_source_total ?? "Unknown"}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Unresolved assignments</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{Number(latest.unresolved_assignment_count || 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">{Number(latest.unresolved_unique_names || 0).toLocaleString()} unique unresolved names</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Ambiguous assignments</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{Number(latest.ambiguous_assignment_count || 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Require manual review</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Former matches</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{latest.matched_former_count == null ? "Not reported" : Number(latest.matched_former_count).toLocaleString()}</p><p className="text-xs text-muted-foreground">Importer status reporting still needs extension</p></CardContent></Card>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>Latest report: {formatDate(latest.created_at)} · {latest.mode}</span>{latest.workflow_run_url && <a className="inline-flex items-center gap-1 underline underline-offset-4" href={latest.workflow_run_url} target="_blank" rel="noreferrer">Workflow run <ExternalLink className="h-3 w-3" /></a>}</div>
      <Card><CardHeader><CardTitle className="text-base">Constituency issues</CardTitle><p className="text-sm text-muted-foreground">Review source labels and affected members. Resolve verified aliases or geography records in the Geography editor; ambiguous matches must be reviewed manually.</p></CardHeader><CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-[200px_1fr]"><Select value={filter} onValueChange={setFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unresolved">Unresolved</SelectItem><SelectItem value="ambiguous">Ambiguous</SelectItem><SelectItem value="all">All issues</SelectItem></SelectContent></Select><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search constituency, member, or source ID" /></div>
        <div className="overflow-x-auto rounded-md border"><table className="w-full text-sm"><thead className="bg-muted/50 text-left"><tr><th className="p-3 font-medium">Source constituency</th><th className="p-3 font-medium">Member</th><th className="p-3 font-medium">Source ID</th><th className="p-3 font-medium">Issue</th></tr></thead><tbody className="divide-y">{issues.slice(0, 500).map((item, index) => <tr key={`${item.mpsno || "member"}-${item.constituency}-${item.issue_type}-${index}`}><td className="p-3 font-medium">{item.constituency || "Missing label"}</td><td className="p-3">{item.name || "—"}</td><td className="p-3 font-mono text-xs">{item.mpsno || "—"}</td><td className="p-3"><Badge variant={item.issue_type === "Ambiguous" ? "destructive" : "secondary"}>{item.issue_type}</Badge></td></tr>)}</tbody></table></div>
        <p className="text-xs text-muted-foreground">Showing {Math.min(issues.length, 500)} of {issues.length} matching assignments.</p>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Report history</CardTitle></CardHeader><CardContent className="space-y-2">{runs.map((run) => <div key={run.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 last:border-0"><div><p className="text-sm font-medium">{formatDate(run.created_at)}</p><p className="text-xs text-muted-foreground">{Number(run.fetched_source_rows || 0).toLocaleString()} fetched · {Number(run.unresolved_assignment_count || 0).toLocaleString()} unresolved · {Number(run.ambiguous_assignment_count || 0).toLocaleString()} ambiguous</p></div><div className="flex items-center gap-2"><Badge variant={run.status === "success" ? "secondary" : "destructive"}>{run.status}</Badge>{run.workflow_run_url && <a href={run.workflow_run_url} target="_blank" rel="noreferrer" aria-label="Open workflow run"><ExternalLink className="h-4 w-4" /></a>}</div></div>)}</CardContent></Card>
    </>}
  </section>;
}
