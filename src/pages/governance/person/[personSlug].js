import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import GovernanceAppointmentDeleteButton from "@/components/governance/GovernanceAppointmentDeleteButton";
import GovernanceAppointmentDialog from "@/components/governance/GovernanceAppointmentDialog";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
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
  const [editingAppointment, setEditingAppointment] = useState(null);

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

      return { person, career: careerResult.data || [] };
    },
  });

  if (query.isLoading) {
    return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance?tab=people" }, { label: "Loading..." }]} backHref="/governance?tab=people" /><main className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading person...</main></div>;
  }

  if (query.error || !query.data) {
    return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance?tab=people" }, { label: "Not found" }]} backHref="/governance?tab=people" /><main className="flex flex-1 items-center justify-center text-sm">Person not found.</main></div>;
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
            <Button type="button" size="sm" onClick={() => setAppointmentOpen(true)}>
              Add current position
            </Button>
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
            <h1 className="text-xl font-semibold">{person.name}</h1>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Career</h2>
                <p className="mt-1 text-xs text-muted-foreground">Positions and organizations associated with this person.</p>
              </div>
              {canManage && (
                <Button type="button" variant="outline" size="sm" onClick={() => setAppointmentOpen(true)}>
                  Add position
                </Button>
              )}
            </div>

            {career.length ? career.map((item) => (
              <Card key={item.appointment_id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{item.position_name}</div>
                      <div className="text-sm text-muted-foreground">{item.organization_name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{formatGovernanceDate(item.started_at)}{item.ended_at ? ` – ${formatGovernanceDate(item.ended_at)}` : " – Present"}</div>
                    </div>
                    {canManage && (
                      <GovernanceAppointmentDeleteButton
                        appointmentId={item.appointment_id}
                        personName={person.name}
                        positionName={item.position_name}
                        onEdit={() => setEditingAppointment(item)}
                        onDeleted={refresh}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )) : <p className="text-sm text-muted-foreground">No appointments recorded.</p>}
          </section>
        </div>
      </main>

      {canManage && (
        <>
          <GovernanceAppointmentDialog
            open={appointmentOpen}
            onOpenChange={setAppointmentOpen}
            mode="person"
            personId={person.id}
            onSaved={refresh}
          />
          <GovernanceAppointmentDialog
            open={!!editingAppointment}
            onOpenChange={(open) => {
              if (!open) setEditingAppointment(null);
            }}
            mode="person"
            personId={person.id}
            appointment={editingAppointment}
            onSaved={async () => {
              setEditingAppointment(null);
              await refresh();
            }}
          />
        </>
      )}
    </div>
  );
}
