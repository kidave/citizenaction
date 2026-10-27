import { useState } from "react";
import Link from "next/link";
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
      const positionIds = [...new Set(career.map((item) => item.position_id).filter(Boolean))];
      const [organizationResult, positionResult] = await Promise.all([
        organizationIds.length
          ? supabase.from("governance").select("id,image_url,slug").in("id", organizationIds)
          : Promise.resolve({ data: [], error: null }),
        positionIds.length
          ? supabase.from("position").select("id,slug,appointing_organization_id").in("id", positionIds)
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (organizationResult.error) throw organizationResult.error;
      if (positionResult.error) throw positionResult.error;
      const organizationsById = new Map((organizationResult.data || []).map((organization) => [organization.id, organization]));
      const positionsById = new Map((positionResult.data || []).map((position) => [position.id, position]));
      return {
        person,
        career: career.map((item) => {
          const organization = organizationsById.get(item.organization_id);
          const position = positionsById.get(item.position_id);
          return {
            ...item,
            organization_image_url: organization?.image_url || null,
            organization_slug: organization?.slug || null,
            position_slug: position?.slug || null,
            position_organization_slug: organizationsById.get(position?.appointing_organization_id)?.slug || organization?.slug || null,
          };
        }),
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
          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-28">
              <AvatarImage src={person.image_url || undefined} alt={person.name} />
              <AvatarFallback className="rounded-xl text-2xl">{getGovernanceInitials(person.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 pt-1">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{person.name}</h1>
              {person.address && <p className="mt-1 text-sm text-muted-foreground">{person.address}</p>}
              {(person.official_phone || person.official_email || person.metadata?.official_phone || person.metadata?.official_email) && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {(person.official_phone || person.metadata?.official_phone) && <a className="hover:underline" href={"tel:" + (person.official_phone || person.metadata.official_phone)}>{person.official_phone || person.metadata.official_phone}</a>}
                  {(person.official_email || person.metadata?.official_email) && <a className="hover:underline" href={"mailto:" + (person.official_email || person.metadata.official_email)}>{person.official_email || person.metadata.official_email}</a>}
                </div>
              )}
              {(person.hometown || person.education || person.metadata?.hometown || person.metadata?.education) && (
                <dl className="mt-3 grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2">
                  {(person.hometown || person.metadata?.hometown) && <div><dt className="text-xs text-muted-foreground">Hometown</dt><dd className="mt-0.5">{person.hometown || person.metadata.hometown}</dd></div>}
                  {(person.education || person.metadata?.education) && <div><dt className="text-xs text-muted-foreground">Education</dt><dd className="mt-0.5">{person.education || person.metadata.education}</dd></div>}
                </dl>
              )}
              {person.biography && <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-muted-foreground">{person.biography}</p>}
            </div>
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
                  <div className="flex items-stretch gap-4 sm:gap-5">
                    <div className="flex w-16 shrink-0 items-center sm:w-20">
                      {item.organization_image_url ? (
                        <Link href={item.organization_slug ? `/governance/${item.organization_slug}` : "/governance"} aria-label={item.organization_name || "Organization"} className="flex min-h-20 w-full items-center justify-center rounded-md">
                          <Avatar className="h-20 w-16 rounded-md sm:h-24 sm:w-20">
                            <AvatarImage src={item.organization_image_url} alt={item.organization_name || ""} className="object-contain" />
                            <AvatarFallback className="rounded-md text-xs">{getGovernanceInitials(item.organization_name)}</AvatarFallback>
                          </Avatar>
                        </Link>
                      ) : (
                        <div className="flex min-h-20 w-full items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground">{getGovernanceInitials(item.organization_name)}</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="text-sm font-semibold">{item.position_slug && item.position_organization_slug ? <Link href={`/governance/${item.position_organization_slug}/${item.position_slug}`} className="hover:underline">{item.position_name}</Link> : item.position_name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {item.organization_slug ? <Link href={`/governance/${item.organization_slug}`} className="hover:underline">{item.organization_name}</Link> : item.organization_name}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{formatGovernanceDate(item.started_at)}{item.ended_at ? ` – ${formatGovernanceDate(item.ended_at)}` : " – Present"}</div>
                    </div>
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
