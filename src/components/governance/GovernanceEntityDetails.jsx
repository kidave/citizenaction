"use client";

import { MapPin } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      className="flex min-w-0 items-center gap-2 rounded-lg p-2 text-left hover:bg-muted/60"
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

export default function GovernanceEntityDetails({
  entity,
  parent,
  leader,
  jurisdiction,
  attachments = [],
  links = [],
  isLoading = false,
  canEdit = false,
  onSelect,
}) {
  if (!entity) return null;

  const leaderName = leader?.is_vacant
    ? "Vacant"
    : leader?.person?.name || leader?.person_name || null;

  const leaderRole = leader?.role?.name || leader?.position_name || null;

  const leaderAvatar =
    leader?.person?.image_url || leader?.person_avatar_url || null;

  const jurisdictionName =
    jurisdiction?.display_name ||
    jurisdiction?.operator_alt_name ||
    jurisdiction?.operator ||
    jurisdiction?.name ||
    entity.jurisdiction ||
    null;

  if (isLoading) {
    return (
      <div className="space-y-4 py-5">
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-5 py-5">
      {(jurisdictionName ||
        leaderName ||
        entity.valid_from ||
        entity.valid_to) && (
        <div className="grid gap-2 sm:grid-cols-2">
          {jurisdictionName && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Jurisdiction
              </p>

              <p className="mt-1 flex min-w-0 items-center gap-1 text-sm font-medium">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                <span className="truncate" title={jurisdictionName}>
                  {jurisdictionName}
                </span>
              </p>
            </div>
          )}

          {leaderName && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0 rounded-full">
                  <AvatarImage src={leaderAvatar || undefined} alt="" />

                  <AvatarFallback>
                    {getGovernanceInitials(leaderName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium"
                    title={leaderName}
                  >
                    {leaderName}
                  </p>

                  {leaderRole && (
                    <p
                      className="truncate text-xs text-muted-foreground"
                      title={leaderRole}
                    >
                      {leaderRole}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {(entity.valid_from || entity.valid_to) && (
            <div className="rounded-lg border bg-muted/30 p-3 sm:col-span-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {entity.valid_to ? "Since / until" : "Since"}
              </p>

              <p className="mt-1 truncate text-sm font-medium">
                {entity.valid_from
                  ? formatGovernanceDate(entity.valid_from)
                  : "—"}

                {entity.valid_to
                  ? ` – ${formatGovernanceDate(entity.valid_to)}`
                  : ""}
              </p>
            </div>
          )}
        </div>
      )}

      {parent && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Reports to
          </p>

          <RelationItem entity={parent} onSelect={onSelect} />
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
