import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import GovernancePersonCareer from "@/components/governance/GovernancePersonCareer";
import { usePersonCareer } from "@/hooks/governance/usePersonCareer";
import { supabase } from "@/lib/supabase/client";
import { getGovernanceLabel } from "@/utils/governance";

function getSlug(value) {
  if (Array.isArray(value)) return value[0] || null;
  return typeof value === "string" ? value : null;
}

export default function GovernancePersonPage() {
  const router = useRouter();
  const slug = getSlug(router.query.slug);

  const personQuery = useQuery({
    queryKey: ["governance", "person", slug],
    enabled: router.isReady && !!slug,
    queryFn: async () => {
      const personResult = await supabase
        .from("person")
        .select("id,governance_id,name,slug,image_url,profile_user_id,biography,website")
        .eq("slug", slug)
        .maybeSingle();

      if (personResult.error) throw personResult.error;
      if (!personResult.data) return null;

      const governanceResult = await supabase
        .from("governance")
        .select("id,name,short_name,slug,entity_type,image_url,description,status,valid_from,valid_to,profile_user_id")
        .eq("id", personResult.data.governance_id)
        .eq("entity_type", "person")
        .maybeSingle();

      if (governanceResult.error) throw governanceResult.error;
      if (!governanceResult.data) return null;

      return {
        person: { ...personResult.data, image_url: personResult.data.image_url || governanceResult.data.image_url },
        governance: governanceResult.data,
      };
    },
  });

  const careerQuery = usePersonCareer(
    personQuery.data?.governance?.id,
    !!personQuery.data?.governance?.id,
  );

  if (personQuery.isLoading || careerQuery.isLoading) {
    return (
      <div className="flex min-h-dvh w-full flex-col">
        <GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: "People", href: "/governance" }, { label: "Loading..." }]} />
        <main className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading person...</main>
      </div>
    );
  }

  if (personQuery.error || careerQuery.error || !personQuery.data) {
    return (
      <div className="flex min-h-dvh w-full flex-col">
        <GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: "People", href: "/governance" }, { label: "Not found" }]} />
        <main className="flex flex-1 items-center justify-center text-sm">Governance person not found.</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader
        items={[
          { label: "Governance", href: "/governance" },
          { label: "People", href: "/governance" },
          { label: getGovernanceLabel(personQuery.data.governance) },
        ]}
      />
      <main className="min-h-0 flex-1">
        <GovernancePersonCareer
          person={personQuery.data.person}
          career={careerQuery.data?.career || []}
        />
      </main>
    </div>
  );
}
