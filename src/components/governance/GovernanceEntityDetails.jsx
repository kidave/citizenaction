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
      className="flex min-w-0 items-center gap-2 rounded-lg px-1 py-1.5 text-left hover:bg-muted/60"
    >
      <Avatar className="h-8 w-8 shrink-0 rounded-md">
        <AvatarImage src={entity.image_url || undefined} alt="" />
        <AvatarFallback className="rounded-md text-[10px]">
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

  const role = leader?.role?.name || leader?.position_name || null;
  const avatar =
    leader?.person?.image_url ||
    leader?.person_avatar_url ||
    null;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="h-10 w-10 shrink-0 rounded-full">
        <AvatarImage src={avatar || undefined} alt="" />
        <AvatarFallback>
          {getGovernanceInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <p
          className="truncate text-sm font-medium"
          title={name}
        >
          {name}
        </p>

        {role && (
          <p
            className="truncate text-xs text-muted-foreground"
            title={role}
          >
            {role}
          </p>
        )}
      </div>
    </div>
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
        <div className="h-12 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-5">
      <Leader leader={leader} />

      {parent && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Reports to
          </p>

          <RelationItem
            entity={parent}
            onSelect={onSelect}
          />
        </div>
      )}

      {entity.valid_from && (
        <p className="text-xs text-muted-foreground">
          {entity.valid_to ? (
            <>
              Active from {formatGovernanceDate(entity.valid_from)}
              {` · until ${formatGovernanceDate(entity.valid_to)}`}
            </>
          ) : (
            <>Established · {formatGovernanceDate(entity.valid_from)}</>
          )}
        </p>
      )}

      {geographies.length > 0 && (
        <div className="space-y-1">
          {geographies.map((relationship) => {
            const geography = relationship.geographies;
            if (!geography) return null;

            return (
              <div
                key={relationship.id}
                className="flex min-w-0 items-center gap-2 text-sm"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span
                  className="truncate font-medium"
                  title={geography.name}
                >
                  {geography.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

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
