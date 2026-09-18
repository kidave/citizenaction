import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import GovernanceAppointmentDialog from "@/components/governance/GovernanceAppointmentDialog";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import GovernancePositionTimeline from "@/components/governance/GovernancePositionTimeline";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { usePositionTimeline } from "@/hooks/governance/usePositionTimeline";
import { getGovernanceLabel } from "@/utils/governance";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function getValue(value) {
  if (Array.isArray(value)) return value[0] || null;
  return typeof value === "string" ? value : null;
}

export default function GovernancePositionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const organizationSlug = getValue(router.query.organizationSlug);
  const positionSlug = getValue(router.query.positionSlug);
  const { data: profile } = useMyProfile();
  const canManage = profile?.role === "admin";
  const [appointmentOpen, setAppointmentOpen] = useState(false);

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
        .select("id,name,slug,description,image_url,appointing_organization_id,category_id,metadata")
        .eq("slug", positionSlug)
        .eq("appointing_organization_id", organizationResult.data.id)
        .maybeSingle();
      if (positionResult.error) throw positionResult.error;
      if (!positionResult.data) return null;

      return { organization: organizationResult.data, position: positionResult.data };
    },
  });

  const timelineQuery = usePositionTimeline(positionQuery.data?.position?.id, !!positionQuery.data?.position?.id);

  if (positionQuery.isLoading || timelineQuery.isLoading) {
    return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance?tab=positions" }, { label: "Loading..." }]} backHref="/governance?tab=positions" /><main className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading position...</main></div>;
  }

  if (positionQuery.error || timelineQuery.error || !positionQuery.data) {
    return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance?tab=positions" }, { label: "Not found" }]} backHref="/governance?tab=positions" /><main className="flex flex-1 items-center justify-center text-sm">Governance position not found.</main></div>;
  }

  const { organization, position } = positionQuery.data;
  const timelinePosition = timelineQuery.data?.position || position;

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["position-timeline", position.id] }),
      queryClient.invalidateQueries({ queryKey: ["governance", "position", organizationSlug, positionSlug] }),
      queryClient.invalidateQueries({ queryKey: ["governance-directory"] }),
    ]);
  };

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader
        items={[{ label: "Governance", href: "/governance?tab=positions" }, { label: getGovernanceLabel(organization), href: `/governance/${organization.slug}` }, { label: getGovernanceLabel(position) }]}
        backHref="/governance?tab=positions"
        actions={
          canManage ? (
            <Button type="button" size="sm" onClick={() => setAppointmentOpen(true)}>
              Add person
            </Button>
          ) : null
        }
      />
      <main className="min-h-0 flex-1">
        <GovernancePositionTimeline
          position={timelinePosition}
          organization={organization}
          timeline={timelineQuery.data?.timeline || []}
          canManage={canManage}
          onDeleted={refresh}
        />
      </main>

      {canManage && (
        <GovernanceAppointmentDialog
          open={appointmentOpen}
          onOpenChange={setAppointmentOpen}
          mode="position"
          organizationId={organization.id}
          positionId={position.id}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
