import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getGovernanceHref, getGovernanceInitials, getGovernanceLabel } from "@/utils/governance";

export default function GovernanceDirectoryCard({ entity, tab = "organizations" }) {
  const label = getGovernanceLabel(entity);
  const href = getGovernanceHref({ ...entity, tab });
  const avatarUrl = entity.image_url || (tab === "organizations" ? entity.current_holder_image_url : null);
  const fallbackLabel = entity.current_holder_name || label;

  const content = (
    <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/30">
      <CardContent className="flex h-[72px] items-center gap-3 p-3">
        <Avatar className="h-10 w-10 shrink-0 rounded-lg">
          <AvatarImage src={avatarUrl || undefined} alt={avatarUrl ? fallbackLabel : ""} />
          <AvatarFallback className="rounded-lg text-xs">{getGovernanceInitials(fallbackLabel)}</AvatarFallback>
        </Avatar>
        <h2 className="min-w-0 truncate text-sm font-medium">{label}</h2>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href} className="block h-full" title={label}>{content}</Link> : content;
}
