import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import GovernanceCardActions from "@/components/governance/GovernanceCardActions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getGovernanceHref, getGovernanceInitials, getGovernanceLabel, getGovernanceName } from "@/utils/governance";

export default function GovernanceDirectoryCard({
  entity,
  tab = "organizations",
  selectionMode = null,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
}) {
  const label = getGovernanceLabel(entity);
  const name = getGovernanceName(entity);
  const href = getGovernanceHref({ ...entity, tab });
  const avatarUrl =
    entity.image_url ||
    (tab === "organizations" ? entity.current_holder_image_url : null);
  const fallbackLabel = entity.current_holder_name || label;
  const isSelectable = selectionMode === "radio" || selectionMode === "checkbox";
  const canManage = !isSelectable && (onEdit || onDelete);

  const content = (
    <Card className={`relative h-full transition-colors hover:border-primary/40 hover:bg-accent/30 ${selected ? "border-primary ring-2 ring-primary/15" : ""}`}>
      <CardContent className="flex min-h-[104px] flex-col items-center justify-center gap-2 p-3 text-center">
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

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex w-full min-w-0 flex-col items-center gap-1.5">
              <Avatar className="h-11 w-11 rounded-lg">
                <AvatarImage src={avatarUrl || undefined} alt={name} />
                <AvatarFallback className="rounded-lg text-xs">{getGovernanceInitials(name)}</AvatarFallback>
              </Avatar>
              <span className="w-full truncate text-xs font-medium leading-tight">{label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">{name}</TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  );

  if (isSelectable) {
    return (
      <button type="button" onClick={() => onSelect?.(entity)} className="block h-full w-full text-left" aria-label={label} aria-pressed={selected}>
        {content}
      </button>
    );
  }

  const linked = href ? (
    <Link href={href} className="block h-full" aria-label={label}>{content}</Link>
  ) : content;

  return canManage ? (
    <GovernanceCardActions
      onEdit={onEdit}
      onDelete={onDelete}
      deleteTitle={`Delete ${tab === "organizations" ? "organization" : tab === "people" ? "person" : "position"}?`}
      deleteDescription="This action cannot be undone. Related governance history may need to be removed first."
    >
      {linked}
    </GovernanceCardActions>
  ) : (
    linked
  );
}
