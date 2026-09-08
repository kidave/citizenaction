import Link from "next/link";
import { ArrowRight, Check, Clock3, X } from "lucide-react";

import { useGovernanceAdmin, useGovernanceContributions } from "@/hooks/governance/useGovernanceAdmin";
import { useAuth } from "@/context/AuthContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function actionLabel(action) {
  return { add: "Add record", edit: "Correct record", move: "Move in hierarchy", delete: "Request removal" }[action] || action;
}

function Status({ status }) {
  if (status === "approved") return <Badge variant="default" className="gap-1"><Check className="h-3.5 w-3.5" />Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive" className="gap-1"><X className="h-3.5 w-3.5" />Rejected</Badge>;
  return <Badge variant="secondary" className="gap-1"><Clock3 className="h-3.5 w-3.5" />Pending</Badge>;
}

export default function AdminGovernanceChanges() {
  const { user, loading: authLoading } = useAuth();
  const { data: adminState, isLoading: adminLoading } = useGovernanceAdmin();
  const { data: contributions = [], isLoading, error } = useGovernanceContributions(null, !!user?.id && !!adminState?.is_admin);
  const breadcrumbItems = [{ label: "Governance" }];

  if (authLoading || adminLoading || isLoading) {
    return (
      <div className="min-h-dvh">
        <AdminPageHeader items={breadcrumbItems} />
        <main className="flex min-h-[60vh] items-center justify-center px-4 text-sm text-muted-foreground">
          Loading governance...
        </main>
      </div>
    );
  }

  if (!user || !adminState?.is_admin) {
    return (
      <div className="min-h-dvh">
        <AdminPageHeader items={breadcrumbItems} />
        <main className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-muted-foreground">
          Administrator access required.
        </main>
      </div>
    );
  }

  const pending = contributions.filter((item) => item.status === "pending");

  return (
    <div className="min-h-dvh">
      <AdminPageHeader items={breadcrumbItems} />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Governance</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review proposed changes to the public governance model.</p>
        </div>

        {error ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-destructive">
              Unable to load governance changes.
            </CardContent>
          </Card>
        ) : pending.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock3 className="mx-auto h-8 w-8 text-muted-foreground" />
              <h2 className="mt-3 font-semibold">No pending changes</h2>
              <p className="mt-1 text-sm text-muted-foreground">The governance queue is clear.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{actionLabel(item.action)}</span>
                      <Status status={item.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm">{item.summary}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.submitter_name} · {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button asChild className="shrink-0">
                    <Link href={`/admin/governance/change/${item.id}`}>
                      Review
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
