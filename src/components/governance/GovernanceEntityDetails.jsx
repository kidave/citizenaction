"use client";

import { MapPin } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import GovernanceResources from "@/components/governance/GovernanceResources";

import {
  getGovernanceInitials,
  formatGovernanceDate,
} from "@/utils/governance";

function RelationItem({ entity, onSelect }) {
  if (!entity) return null;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(entity)}
      className="flex min-w-0 items-center gap-2 text-left hover:opacity-80"
    >
      <Avatar className="h-8 w-8 shrink-0 rounded-full">
        <AvatarImage src={entity.image_url || undefined} alt="" />
        <AvatarFallback className="text-[10px]">
          {getGovernanceInitials(entity.name)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 truncate text-sm font-medium" title={entity.name}>
        {entity.name}
      </span>
    </button>
  );
}

function Leader({ leader }) {
  if (!leader) return null;

  const name = leader.is_vacant
    ? "Vacant"
    : leader?.person?.name || leader?.person_name || null;
  if (!name) return null;

  const role = leader?.role?.name || leader?.position_name || "Role";
  const avatar = leader?.person?.image_url || leader?.person_avatar_url || null;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="h-8 w-8 shrink-0 rounded-full">
        <AvatarImage src={avatar || undefined} alt="" />
        <AvatarFallback className="text-[10px]">
          {getGovernanceInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 leading-tight">
        <p className="text-[11px] font-medium text-muted-foreground" title={role}>
          {role}
        </p>
        <p className="truncate text-sm font-medium" title={name}>
          {name}
        </p>
      </div>
    </div>
  );
}

function InfoLabel({ children }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

export default function GovernanceEntityDetails({
  entity,
  parent,
  leader,
  geography = null,
  attachments = [],
  links = [],
  isLoading = false,
  canEdit = false,
  onSelect,
}) {
  if (!entity) return null;

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <div className="h-12 animate-pulse rounded-lg bg-muted" />
        <div className="h-12 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-1.5 text-sm">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium" title={geography?.name}>
            {geography?.name || "India"}
          </span>
        </div>

        {entity.valid_from && (
          <p className="truncate text-sm sm:text-right">
            <span className="font-medium">Established</span>
            <span className="text-muted-foreground">
              {` · ${formatGovernanceDate(entity.valid_from)}`}
              {entity.valid_to && ` · until ${formatGovernanceDate(entity.valid_to)}`}
            </span>
          </p>
        )}

        {leader && (
          <div className="min-w-0">
            <InfoLabel>Role</InfoLabel>
            <div className="mt-1">
              <Leader leader={leader} />
            </div>
          </div>
        )}

        {parent && (
          <div className="min-w-0 sm:text-right">
            <InfoLabel>Reports to</InfoLabel>
            <div className="mt-1 flex justify-start sm:justify-end">
              <RelationItem entity={parent} onSelect={onSelect} />
            </div>
          </div>
        )}
      </div>

      {entity.description && (
        <div>
          <h3 className="text-sm font-semibold">What they do</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {entity.description}
          </p>
        </div>
      )}

      {entity.website && (
        <div>
          <h3 className="text-sm font-semibold">Official website</h3>
          <a
            className="mt-1 block truncate text-sm text-primary hover:underline"
            href={entity.website}
            target="_blank"
            rel="noreferrer"
          >
            {entity.website}
          </a>
        </div>
      )}

      <GovernanceResources
        governanceId={entity.id}
        attachments={attachments}
        links={links}
        canEdit={canEdit}
      />
    </div>
  );
}
