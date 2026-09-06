import { useRouter } from "next/router";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, GitBranch, Map } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { getGovernanceHref, getGovernanceLabel } from "@/utils/governance";

function getPathSegments(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.split("/").filter(Boolean);
  return [];
}

function useGovernanceRecord(slug, enabled) {
  return useQuery({
    queryKey: ["governance", slug],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_governance_by_slug", {
        p_slug: slug,
      });
      if (error) throw error;
      return data?.[0] || null;
    },
  });
}

export default function GovernanceRecordPage() {
  const router = useRouter();
  const segments = getPathSegments(router.query.path);
  const slug = segments[segments.length - 1] || null;

  const { data: governance, isLoading, error } = useGovernanceRecord(slug, !!slug);

  if (isLoading) {
    return (
      <main className="mx-auto min-h-dvh max-w-5xl px-4 py-10 text-sm text-muted-foreground">
        Loading governance...
      </main>
    );
  }

  if (error || !governance) {
    return (
      <main className="mx-auto min-h-dvh max-w-5xl px-4 py-10">
        <Button variant="ghost" asChild>
          <Link href="/governance">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Governance
          </Link>
        </Button>
        <h1 className="mt-6 text-2xl font-semibold">Governance record not found</h1>
      </main>
    );
  }

  const hierarchyHref = governance.parent_slug
    ? getGovernanceHref({ slug: governance.parent_slug, path: null })
    : null;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Button variant="ghost" asChild>
        <Link href="/governance">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Governance
        </Link>
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20 rounded-xl">
              <AvatarImage src={governance.image_url || undefined} />
              <AvatarFallback className="rounded-xl text-xl">
                {governance.name?.charAt(0)?.toUpperCase() || "G"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {governance.entity_type}
              </div>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">{governance.name}</h1>
              {governance.short_name && governance.short_name !== governance.name && (
                <p className="mt-1 text-sm text-muted-foreground">{governance.short_name}</p>
              )}
              {governance.description && (
                <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {governance.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {governance.path && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitBranch className="h-4 w-4" />
              Governance path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={governance.path} className="break-all text-sm font-medium hover:underline">
              {governance.path}
            </Link>
          </CardContent>
        </Card>
      )}

      {governance.parent_id && governance.parent_slug && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitBranch className="h-4 w-4" />
              Parent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={hierarchyHref || `/governance/${governance.parent_slug}`} className="text-sm font-medium hover:underline">
              {getGovernanceLabel({ name: governance.parent_name })}
            </Link>
          </CardContent>
        </Card>
      )}

      {governance.geom && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Map className="h-4 w-4" />
              Boundary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This governance unit has a geographic boundary stored in PostGIS.
            </p>
          </CardContent>
        </Card>
      )}

      {governance.website && (
        <Card>
          <CardContent className="p-5">
            <a href={governance.website} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium hover:underline">
              Official website <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
