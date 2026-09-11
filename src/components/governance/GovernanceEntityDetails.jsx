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
      <Avatar className="h-7 w-7 shrink-0 rounded-full">
        <AvatarImage src={entity.image_url || undefined} alt="" />
        <AvatarFallback className="text-[10px]">
          {getGovernanceInitials(entity.name)}
        </AvatarFallback>
      </Avatar>

      <span
        className="min-w-0 truncate text-sm font-medium"
        title={entity.name}
      >
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

  const avatar =
    leader?.person?.image_url ||
    leader?.person_avatar_url ||
    null;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="h-8 w-8 shrink-0 rounded-full">
        <AvatarImage src={avatar || undefined} alt="" />
        <AvatarFallback className="text-[10px]">
          {getGovernanceInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0">
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
  geographies = [],
  attachments = [],
  links = [],
  isLoading = false,
  canEdit = false,
  onSelect,
}) {
  if (!entity) return null;

  if (isLoading) {
    return (
      <div className="space-y-5 py-5">
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const primaryGeography = geographies.find(
    (relationship) => relationship.is_primary,
  )?.geographies;
  const geography = primaryGeography || geographies[0]?.geographies;

  return (
    <div className="space-y-6 py-5">
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        <div className="min-w-0">
          {geography && (
            <div className="flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span
                className="truncate text-sm font-medium"
                title={geography.name}
              >
                {geography.name}
              </span>
            </div>
          )}
        </div>

        {entity.valid_from && (
          <div className="min-w-0 sm:text-right">
            <InfoLabel>Established</InfoLabel>
            <p className="mt-0.5 truncate text-sm font-medium">
              {formatGovernanceDate(entity.valid_from)}
            </p>
          </div>
        )}

        {leader && (
          <div className="min-w-0">
            <InfoLabel>Minister</InfoLabel>
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

        {entity.valid_to && (
          <div className="min-w-0 sm:col-span-2">
            <p className="text-xs text-muted-foreground">
              Active until {formatGovernanceDate(entity.valid_to)}
            </p>
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
