"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { GovernanceHoverCard } from "./GovernanceHoverCard";

export default function GovernanceAvatarGroups({
  entities = [],
  maxVisible = 5,
}) {
  const [open, setOpen] = useState(false);

  if (!entities || entities.length === 0) return null;

  /* ================= SPLIT TYPES ================= */

  const organizationEntities = entities.filter(
    (e) =>
      e.entity_type === "authority" ||
      e.entity_type === "department"
  );

  const personEntities = entities.filter(
    (e) =>
      e.entity_type === "designation" ||
      e.entity_type === "person"
  );

  /* ================= RENDER GROUP ================= */

  const renderGroup = (group) => {
    if (!group.length) return null;

    const visible = group.slice(0, maxVisible);
    const hiddenCount = group.length - maxVisible;

    return (
      <AvatarGroup>
        {visible.map((entity) => (
          <GovernanceHoverCard key={entity.id} entity={entity}>
            <Avatar
              className="h-7 w-7 hover:z-20 transition-all hover:scale-110"
              onClick={(e) => e.stopPropagation()}
            >
              <AvatarImage src={entity.image_url} />
              <AvatarFallback>
                {entity.label?.charAt(0) || "G"}
              </AvatarFallback>
            </Avatar>
          </GovernanceHoverCard>
        ))}

        {hiddenCount > 0 && (
          <Avatar
            className="h-7 w-7 bg-muted text-xs cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <AvatarFallback>
              +{hiddenCount}
            </AvatarFallback>
          </Avatar>
        )}
      </AvatarGroup>
    );
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {renderGroup(organizationEntities)}
        {renderGroup(personEntities)}
      </div>

      {/* ================= FULL TAG MODAL ================= */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tagged Governance Entities</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {entities.map((entity) => (
              <Card
                key={entity.id}
                className="p-3 flex items-center gap-3"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={entity.image_url} />
                  <AvatarFallback>
                    {entity.label?.charAt(0) || "G"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {entity.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entity.entity_type.toUpperCase()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}