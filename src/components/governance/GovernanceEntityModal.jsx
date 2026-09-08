import { ExternalLink, GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getGovernanceLabel } from "@/utils/governance";

function formatType(entity) {
  const type = entity?.entity_type || entity?.unit_type;
  if (!type) return "Governance";
  if (type === "other") return "Organisation";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function getInitials(value) {
  return value?.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "G";
}

export default function GovernanceEntityModal({
  open,
  onOpenChange,
  entity,
  parent,
  childEntities = [],
  canEdit = false,
  onEdit,
  onSelect,
}) {
  if (!entity) return null;

  const label = getGovernanceLabel(entity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <Avatar className="h-12 w-12 rounded-xl">
              <AvatarImage src={entity.image_url || undefined} alt="" />
              <AvatarFallback className="rounded-xl">{getInitials(label)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-xl">{label}</DialogTitle>
                <Badge variant="outline">{formatType(entity)}</Badge>
              </div>
              <DialogDescription className="mt-1">
                Explore where this entity sits in the governance structure.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {parent && (
            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Parent</p>
              <button
                type="button"
                onClick={() => onSelect?.(parent)}
                className="mt-2 flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent"
              >
                <GitBranch className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{getGovernanceLabel(parent)}</span>
                  <span className="text-xs text-muted-foreground">{formatType(parent)}</span>
                </span>
              </button>
            </section>
          )}

          {entity.description && (
            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">About</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{entity.description}</p>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Children</p>
              <span className="text-xs text-muted-foreground">{childEntities.length}</span>
            </div>
            {childEntities.length > 0 ? (
              <div className="mt-2 space-y-1.5">
                {childEntities.map((child) => (
                  <button
                    type="button"
                    key={child.id}
                    onClick={() => onSelect?.(child)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-muted"
                  >
                    <span className="min-w-0 truncate text-sm font-medium">{getGovernanceLabel(child)}</span>
                    <span className="ml-3 shrink-0 text-xs text-muted-foreground">{formatType(child)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No child entities recorded yet.</p>
            )}
          </section>

          {entity.website && (
            <a href={entity.website} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium hover:underline">
              Official website
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {canEdit && (
          <DialogFooter>
            <Button onClick={() => onEdit?.(entity)}>Edit governance entity</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
