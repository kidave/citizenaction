"use client";

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export function GovernanceHoverCard({ entity, children }) {
  if (!entity) return children;

  return (
    <HoverCard openDelay={200} closeDelay={150}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>

      <HoverCardContent
        sideOffset={4}
        align="start"
        className="w-72 p-0"
      >
        <Card className="p-4 space-y-3 border-none shadow-xl">

          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={entity.image_url} />
              <AvatarFallback>
                {entity.label?.charAt(0) || "G"}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="font-semibold text-sm">
                {entity.label}
              </div>

              <div className="text-xs text-muted-foreground">
                {entity.entity_type.toUpperCase()}
              </div>
            </div>
          </div>

          <Link
            href={`/governance/${entity.entity_type}/${entity.id}`}
            className="text-xs text-primary hover:underline"
          >
            View full profile
          </Link>

        </Card>
      </HoverCardContent>
    </HoverCard>
  );
}