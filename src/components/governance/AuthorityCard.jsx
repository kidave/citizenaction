"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function AuthorityCard({ entity, isSelected, onToggle, onOpen }) {
  const label = entity?.short_name || entity?.label || entity?.name || "Governance";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          className={`flex cursor-pointer items-center gap-3 border p-3 ${
            isSelected ? "border-primary bg-primary/5" : "hover:bg-accent"
          }`}
          onClick={() => onOpen?.(entity)}
        >
          <Checkbox
            checked={!!isSelected}
            onCheckedChange={() => onToggle?.(entity)}
            onClick={(event) => event.stopPropagation()}
          />

          <Image
            src={entity?.image_url || "/user1.png"}
            width={32}
            height={32}
            alt=""
            className={
              entity?.entity_type === "person" ? "rounded-full" : "rounded-md"
            }
          />

          <div className="flex-1 truncate text-sm">{label}</div>
        </Card>
      </TooltipTrigger>

      <TooltipContent>{entity?.name || label}</TooltipContent>
    </Tooltip>
  );
}
