import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import GovernanceCardActions from "@/components/governance/GovernanceCardActions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getGovernanceHref, getGovernanceInitials, getGovernanceLabel } from "@/utils/governance";

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
  const href = getGovernanceHref({ ...entity, tab });
  const avatarUrl =
    entity.image_url ||
    (tab === "organizations" ? entity.current_holder_image_url : null);
  const fallbackLabel = entity.current_holder_name || label;
  const isSelectable = selectionMode === "radio" || selectionMode === "checkbox";
  const canManage = !isSelectable && (onEdit || onDelete);

  const content = (
    <Card className={`h-full transition-colors hover:border-primary/40 hover:bg-accent/30 ${selected ? "border-primary ring-2 ring-primary/15" : ""}`}>
      <CardContent className="flex min-h-[72px] items-center gap-3 p-3 sm:min-h-[76px]">
        {isSelectable && (
          <span className="grid h-5 w-5 shrink-0 place-items-center text-muted-foreground" aria-hidden="true">
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
            <div className="flex shrink-0 flex-col items-center">
              <Avatar className="h-10 w-10 rounded-lg sm:h-11 sm:w-11">
                <AvatarImage src={avatarUrl || undefined} alt={avatarUrl ? fallbackLabel : ""} />
                <AvatarFallback className="rounded-lg text-xs">{getGovernanceInitials(fallbackLabel)}</AvatarFallback>
              </Avatar>
              <span className="mt-1.5 max-w-[10rem] truncate text-center text-[11px] leading-tight text-muted-foreground sm:hidden">
                {label}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">{label}</TooltipContent>
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
