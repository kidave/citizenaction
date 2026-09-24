import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GovernanceCardActions from "@/components/governance/GovernanceCardActions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getGovernanceHref, getGovernanceInitials, getGovernanceLabel, getGovernanceName } from "@/utils/governance";

export default function GovernanceDirectoryCard({ entity, tab = "organizations", selectionMode = null, selected = false, onSelect, onEdit, onDelete }) {
  const label = getGovernanceLabel(entity);
  const name = getGovernanceName(entity);
  const href = getGovernanceHref({ ...entity, tab });
  const avatarUrl = entity.image_url || (tab === "organizations" ? entity.current_holder_image_url : null);
  const isSelectable = selectionMode === "radio" || selectionMode === "checkbox";
  const canManage = !isSelectable && (onEdit || onDelete);

  const content = (
    <div className={`relative flex min-h-[76px] h-full items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-accent/50 ${selected ? "bg-primary/5" : ""}`}>
      {isSelectable && (
        <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center text-muted-foreground" aria-hidden="true">
          {selectionMode === "radio" ? (
            <Circle className={`h-4 w-4 ${selected ? "fill-primary stroke-primary" : ""}`} />
          ) : (
            <span className={`grid h-4 w-4 place-items-center rounded-sm border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50"}`}>
              {selected && <Check className="h-3 w-3" />}
            </span>
          )}
        </span>
      )}
      <Avatar className="h-9 w-9 shrink-0 rounded-md">
        <AvatarImage src={avatarUrl || undefined} alt={name} />
        <AvatarFallback className="rounded-md text-[11px]">{getGovernanceInitials(name)}</AvatarFallback>
      </Avatar>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="min-w-0 flex-1 pr-5">
            <div className="truncate text-sm font-medium leading-tight">{label}</div>
            {name !== label && <div className="mt-0.5 truncate text-xs leading-tight text-muted-foreground">{name}</div>}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">{name}</TooltipContent>
      </Tooltip>
    </div>
  );

  if (isSelectable) {
    return <button type="button" onClick={() => onSelect?.(entity)} className="block h-full w-full text-left" aria-label={label} aria-pressed={selected}>{content}</button>;
  }

  const linked = href ? <Link href={href} className="block h-full" aria-label={label}>{content}</Link> : content;
  return canManage ? (
    <GovernanceCardActions
      onEdit={onEdit}
      onDelete={onDelete}
      deleteTitle={`Delete ${tab === "organizations" ? "organization" : tab === "people" ? "person" : "position"}?`}
      deleteDescription="This action cannot be undone. Related governance history may need to be removed first."
    >
      {linked}
    </GovernanceCardActions>
  ) : linked;
}