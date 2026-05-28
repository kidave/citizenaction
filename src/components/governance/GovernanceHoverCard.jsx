"use client";

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Card } from "@/components/ui/card";
import { Row } from "@/components/layout/Row";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export function GovernanceHoverCard({ entity, children }) {
  if (!entity) return children;

  return (
    <HoverCard openDelay={200} closeDelay={150}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>

      <HoverCardContent sideOffset={4} align="start" className="w-72 p-0">
        <Card className="space-y-3 border-none p-4 shadow-xl">
          <Row className="gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={entity.image_url} />
              <AvatarFallback>{entity.label?.charAt(0) || "G"}</AvatarFallback>
            </Avatar>

            <div>
              <div className="text-sm font-semibold">{entity.label}</div>
            </div>
          </Row>

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
