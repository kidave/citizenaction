import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import EmptyState from "@/components/ui/empty-state";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GovernanceAppointmentDeleteButton from "@/components/governance/GovernanceAppointmentDeleteButton";
import { formatGovernanceDate, getGovernanceInitials, getGovernanceLabel } from "@/utils/governance";

export default function GovernancePositionTimeline({ position, organization, timeline = [], canManage = false, onEdit, onDeleted }) {
  const organizationLabel = organization?.name || "";
  const jurisdiction = position?.geographies;
  const links = position?.links || [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Position</p>
        <div className="mt-1 flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 rounded-lg">
            <AvatarImage src={organization?.image_url || undefined} alt="" />
            <AvatarFallback className="rounded-lg text-xs">{getGovernanceInitials(organizationLabel)}</AvatarFallback>
          </Avatar>
          <h1 className="min-w-0 text-2xl font-semibold tracking-tight">
            <span>{position?.name || "Position"}</span>
            {organizationLabel && <span className="ml-2 text-base font-normal text-muted-foreground">· {organizationLabel}</span>}
          </h1>
        </div>
        {(jurisdiction || position?.address || links.length) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
            {jurisdiction && (
              <Badge variant="secondary" className="max-w-full gap-1.5 font-normal">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">Jurisdiction: {jurisdiction.official_name || jurisdiction.name}</span>
              </Badge>
            )}
            {position?.address && (
              <Badge variant="outline" className="max-w-full gap-1.5 font-normal">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">Office: {position.address}</span>
              </Badge>
            )}
            {links.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs hover:bg-muted">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="max-w-[220px] truncate">{link.title || link.url}</span>
              </a>
            ))}
          </div>
        )}

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
                  <Avatar className="h-8 w-8 rounded-full sm:h-9 sm:w-9">
                    <AvatarImage src={item.person_image_url || undefined} alt={personName} />
                    <AvatarFallback>{getGovernanceInitials(personName)}</AvatarFallback>
                  </Avatar>
                </div>
                <Card>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2"><p className="min-w-0 text-sm font-semibold">{personName}</p>{item.is_primary && <Badge variant="secondary" className="shrink-0 text-[10px]">Principal</Badge>}</div>
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
