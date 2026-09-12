import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import GovernancePositionTimeline from "@/components/governance/GovernancePositionTimeline";
import { usePositionTimeline } from "@/hooks/governance/usePositionTimeline";
import { supabase } from "@/lib/supabase/client";
import { getGovernanceLabel } from "@/utils/governance";

function getValue(value) {
  if (Array.isArray(value)) return value[0] || null;
  return typeof value === "string" ? value : null;
}

export default function GovernancePositionPage() {
  const router = useRouter();
  const organizationSlug = getValue(router.query.organizationSlug);
  const positionSlug = getValue(router.query.positionSlug);

  const positionQuery = useQuery({
    queryKey: ["governance", "position", organizationSlug, positionSlug],
    enabled: router.isReady && !!organizationSlug && !!positionSlug,
    queryFn: async () => {
      const organizationResult = await supabase
        .from("governance")
        .select("id,name,short_name,slug,type")
        .eq("slug", organizationSlug)
        .maybeSingle();

      if (organizationResult.error) throw organizationResult.error;
      if (!organizationResult.data) return null;

      const positionResult = await supabase
        .from("position")
        .select("id,governance_id,name,slug,description,image_url,appointing_governance_id")
        .eq("slug", positionSlug)
        .maybeSingle();

      if (positionResult.error) throw positionResult.error;
      if (!positionResult.data) return null;

      const appointmentResult = await supabase
        .from("position_appointment")
        .select("id,organization_governance_id,started_at,ended_at,is_primary")
        .eq("position_id", positionResult.data.id)
        .eq("organization_governance_id", organizationResult.data.id)
        .order("is_primary", { ascending: false })
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (appointmentResult.error) throw appointmentResult.error;
      if (!appointmentResult.data) return null;

      const governanceResult = await supabase
        .from("governance")
        .select("id,name,short_name,slug,type,image_url,description,status,valid_from,valid_to")
        .eq("id", positionResult.data.governance_id)
        .maybeSingle();

      if (governanceResult.error) throw governanceResult.error;
      if (!governanceResult.data) return null;

      return {
        organization: organizationResult.data,
        position: { ...positionResult.data, ...governanceResult.data },
      };
    },
  });

  const timelineQuery = usePositionTimeline(positionQuery.data?.position?.governance_id, !!positionQuery.data?.position?.governance_id);

  if (positionQuery.isLoading || timelineQuery.isLoading) {
    return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: "Loading..." }]} /><main className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading position...</main></div>;
  }

  if (positionQuery.error || timelineQuery.error || !positionQuery.data) {
    return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: "Not found" }]} /><main className="flex flex-1 items-center justify-center text-sm">Governance position not found.</main></div>;
  }

  const { organization, position } = positionQuery.data;

  return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: getGovernanceLabel(organization), href: `/governance/${organization.slug}` }, { label: getGovernanceLabel(position) }]} /><main className="min-h-0 flex-1"><GovernancePositionTimeline position={timelineQuery.data?.position || position} timeline={timelineQuery.data?.timeline || []} /></main></div>;
}
