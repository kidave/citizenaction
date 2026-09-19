import { useState } from "react";
import { CalendarDays } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import GovernanceAppointmentDeleteButton from "@/components/governance/GovernanceAppointmentDeleteButton";
import GovernanceAppointmentDialog from "@/components/governance/GovernanceAppointmentDialog";
import { formatGovernanceDate, getGovernanceInitials, getGovernanceLabel } from "@/utils/governance";

export default function GovernancePositionTimeline({ position, organization, timeline = [], canManage = false, onDeleted }) {
  const [editingAppointment, setEditingAppointment] = useState(null);
  const organizationLabel = getGovernanceLabel(organization);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Position</p>
        <h1 className="mt-1 flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold tracking-tight">
          <span>{position?.name || "Position"}</span>
          {organizationLabel && (
            <span className="text-base font-normal text-muted-foreground">· {organizationLabel}</span>
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
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No occupant history has been recorded yet.</div>
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
                      <p className="min-w-0 text-sm font-semibold">{personName}</p>
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
                            onEdit={() => setEditingAppointment(item)}
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

      {canManage && (
        <GovernanceAppointmentDialog
          open={!!editingAppointment}
          onOpenChange={(open) => {
            if (!open) setEditingAppointment(null);
          }}
          mode="position"
          organizationId={organization?.id}
          positionId={position?.id}
          personId={editingAppointment?.person_id}
          appointment={editingAppointment}
          onSaved={async () => {
            setEditingAppointment(null);
            await onDeleted?.();
          }}
        />
      )}
    </>
  );
}
