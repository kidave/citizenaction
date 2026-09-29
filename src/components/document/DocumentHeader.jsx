"use client";

import { UserIdentity } from "@/components/user/UserIdentity";
import GovernanceAvatarGroup from "@/components/governance/GovernanceAvatarGroup";
import SpaceAvatarGroup from "@/components/space/SpaceAvatarGroup";
import MenuButton from "@/components/ui/MenuButton";
import formatDate from "@/utils/date/formatDate";

export default function DocumentHeader({ post, publicContext, canEdit, onEdit, onDelete }) {
  const governance = post?.governance ?? [];
  const spaces = Array.isArray(post?.spaces) ? post.spaces : [];
  const categories = Array.isArray(publicContext?.categories) ? publicContext.categories : [];
  const geography = Array.isArray(publicContext?.geography) ? publicContext.geography : [];
  const district = geography.find((item) => item?.source_type === "address" || item?.geography_type === "district")?.name || null;

  return (
    <header className="space-y-4 border-b pb-5">
      <div className="flex items-start justify-end gap-4">
        {canEdit && <MenuButton onEdit={onEdit} onDelete={onDelete} />}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <UserIdentity username={post.author_username} name={post.author_name} avatar={post.author_avatar} createdAt={formatDate(post.created_at)} />
        {spaces.length > 0 && <SpaceAvatarGroup spaces={spaces} />}
        {governance.length > 0 && <GovernanceAvatarGroup authorities={governance} />}
      </div>
      {(categories.length > 0 || district) && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {categories.map((category) => (
            <span key={category.id || category.name} className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
              {category.name}
            </span>
          ))}
          {district && <span className="text-muted-foreground">{district}</span>}
        </div>
      )}
    </header>
  );
}
