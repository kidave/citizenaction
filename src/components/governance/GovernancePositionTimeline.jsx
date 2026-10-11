import { CalendarDays } from "lucide-react";
import EmptyState from "@/components/ui/empty-state";

import { Card, CardContent } from "@/components/ui/card";
import GovernanceAppointmentDeleteButton from "@/components/governance/GovernanceAppointmentDeleteButton";
import { formatGovernanceDate, getGovernanceInitials, getGovernanceLabel } from "@/utils/governance";
import GovernanceEntityLink from "@/components/governance/GovernanceEntityLink";

export default function GovernancePositionTimeline({ position, organization, timeline = [], canManage = false, onEdit, onDeleted }) {
  const organizationLabel = getGovernanceLabel(organization);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Position</p>
        <h1 className="mt-1 flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold tracking-tight">
          <span>{position?.name || "Position"}</span>
          {organizationLabel && (
            <span className="inline-flex items-center gap-2 text-base font-normal text-muted-foreground">
              <span aria-hidden="true">·</span>
              <GovernanceEntityLink
                href={organization?.slug ? `/governance/${organization.slug}?view=organization` : null}
                name={organizationLabel}
                imageUrl={organization?.image_url}
                kind="organization"
                avatarClassName="h-7 w-7"
                nameClassName="max-w-[min(55vw,28rem)]"
                className="text-sm text-muted-foreground"
              />
            </span>
          )}
        </h1>
        {(position?.metadata?.qualifications || position?.metadata?.responsibilities || position?.description) && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {position.description && <div><p className="text-xs font-medium text-muted-foreground">Description</p><p className="mt-1 text-sm leading-6">{position.description}</p></div>}
            {position.metadata?.qualifications && <div><p className="text-xs font-medium text-muted-foreground">Qualifications required</p><p className="mt-1 whitespace-pre-line text-sm leading-6">{position.metadata.qualifications}</p></div>}
            {position.metadata?.responsibilities && <div><p className="text-xs font-medium text-muted-foreground">Roles and responsibilities</p><p className="mt-1 whitespace-pre-line text-sm leading-6">{position.metadata.responsibilities}</p></div>}
          </div>
        )}
      </div>

      {!timeline.length ? (
        <EmptyState className="min-h-0 rounded-xl border border-dashed p-10" title="No occupant history recorded" />
      ) : (
        <div className="relative space-y-4 before:absolute before:bottom-4 before:left-5 before:top-4 before:w-px before:bg-border sm:before:left-6">
          {timeline.map((item) => {
            const personName = item.is_vacant ? "Vacant" : item.person_name || "Unknown";
            return (
              <div key={item.appointment_id} className="relative pl-10 sm:pl-14">
                <div className="absolute left-0 top-3 flex h-10 w-10 items-center justify-center rounded-full border bg-background sm:h-12 sm:w-12">
                  {item.person_slug && !item.is_vacant ? (
                    <GovernanceEntityLink
                      href={`/governance/person/${item.person_slug}`}
                      name={personName}
                      imageUrl={item.person_image_url}
                      kind="person"
                      showAvatar
                      avatarClassName="h-8 w-8 rounded-full sm:h-9 sm:w-9"
                      nameClassName="sr-only"
                      className="rounded-full"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium sm:h-9 sm:w-9">
                      {getGovernanceInitials(personName)}
                    </span>
                  )}
                </div>
                <Card>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      {item.person_slug && !item.is_vacant ? (
                        <GovernanceEntityLink
                          href={`/governance/person/${item.person_slug}`}
                          name={personName}
                          imageUrl={item.person_image_url}
                          kind="person"
                          showAvatar={false}
                          nameClassName="text-sm font-semibold"
                          className="min-w-0"
                        />
                      ) : (
                        <p className="min-w-0 text-sm font-semibold">{personName}</p>
                      )}
                      <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>
                          {formatGovernanceDate(item.started_at)}
                          {item.ended_at ? ` – ${formatGovernanceDate(item.ended_at)}` : " – Present"}
                        </span>
                        {canManage && (
                          <GovernanceAppointmentDeleteButton
                            appointmentId={item.appointment_id}
                            personName={item.is_vacant ? null : personName}
                            positionName={position?.name}
                            onEdit={() => onEdit?.(item)}
                            onDeleted={onDeleted}
                          />
                        )}
                      </div>
                    </div>
                    {item.notes && <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.notes}</p>}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
