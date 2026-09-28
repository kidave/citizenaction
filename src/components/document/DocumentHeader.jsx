
"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GovernanceAvatarGroup from "@/components/governance/GovernanceAvatarGroup";
import SpaceAvatarGroup from "@/components/space/SpaceAvatarGroup";
import { UserIdentity } from "@/components/user/UserIdentity";
import formatDate from "@/utils/date/formatDate";

function formatDocumentDate(post) {
  if (!post?.start_at) return null;
  const precision = post?.metadata?.date_precision || "date";
  const value = new Date(post.start_at);
  if (Number.isNaN(value.getTime())) return null;
  if (precision === "year") return value.toLocaleDateString(undefined, { year: "numeric" });
  if (precision === "month") return value.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return value.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

export default function DocumentHeader({ post, context, canEdit, onEdit }) {
  const category = context?.category;
  const geography = context?.geography;
  const organization = context?.organization;
  const spaces = context?.spaces || [];

  return (
    <header className="space-y-5 px-4 pt-4 sm:px-0 sm:pt-3">
      <div className="flex items-start justify-between gap-4">
        <UserIdentity
          username={post.author_username}
          name={post.author_name}
          avatar={post.author_avatar}
          createdAt={formatDate(post.created_at)}
        />
        <div className="mr-2 flex min-w-0 items-center gap-2">
          {spaces.length > 0 && <SpaceAvatarGroup spaces={spaces} />}
          {post.governance?.length > 0 && <GovernanceAvatarGroup authorities={post.governance} />}
          {canEdit && <button type="button" className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" onClick={onEdit} aria-label="Edit document">•••</button>}
        </div>
      </div>

      {(category || geography) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {category && <span className="font-medium text-foreground">{category.name}</span>}
          {category && geography && <span className="text-muted-foreground">·</span>}
          {geography && <span className="text-muted-foreground">{geography.name || geography.official_name}</span>}
        </div>
      )}

      <div className="border-l-4 border-primary pl-4">
        <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">{post.title || "Untitled document"}</h1>
      </div>

      {(formatDocumentDate(post) || post.address) && (
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
          {formatDocumentDate(post) && <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0" /><span>{formatDocumentDate(post)}</span></div>}
          {post.address && <a href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(post.address)} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-start gap-2 hover:text-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span className="break-words underline-offset-4 hover:underline">{post.address}</span></a>}
        </div>
      )}

      {organization && (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0"><AvatarImage src={organization.image_url || undefined} alt="" /><AvatarFallback>{organization.short_name?.[0] || organization.name?.[0] || "O"}</AvatarFallback></Avatar>
          <div className="min-w-0"><p className="text-sm font-medium">{organization.short_name || organization.name}</p>{organization.short_name && organization.short_name !== organization.name && <p className="text-xs text-muted-foreground">{organization.name}</p>}</div>
        </div>
      )}
    </header>
  );
}
