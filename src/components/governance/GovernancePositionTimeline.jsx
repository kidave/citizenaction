import { CalendarDays, BriefcaseBusiness } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatGovernanceDate, getGovernanceInitials } from "@/utils/governance";

export default function GovernancePositionTimeline({ position, timeline = [] }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Position</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{position?.name || "Position"}</h1>
        {position?.appointing_governance_name && (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <BriefcaseBusiness className="h-4 w-4" />
            {position.appointing_governance_name}
          </p>
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
                    <AvatarImage src={item.person_image_url || undefined} alt="" />
                    <AvatarFallback>{getGovernanceInitials(personName)}</AvatarFallback>
                  </Avatar>
                </div>
                <Card>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{personName}</p>
                        {item.organization_name && <p className="mt-1 text-xs text-muted-foreground">{item.organization_name}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>
                          {formatGovernanceDate(item.started_at)}
                          {item.ended_at ? ` – ${formatGovernanceDate(item.ended_at)}` : " – Present"}
                        </span>
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
