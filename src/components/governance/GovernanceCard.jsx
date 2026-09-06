"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getGovernanceLabel } from "@/utils/governance";

function getInitials(value) {
  return (
    value
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "G"
  );
}

function formatType(value) {
  if (!value) return "Governance";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function GovernanceCard({ entity, onOpen }) {
  const label = getGovernanceLabel(entity);
  const type = formatType(entity?.entity_type);

  return (
    <Card
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={() => onOpen?.(entity)}
      onKeyDown={(event) => {
        if (!onOpen) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(entity);
        }
      }}
      className="group cursor-pointer border p-4 transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0 rounded-lg">
          <AvatarImage src={entity?.image_url || undefined} alt="" />
          <AvatarFallback className="rounded-lg text-xs">
            {getInitials(entity?.name || label)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-medium group-hover:underline">{label}</h3>
            <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
              {type}
            </Badge>
          </div>

          {entity?.short_name && entity.short_name !== entity.name && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{entity.short_name}</p>
          )}

          {entity?.parent_name && (
            <p className="mt-2 truncate text-xs text-muted-foreground">
              Part of {entity.parent_name}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
