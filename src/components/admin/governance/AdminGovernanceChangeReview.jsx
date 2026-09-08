import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, X } from "lucide-react";

import { useGovernanceAdmin, useGovernanceContributions } from "@/hooks/governance/useGovernanceAdmin";
import { useReviewGovernanceContribution } from "@/hooks/governance/useReviewGovernanceContribution";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function AdminGovernanceChangeReview({ id }) {
  const { user, loading: authLoading } = useAuth();
  const { data: adminState, isLoading: adminLoading } = useGovernanceAdmin();
  const { data: contributions = [], isLoading } = useGovernanceContributions(null, !!user?.id && !!adminState?.is_admin);
  const { reviewContribution, isReviewing } = useReviewGovernanceContribution();
  const [notes, setNotes] = useState("");

  const change = useMemo(() => contributions.find((item) => String(item.id) === String(id)), [contributions, id]);

  if (authLoading || adminLoading || isLoading) return <main className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Loading governance change...</main>;
  if (!user || !adminState?.is_admin) return <main className="mx-auto min-h-dvh max-w-4xl px-4 py-10 text-center text-sm text-muted-foreground">Administrator access required.</main>;
  if (!change) return <main className="mx-auto min-h-dvh max-w-4xl px-4 py-10 text-center"><h1 className="text-xl font-semibold">Governance change not found</h1><Button asChild variant="outline" className="mt-4"><Link href="/admin/governance"><ArrowLeft className="mr-2 h-4 w-4" />Back to governance</Link></Button></main>;

  async function review(status) {
    await reviewContribution({ contributionId: change.id, status, reviewNotes: notes.trim() || null });
  }

  return <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
    <Button variant="ghost" asChild className="mb-4 -ml-3"><Link href="/admin/governance"><ArrowLeft className="mr-2 h-4 w-4" />Governance</Link></Button>
    <Card>
      <CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge variant="secondary">{change.action}</Badge><CardTitle className="mt-2">{change.proposed_changes?.name || change.summary}</CardTitle><p className="mt-1 text-sm text-muted-foreground">Submitted by {change.submitter_name}</p></div><Badge variant={change.status === "rejected" ? "destructive" : change.status === "approved" ? "default" : "outline"}>{change.status}</Badge></div></CardHeader>
      <CardContent className="space-y-6">
        <section><h2 className="font-medium">Contributor summary</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{change.summary}</p></section>
        <Separator />
        <section><h2 className="font-medium">Proposed data</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{Object.entries(change.proposed_changes || {}).filter(([key]) => key !== "geom_geojson").map(([key, value]) => <div key={key} className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">{key}</div><div className="mt-1 break-words text-sm">{typeof value === "string" ? value : JSON.stringify(value)}</div></div>)}</div></section>
        {change.proposed_changes?.geom_geojson && <section><h2 className="font-medium">Boundary</h2><pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs">{change.proposed_changes.geom_geojson}</pre></section>}
        {(change.source_url || change.source_notes) && <><Separator /><section><h2 className="font-medium">Evidence</h2>{change.source_url && <a href={change.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm font-medium hover:underline">Open source <ExternalLink className="ml-1 h-3.5 w-3.5" /></a>}{change.source_notes && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{change.source_notes}</p>}</section></>}
        {change.status === "pending" && <><Separator /><section className="space-y-3"><h2 className="font-medium">Review decision</h2><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional review note..." rows={5} /><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" disabled={isReviewing} onClick={() => review("rejected")}><X className="mr-2 h-4 w-4" />Reject</Button><Button disabled={isReviewing} onClick={() => review("approved")}><Check className="mr-2 h-4 w-4" />Approve change</Button></div></section></>}
      </CardContent>
    </Card>
  </main>;
}
