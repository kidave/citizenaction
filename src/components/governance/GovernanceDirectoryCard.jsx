import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  getGovernanceHref,
  getGovernanceLabel,
  getGovernanceName,
  getGovernanceInitials,
} from "@/utils/governance";

export default function GovernanceDirectoryCard({ entity }) {
  const label = getGovernanceLabel(entity);
  const name = getGovernanceName(entity);

  return (
    <Link href={getGovernanceHref(entity)} className="block h-full">
      <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/30">
        <CardContent className="flex items-center gap-3 p-3">
          <Avatar className="h-9 w-9 shrink-0 rounded-lg">
            <AvatarImage src={entity.image_url || undefined} alt="" />
            <AvatarFallback className="rounded-lg text-xs">
              {getGovernanceInitials(label)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-medium" title={name}>
              {label}
            </h2>
          </div>

          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
