import { CalendarDays, BriefcaseBusiness } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatGovernanceDate, getGovernanceInitials } from "@/utils/governance";

export default function GovernancePersonCareer({ person, career = [] }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="h-16 w-16 rounded-xl">
          <AvatarImage src={person?.image_url || undefined} alt="" />
          <AvatarFallback className="rounded-xl text-base">{getGovernanceInitials(person?.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Person</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{person?.name || "Person"}</h1>
        </div>
      </div>

      {person?.biography && <p className="mb-8 max-w-3xl text-sm leading-6 text-muted-foreground">{person.biography}</p>}

      <div className="mb-4 flex items-center gap-2">
        <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Career</h2>
      </div>

      {!career.length ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No career history has been recorded yet.</div>
      ) : (
        <div className="relative space-y-4 before:absolute before:bottom-4 before:left-5 before:top-4 before:w-px before:bg-border sm:before:left-6">
          {career.map((item) => (
            <div key={item.appointment_id} className="relative pl-10 sm:pl-14">
              <div className="absolute left-3 top-5 h-3 w-3 rounded-full border-2 border-background bg-foreground sm:left-[19px]" />
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.position_name || "Position"}</p>
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
          ))}
        </div>
      )}
    </div>
  );
}
