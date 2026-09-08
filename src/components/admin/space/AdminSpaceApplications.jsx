import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, XCircle } from "lucide-react";

import { useAdminSpaceApplications } from "@/hooks/admin/useAdminSpaceApplications";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function StatusBadge({ status }) {
  if (status === "approved") return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3.5 w-3.5" />Rejected</Badge>;
  return <Badge variant="secondary" className="gap-1"><Clock3 className="h-3.5 w-3.5" />Pending</Badge>;
}

export default function AdminSpaceApplications() {
  const { data: applications = [], isLoading, error } = useAdminSpaceApplications();
  const breadcrumbItems = [{ label: "Spaces" }];

  if (isLoading) {
    return (
      <div className="min-h-dvh">
        <AdminPageHeader items={breadcrumbItems} />
        <main className="flex min-h-[60vh] items-center justify-center px-4 text-sm text-muted-foreground">
          Loading Space applications...
        </main>
      </div>
    );
  }

  const pending = applications.filter((item) => item.status === "pending");
  const reviewed = applications.filter((item) => item.status !== "pending");

  return (
    <div className="min-h-dvh">
      <AdminPageHeader items={breadcrumbItems} />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Spaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review applications for new Spaces.</p>
        </div>

        {error && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-destructive">
              Unable to load Space applications.
            </CardContent>
          </Card>
        )}

        {!error && (
          <div className="space-y-8">
            <ApplicationSection title="Pending applications" description="Applications waiting for review." applications={pending} />
            <ApplicationSection title="Reviewed applications" description="Previously approved or rejected applications." applications={reviewed} />
          </div>
        )}
      </main>
    </div>
  );
}

function ApplicationSection({ title, description, applications }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline">{applications.length}</Badge>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">No applications here.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{application.proposed_name}</h3>
                    <StatusBadge status={application.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">/{application.proposed_slug}</p>
                  {application.official_category?.name && <p className="text-sm">{application.official_category.name}</p>}
                </div>

                <Button asChild className="shrink-0">
                  <Link href={`/admin/space/application/${application.id}`}>
                    Review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
