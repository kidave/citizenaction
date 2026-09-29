"use client";

import { UserIdentity } from "@/components/user/UserIdentity";
import GovernanceAvatarGroup from "@/components/governance/GovernanceAvatarGroup";
import SpaceAvatarGroup from "@/components/space/SpaceAvatarGroup";
import MenuButton from "@/components/ui/MenuButton";
import formatDate from "@/utils/date/formatDate";

export default function DocumentHeader({ post, canEdit, onEdit, onDelete }) {
  const governance = post?.governance ?? [];
  const spaces = Array.isArray(post?.spaces) ? post.spaces : [];
  const categories = Array.isArray(post?.categories) ? post.categories : [];
  const geography = Array.isArray(post?.geography) ? post.geography : [];
  const district = geography.find((item) => item?.source_type === "address" || item?.geography_type === "district")?.name || null;

  return (
    <header className="space-y-4 border-b pb-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">{post?.title || "Untitled document"}</h1>
        </div>
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
            <span key={category.id || category.category_id || category.name} className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
              {category.name || category.category_name}
            </span>
          ))}
          {district && <span className="text-muted-foreground">{district}</span>}
        </div>
      )}
    </header>
  );
}
