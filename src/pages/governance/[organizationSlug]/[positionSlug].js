import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import GovernancePositionTimeline from "@/components/governance/GovernancePositionTimeline";
import { usePositionTimeline } from "@/hooks/governance/usePositionTimeline";
import { getGovernanceLabel } from "@/utils/governance";
import { supabase } from "@/lib/supabase/client";

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
        .select("id,name,slug,description,image_url,appointing_organization_id,category_id")
        .eq("slug", positionSlug)
        .eq("appointing_organization_id", organizationResult.data.id)
        .maybeSingle();
      if (positionResult.error) throw positionResult.error;
      if (!positionResult.data) return null;

      const appointmentResult = await supabase
        .from("position_appointment")
        .select("id,organization_id,started_at,ended_at,is_primary")
        .eq("position_id", positionResult.data.id)
        .eq("organization_id", organizationResult.data.id)
        .order("is_primary", { ascending: false })
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (appointmentResult.error) throw appointmentResult.error;

      return { organization: organizationResult.data, position: positionResult.data };
    },
  });

  const timelineQuery = usePositionTimeline(positionQuery.data?.position?.id, !!positionQuery.data?.position?.id);

  if (positionQuery.isLoading || timelineQuery.isLoading) {
    return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: "Loading..." }]} /><main className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading position...</main></div>;
  }

  if (positionQuery.error || timelineQuery.error || !positionQuery.data) {
    return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: "Not found" }]} /><main className="flex flex-1 items-center justify-center text-sm">Governance position not found.</main></div>;
  }

  const { organization, position } = positionQuery.data;
  const timelinePosition = timelineQuery.data?.position || position;

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: getGovernanceLabel(organization), href: `/governance/${organization.slug}` }, { label: getGovernanceLabel(position) }]} />
      <main className="min-h-0 flex-1">
        <GovernancePositionTimeline position={timelinePosition} organization={organization} timeline={timelineQuery.data?.timeline || []} />
      </main>
    </div>
  );
}
