"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function AuthorityCard({
  entity,
  isSelected,
  onToggle,
  onOpen,
}) {
  return (
    <Tooltip>

      <TooltipTrigger asChild>
        <Card
          className={`p-3 flex items-center gap-3 cursor-pointer border ${
            isSelected
              ? "border-primary bg-primary/5"
              : "hover:bg-accent"
          }`}
          onClick={() => onOpen(entity)}
        >

          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle(entity)}
            onClick={(e) => e.stopPropagation()}
          />

          <Image
            src={entity.image_url || "/user1.png"}
            width={32}
            height={32}
            alt=""
            className={
              entity.entity_type === "person"
                ? "rounded-full"
                : "rounded-md"
            }
          />

          <div className="flex-1 text-sm truncate">
            {entity.short_name || entity.label}
          </div>

        </Card>
      </TooltipTrigger>

      <TooltipContent>
        {entity.label}
      </TooltipContent>

    </Tooltip>
  );
}