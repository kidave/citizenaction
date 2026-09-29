"use client";

import { FileText } from "lucide-react";
import { UserIdentity } from "@/components/user/UserIdentity";
import GovernanceAvatarGroup from "@/components/governance/GovernanceAvatarGroup";
import SpaceAvatarGroup from "@/components/space/SpaceAvatarGroup";
import MenuButton from "@/components/ui/MenuButton";
import formatDate from "@/utils/date/formatDate";

export default function DocumentHeader({ post, canEdit, onEdit, onDelete }) {
  const governance = post?.governance ?? [];
  const spaces = Array.isArray(post?.spaces) ? post.spaces : [];
  return (
    <header className="space-y-4 border-b pb-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><FileText className="h-4 w-4" />Document</div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">{post?.title || "Untitled document"}</h1>
        </div>
        {canEdit && <MenuButton onEdit={onEdit} onDelete={onDelete} />}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <UserIdentity username={post.author_username} name={post.author_name} avatar={post.author_avatar} createdAt={formatDate(post.created_at)} />
        {spaces.length > 0 && <SpaceAvatarGroup spaces={spaces} />}
        {governance.length > 0 && <GovernanceAvatarGroup authorities={governance} />}
      </div>
    </header>
  );
}
