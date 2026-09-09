import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getGovernanceHref,
  getGovernanceInitials,
  getGovernanceLabel,
  getGovernanceTypeLabel,
} from "@/utils/governance";

export default function GovernanceDirectoryCard({ entity, descendantCount = 0 }) {
  const label = getGovernanceLabel(entity);

  return (
    <Link href={getGovernanceHref(entity)} className="block h-full">
      <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/30">
        <CardContent className="flex h-full items-center gap-4 p-5">
          <Avatar className="h-12 w-12 shrink-0 rounded-xl">
            <AvatarImage src={entity.image_url || undefined} alt="" />
            <AvatarFallback className="rounded-xl">{getGovernanceInitials(label)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-semibold">{label}</h2>
              <Badge variant="secondary" className="shrink-0 text-xs">{getGovernanceTypeLabel(entity)}</Badge>
            </div>
            {entity.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{entity.description}</p>
            )}
            {descendantCount > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {descendantCount} {descendantCount === 1 ? "entity" : "entities"} beneath
              </p>
            )}
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
