import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  getGovernanceInitials,
  getGovernanceLabel,
  getGovernanceTypeLabel,
} from "@/utils/governance";

const TEXT_ENTITY_TYPES = new Set(["ministry", "department", "person"]);

export default function GovernanceCard({ entity, onOpen, onSuggestEdit }) {
  const label = getGovernanceLabel(entity);
  const type = getGovernanceTypeLabel(entity);
  const isTextOnly = TEXT_ENTITY_TYPES.has(entity?.entity_type);
  const isClickable = typeof onOpen === "function";
  const imageUrl = entity?.image_url || entity?.metadata?.image_url || null;

  const handleOpen = () => {
    if (isClickable) onOpen(entity);
  };

  if (isTextOnly) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50">
        <button type="button" onClick={handleOpen} className="min-w-0 text-left">
          <span className="font-medium">{label}</span>
          <span className="ml-2 text-xs text-muted-foreground">{type}</span>
        </button>
        {typeof onSuggestEdit === "function" && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onSuggestEdit(entity)} title="Suggest an edit">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Suggest an edit for {label}</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (!isClickable) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
      className={`group border p-4 transition-colors ${isClickable ? "cursor-pointer hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring" : ""}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0 rounded-lg">
          <AvatarImage src={imageUrl || undefined} alt="" />
          <AvatarFallback className="rounded-lg bg-muted">{getGovernanceInitials(entity?.name || label)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-medium group-hover:underline">{label}</h3>
            <Badge variant="outline" className="shrink-0 text-[10px] font-normal">{type}</Badge>
          </div>
          {entity?.short_name && entity.short_name !== entity.name && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{entity.short_name}</p>
          )}
          {entity?.parent_name && (
            <p className="mt-2 truncate text-xs text-muted-foreground">Part of {entity.parent_name}</p>
          )}
        </div>
        {typeof onSuggestEdit === "function" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
            onClick={(event) => {
              event.stopPropagation();
              onSuggestEdit(entity);
            }}
            title="Suggest an edit"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Suggest an edit for {label}</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
