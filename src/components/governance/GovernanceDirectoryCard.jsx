import { CalendarDays, MapPin, UserRound } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatGovernanceDate, formatGovernanceType, getGovernanceHref, getGovernanceInitials, getGovernanceLabel } from "@/utils/governance";

export default function GovernanceDirectoryCard({ entity, tab = "entities" }) {
  const label = getGovernanceLabel(entity);
  const href = getGovernanceHref(entity);
  const holder = entity.current_holder_name;

  const content = (
    <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/30">
      <CardContent className="flex min-h-[92px] items-start gap-3 p-3">
        <Avatar className="h-10 w-10 shrink-0 rounded-lg"><AvatarImage src={entity.image_url || undefined} alt="" /><AvatarFallback className="rounded-lg text-xs">{getGovernanceInitials(label)}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="min-w-0 truncate text-sm font-medium">{label}</h2>
            {entity.type && <Badge variant="secondary" className="shrink-0 text-[10px] font-normal">{formatGovernanceType(entity.type)}</Badge>}
          </div>
          {tab === "positions" && holder && <div className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><UserRound className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{holder}</span></div>}
          {tab === "positions" && entity.current_holder_started_at && <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"><CalendarDays className="h-3.5 w-3.5 shrink-0" /><span>Since {formatGovernanceDate(entity.current_holder_started_at)}</span></div>}
          {tab === "people" && entity.geography_name && <div className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{entity.geography_name}</span></div>}
          {tab === "entities" && (entity.geography_name || entity.category_name) && <div className="mt-2 flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">{entity.geography_name && <span className="truncate">{entity.geography_name}</span>}{entity.geography_name && entity.category_name && <span>·</span>}{entity.category_name && <span className="truncate">{entity.category_name}</span>}</div>}
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href} className="block h-full" title={label}>{content}</Link> : content;
}
