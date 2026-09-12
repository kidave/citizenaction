import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getGovernanceHref, getGovernanceInitials, getGovernanceLabel } from "@/utils/governance";

export default function GovernanceDirectoryCard({ entity, tab = "organizations", selectionMode = null, selected = false, onSelect }) {
  const label = getGovernanceLabel(entity);
  const href = getGovernanceHref({ ...entity, tab });
  const avatarUrl = entity.image_url || (tab === "organizations" ? entity.current_holder_image_url : null);
  const fallbackLabel = entity.current_holder_name || label;
  const isSelectable = selectionMode === "radio" || selectionMode === "checkbox";

  const content = (
    <Card className={`h-full transition-colors hover:border-primary/40 hover:bg-accent/30 ${selected ? "border-primary ring-2 ring-primary/15" : ""}`}>
      <CardContent className="flex min-h-[72px] items-center gap-3 p-3">
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
        <Avatar className="h-10 w-10 shrink-0 rounded-lg">
          <AvatarImage src={avatarUrl || undefined} alt={avatarUrl ? fallbackLabel : ""} />
          <AvatarFallback className="rounded-lg text-xs">{getGovernanceInitials(fallbackLabel)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium">{label}</h2>
          {tab === "organizations" && entity.type && <p className="truncate text-xs text-muted-foreground">{entity.type}</p>}
        </div>
      </CardContent>
    </Card>
  );

  if (isSelectable) return <button type="button" onClick={() => onSelect?.(entity)} className="block h-full w-full text-left" title={label} aria-pressed={selected}>{content}</button>;
  return href ? <Link href={href} className="block h-full" title={label}>{content}</Link> : content;
}
