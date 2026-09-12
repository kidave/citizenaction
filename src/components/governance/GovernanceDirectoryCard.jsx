import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getGovernanceHref, getGovernanceInitials, getGovernanceLabel } from "@/utils/governance";

export default function GovernanceDirectoryCard({ entity, tab = "organizations", selectable = false, selected = false, onSelect }) {
  const label = getGovernanceLabel(entity);
  const href = getGovernanceHref({ ...entity, tab });
  const avatarUrl = entity.image_url || (tab === "organizations" ? entity.current_holder_image_url : null);
  const fallbackLabel = entity.current_holder_name || label;

  const content = (
    <Card className={`h-full transition-colors hover:border-primary/40 hover:bg-accent/30 ${selected ? "border-primary ring-2 ring-primary/15" : ""}`}>
      <CardContent className="flex h-[72px] items-center gap-3 p-3">
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

  if (selectable) return <button type="button" onClick={() => onSelect?.(entity)} className="block h-full w-full text-left" title={label}>{content}</button>;
  return href ? <Link href={href} className="block h-full" title={label}>{content}</Link> : content;
}
