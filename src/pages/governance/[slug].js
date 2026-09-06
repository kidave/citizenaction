import { useRouter } from "next/router";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, GitBranch, Pencil } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { useGovernanceContribution } from "@/hooks/governance/useGovernanceContribution";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

function useGovernanceEntity(slug, enabled) {
  return useQuery({
    queryKey: ["governance-entity", slug],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_governance_entity_by_slug", {
        p_slug: slug,
      });
      if (error) throw error;
      return data?.[0] || null;
    },
  });
}

export default function GovernanceEntityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const slug = typeof router.query.slug === "string" ? router.query.slug : null;

  const { data: entity, isLoading, error } = useGovernanceEntity(slug, !!slug);
  const { submitContribution, isSubmitting } = useGovernanceContribution();

  const suggestCorrection = async () => {
    if (!user) {
      toast.error("Sign in to suggest a correction");
      return;
    }

    await submitContribution({
      summary: `Review ${entity.name}`,
      action: "edit",
      proposedEntityId: entity.id,
      proposedChanges: {},
    });
  };

  if (isLoading) {
    return <main className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted-foreground">Loading governance entity...</main>;
  }

  if (error || !entity) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Button variant="ghost" asChild>
          <Link href="/governance"><ArrowLeft className="mr-2 h-4 w-4" />Back to Governance</Link>
        </Button>
        <h1 className="mt-6 text-2xl font-semibold">Governance entity not found</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" asChild>
          <Link href="/governance"><ArrowLeft className="mr-2 h-4 w-4" />Governance</Link>
        </Button>
        <Button variant="outline" onClick={suggestCorrection} disabled={isSubmitting}>
          <Pencil className="mr-2 h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Suggest correction"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20 rounded-xl">
              <AvatarImage src={entity.image_url || undefined} />
              <AvatarFallback className="rounded-xl text-xl">
                {entity.name?.charAt(0)?.toUpperCase() || "G"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {entity.entity_type}
              </div>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">{entity.name}</h1>
              {entity.short_name && entity.short_name !== entity.name && (
                <p className="mt-1 text-sm text-muted-foreground">{entity.short_name}</p>
              )}
              {entity.description && <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{entity.description}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {entity.parent_id && entity.parent_slug && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><GitBranch className="h-4 w-4" />Hierarchy</CardTitle></CardHeader>
          <CardContent>
            <Link href={`/governance/${entity.parent_slug}`} className="text-sm font-medium hover:underline">
              {entity.parent_name}
            </Link>
          </CardContent>
        </Card>
      )}

      {entity.website && (
        <Card>
          <CardContent className="p-5">
            <a href={entity.website} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium hover:underline">
              Official website <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>
      )}

      <div className="rounded-xl border bg-muted/20 p-5 text-sm text-muted-foreground">
        This governance record is community-maintained. Corrections and additions are reviewed before becoming canonical data.
      </div>
    </main>
  );
}
