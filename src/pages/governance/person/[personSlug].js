import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { GovernanceActionDropdown } from "@/components/governance/GovernanceActionMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import GovernanceAppointmentDeleteButton from "@/components/governance/GovernanceAppointmentDeleteButton";
import GovernancePersonSheet from "@/components/governance/GovernancePersonSheet";
import LoadingState from "@/components/ui/loading-state";
import ErrorState from "@/components/ui/error-state";
import EmptyState from "@/components/ui/empty-state";
import GovernanceAppointmentDialog from "@/components/governance/GovernanceAppointmentDialog";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import GovernanceResourceDialogs from "@/components/governance/GovernanceResourceDialogs";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { supabase } from "@/lib/supabase/client";
import { formatGovernanceDate, getGovernanceInitials } from "@/utils/governance";

function getValue(value) {
  if (Array.isArray(value)) return value[0] || null;
  return typeof value === "string" ? value : null;
}

export default function GovernancePersonPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const personSlug = getValue(router.query.personSlug);
  const { data: profile } = useMyProfile();
  const canManage = profile?.role === "admin";
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [appointmentRecord, setAppointmentRecord] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  const query = useQuery({
    queryKey: ["governance", "person", personSlug],
    enabled: router.isReady && !!personSlug,
    queryFn: async () => {
      const personResult = await supabase.rpc("get_person_by_slug", { p_slug: personSlug });
      if (personResult.error) throw personResult.error;

      const person = personResult.data?.[0] || null;
      if (!person) return null;

      const careerResult = await supabase.rpc("get_person_career", { p_person_id: person.id });
      if (careerResult.error) throw careerResult.error;

      const career = careerResult.data || [];
      const organizationIds = [...new Set(career.map((item) => item.organization_id).filter(Boolean))];
      let organizationLogos = {};

      if (organizationIds.length) {
        const organizationResult = await supabase
          .from("governance")
          .select("id,image_url")
          .in("id", organizationIds);

        if (organizationResult.error) throw organizationResult.error;

        organizationLogos = Object.fromEntries(
          (organizationResult.data || []).map((organization) => [organization.id, organization.image_url]),
        );
      }

      return {
        person,
        career: career.map((item) => ({
          ...item,
          organization_image_url: organizationLogos[item.organization_id] || null,
        })),
      };
    },
  });

  if (query.isLoading) {
    return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance?tab=people" }, { label: "Loading..." }]} backHref="/governance?tab=people" /><main className="flex flex-1"><LoadingState className="w-full" label="Loading person" /></main></div>;
  }

  if (query.error || !query.data) {
    return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance?tab=people" }, { label: "Not found" }]} backHref="/governance?tab=people" /><main className="flex flex-1"><ErrorState className="w-full" title="Person not found" /></main></div>;
  }

  const { person, career } = query.data;
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["governance", "person", personSlug] }),
      queryClient.invalidateQueries({ queryKey: ["governance-directory"] }),
    ]);
  };

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader
        items={[{ label: "Governance", href: "/governance?tab=people" }, { label: "People", href: "/governance?tab=people" }, { label: person.name }]}
        backHref="/governance?tab=people"
        actions={
          canManage ? (
            <GovernanceActionDropdown
              onEdit={() => setEditOpen(true)}
              editLabel="Edit Person"
              onPrimaryAction={() => { setAppointmentRecord(null); setAppointmentOpen(true); }}
              primaryActionLabel="Add Experience"
              onAddAddress={() => setAddressOpen(true)}
              onRemoveAddress={person.address ? async () => { const { error } = await supabase.from("person").update({ address: null }).eq("id", person.id); if (error) { const { toast } = await import("sonner"); toast.error(error.message); return; } await refresh(); } : undefined}
              hasAddress={Boolean(person.address)}
              className="h-8 w-8"
            />
          ) : null
        }
      />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src={person.image_url || undefined} alt={person.name} />
              <AvatarFallback className="rounded-lg text-sm">{getGovernanceInitials(person.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0"><h1 className="text-xl font-semibold">{person.name}</h1>{person.address && <p className="mt-1 text-sm text-muted-foreground">{person.address}</p>}</div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Career</h2>
                <p className="mt-1 text-xs text-muted-foreground">Positions and organizations associated with this person.</p>
              </div>
            </div>

            {career.length ? career.map((item) => (
              <Card key={item.appointment_id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{item.position_name}</div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-6 w-6 rounded-md">
                          <AvatarImage src={item.organization_image_url || undefined} alt="" />
                          <AvatarFallback className="rounded-md text-[10px]">
                            {getGovernanceInitials(item.organization_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 truncate">{item.organization_name}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{formatGovernanceDate(item.started_at)}{item.ended_at ? ` – ${formatGovernanceDate(item.ended_at)}` : " – Present"}</div>
                    </div>
                    {canManage && addressOpen && (
        <GovernanceResourceDialogs
          entity={person}
          entityType="person"
          addressOpen={addressOpen}
          onAddressOpenChange={(value) => { if (!value) setAddressOpen(false); }}
          onSaved={refresh}
        />
      )}

      {canManage && (
                      <GovernanceAppointmentDeleteButton
                        appointmentId={item.appointment_id}
                        personName={person.name}
                        positionName={item.position_name}
                        onEdit={() => { setAppointmentRecord(item); setAppointmentOpen(true); }}
                        onDeleted={refresh}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )) : <EmptyState className="min-h-0 py-8" title="No appointments recorded" />}
          </section>
        </div>
      </main>

      {canManage && (
        <GovernancePersonSheet
          open={editOpen}
          onOpenChange={setEditOpen}
          record={person}
          onSaved={refresh}
        />
      )}

      {canManage && (
        <GovernanceAppointmentDialog
          open={appointmentOpen}
          onOpenChange={setAppointmentOpen}
          mode="person"
          personId={person.id}
          record={appointmentRecord}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
