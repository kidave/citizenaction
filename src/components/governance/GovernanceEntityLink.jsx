import Link from "next/link";
import { Building2, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getGovernanceInitials } from "@/utils/governance";

export default function GovernanceEntityLink({
  href,
  name,
  imageUrl,
  kind = "organization",
  className,
  avatarClassName,
  nameClassName,
  showAvatar = true,
}) {
  if (!href || !name) return null;

  const FallbackIcon = kind === "person" ? UserRound : Building2;

  return (
    <Link
      href={href}
      className={cn("inline-flex min-w-0 items-center gap-2 rounded-sm hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      aria-label={`View ${name}`}
    >
      {showAvatar && (
        <Avatar className={cn("shrink-0 rounded-md", avatarClassName)}>
          <AvatarImage src={imageUrl || undefined} alt={name} />
          <AvatarFallback className="rounded-md">
            {kind === "person" ? getGovernanceInitials(name) : <FallbackIcon className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      )}
      <span className={cn("min-w-0 truncate", nameClassName)}>{name}</span>
    </Link>
  );
}
