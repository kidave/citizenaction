import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getGovernanceLabel, getGovernanceInitials } from "@/utils/governance";

export default function GovernanceCard({ entity, onOpen, onSuggestEdit }) {
  const label = getGovernanceLabel(entity);
  const category = entity?.category_name || entity?.category?.name || null;
  const isTextOnly = ["ministry", "department", "person"].includes(entity?.entity_type);
  const isClickable = typeof onOpen === "function";
  const imageUrl = entity?.image_url || entity?.metadata?.image_url || null;

  const handleOpen = () => isClickable && onOpen(entity);

  if (isTextOnly) {
    return <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50">
      <button type="button" onClick={handleOpen} className="min-w-0 text-left">
        <span className="font-medium">{label}</span>
        {category && <span className="ml-2 text-xs text-muted-foreground">{category}</span>}
      </button>
      {typeof onSuggestEdit === "function" && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onSuggestEdit(entity)} title="Suggest an edit"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Suggest an edit for {label}</span></Button>}
    </div>;
  }

  return <Card
    role={isClickable ? "link" : undefined}
    tabIndex={isClickable ? 0 : undefined}
    onClick={handleOpen}
    onKeyDown={(event) => {
      if (isClickable && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        handleOpen();
      }
    }}
    className={`group border p-4 transition-colors ${isClickable ? "cursor-pointer hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring" : ""}`}
  >
    <div className="flex items-start gap-3">
      <Avatar className="h-10 w-10 shrink-0 rounded-lg"><AvatarImage src={imageUrl || undefined} alt="" /><AvatarFallback className="rounded-lg text-xs">{getGovernanceInitials(label)}</AvatarFallback></Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2"><h3 className="truncate font-medium group-hover:underline" title={label}>{label}</h3>{typeof onSuggestEdit === "function" && <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100" onClick={(event) => { event.stopPropagation(); onSuggestEdit(entity); }} title="Suggest an edit"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Suggest an edit for {label}</span></Button>}</div>
        {category && <p className="mt-0.5 truncate text-xs text-muted-foreground" title={category}>{category}</p>}
        {entity?.parent_name && <p className="mt-2 truncate text-xs text-muted-foreground" title={entity.parent_name}>Part of {entity.parent_name}</p>}
      </div>
    </div>
  </Card>;
}
