import { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, Check, Clock3, ExternalLink, X } from "lucide-react";

import { useGovernanceAdmin, useGovernanceContributions } from "@/hooks/governance/useGovernanceAdmin";
import { useReviewGovernanceContribution } from "@/hooks/governance/useReviewGovernanceContribution";
import { useGovernance } from "@/hooks/governance/useGovernance";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

function prettyAction(action) {
  return { add: "Add record", edit: "Correct record", move: "Move in hierarchy", delete: "Request removal" }[action] || action;
}

function prettyType(type) {
  if (!type) return null;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function AdminGovernancePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data: adminState, isLoading: adminLoading } = useGovernanceAdmin();
  const isAdmin = !!adminState?.is_admin;
  const { data: contributions = [], isLoading, error } = useGovernanceContributions("pending", isAdmin);
  const { reviewContribution, isReviewing } = useReviewGovernanceContribution();
  const [selectedId, setSelectedId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const selected = useMemo(() => contributions.find((item) => item.id === selectedId) || contributions[0] || null, [contributions, selectedId]);

  if (authLoading || adminLoading) {
    return <main className="mx-auto min-h-dvh max-w-5xl px-4 py-10 text-sm text-muted-foreground">Loading governance administration...</main>;
  }

  if (!user || !isAdmin) {
    return <main className="mx-auto min-h-dvh max-w-5xl px-4 py-10"><Card><CardContent className="py-12 text-center"><h1 className="text-xl font-semibold">Administrator access required</h1><p className="mt-2 text-sm text-muted-foreground">This area is available only to administrator accounts.</p></CardContent></Card></main>;
  }

  async function review(status) {
    if (!selected) return;
    await reviewContribution({ contributionId: selected.id, status, reviewNotes: reviewNotes.trim() || null });
    setSelectedId(null);
    setReviewNotes("");
  }

  return (
    <>
      <Head><title>Governance Administration</title></Head>
      <main className="mx-auto min-h-dvh w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Button variant="ghost" asChild className="-ml-3 mb-2"><Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" />Administration</Link></Button>
            <h1 className="text-3xl font-semibold tracking-tight">Governance</h1>
            <p className="mt-1 text-sm text-muted-foreground">Review community suggestions before they change the public governance model.</p>
          </div>
          <Badge variant="secondary" className="shrink-0">{contributions.length} pending</Badge>
        </div>

        {error && <Card><CardContent className="py-6 text-sm text-destructive">Failed to load governance suggestions.</CardContent></Card>}

        {!isLoading && contributions.length === 0 && !error && (
          <Card><CardContent className="py-14 text-center"><Clock3 className="mx-auto h-8 w-8 text-muted-foreground" /><h2 className="mt-3 font-semibold">No pending changes</h2><p className="mt-1 text-sm text-muted-foreground">The governance queue is clear.</p></CardContent></Card>
        )}

        {contributions.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <Card className="overflow-hidden">
              <CardHeader><CardTitle className="text-base">Review queue</CardTitle><CardDescription>Select a contribution to review.</CardDescription></CardHeader>
              <CardContent className="p-0"><div className="divide-y">{contributions.map((item) => (
                <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setReviewNotes(""); }} className={`w-full p-4 text-left transition-colors hover:bg-muted/50 ${selected?.id === item.id ? "bg-muted" : ""}`}>
                  <div className="flex items-center justify-between gap-2"><span className="font-medium">{prettyAction(item.action)}</span><Badge variant="outline">Pending</Badge></div>
                  <div className="mt-1 line-clamp-2 text-sm">{item.summary}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{item.submitter_name} · {new Date(item.created_at).toLocaleString()}</div>
                </button>
              ))}</div></CardContent>
            </Card>

            {selected && (
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><Badge variant="secondary">{prettyAction(selected.action)}</Badge><CardTitle className="mt-2">{selected.proposed_changes?.name || selected.summary}</CardTitle><CardDescription className="mt-1">Submitted by {selected.submitter_name}</CardDescription></div>{selected.proposed_entity_type && <Badge variant="outline">{prettyType(selected.proposed_entity_type)}</Badge>}</div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <section><h3 className="font-medium">What the contributor said</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{selected.summary}</p></section>
                  <Separator />
                  <section className="space-y-3"><h3 className="font-medium">Proposed data</h3><div className="grid gap-3 sm:grid-cols-2">{Object.entries(selected.proposed_changes || {}).filter(([key]) => key !== "geom_geojson").map(([key,value]) => <div key={key} className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">{key}</div><div className="mt-1 break-words text-sm">{typeof value === "string" ? value : JSON.stringify(value)}</div></div>)}</div></section>
                  {selected.proposed_changes?.geom_geojson && <section><h3 className="font-medium">Boundary</h3><p className="mt-1 text-sm text-muted-foreground">A GeoJSON boundary was supplied.</p><pre className="mt-2 max-h-44 overflow-auto rounded-lg bg-muted p-3 text-xs">{selected.proposed_changes.geom_geojson}</pre></section>}
                  {(selected.source_url || selected.source_notes) && <><Separator /><section><h3 className="font-medium">Evidence</h3>{selected.source_url && <a href={selected.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm font-medium hover:underline">Open source <ExternalLink className="ml-1 h-3.5 w-3.5" /></a>}{selected.source_notes && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{selected.source_notes}</p>}</section></>}
                  <Separator />
                  <section className="space-y-3"><h3 className="font-medium">Review decision</h3><Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Optional note for the contributor or audit trail." /><div className="flex flex-wrap justify-end gap-2"><Button variant="outline" disabled={isReviewing} onClick={() => review("rejected")}><X className="mr-2 h-4 w-4" />Reject</Button><Button disabled={isReviewing} onClick={() => review("approved")}><Check className="mr-2 h-4 w-4" />Approve change</Button></div></section>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </>
  );
}
