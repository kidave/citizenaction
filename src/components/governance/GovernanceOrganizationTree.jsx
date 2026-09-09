import { useMemo } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MenuButton from "@/components/ui/MenuButton";
import { cn } from "@/lib/utils";
import { formatGovernanceDate, getGovernanceInitials } from "@/utils/governance";
import { useGovernanceOrganization } from "@/hooks/governance/useGovernanceOrganization";
import { supabase } from "@/lib/supabase/client";

function buildTree(records) {
  const nodes = new Map((records || []).map((record) => [record.id, { ...record, children: [] }]));
  const roots = [];

  nodes.forEach((node) => {
    if (node.parent_id && nodes.has(node.parent_id)) nodes.get(node.parent_id).children.push(node);
    else roots.push(node);
  });

  const sort = (items) => {
    items.sort((a, b) =>
      `${a.position_name || ""}${a.person_name || ""}`.localeCompare(
        `${b.position_name || ""}${b.person_name || ""}`,
      ),
    );
    items.forEach((item) => sort(item.children));
  };

  sort(roots);
  return roots;
}

function TreeConnector({ count }) {
  if (count < 1) return null;

  const points = Array.from({ length: count }, (_, index) => ((index + 0.5) / count) * 100);
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-10 w-full overflow-visible text-border"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
    >
      <path d="M 50 0 L 50 16" fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      {count > 1 && (
        <path d={`M ${first} 16 L ${last} 16`} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      )}
      {points.map((x) => (
        <path key={x} d={`M ${x} 16 L ${x} 40`} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

function OrganizationNode({ node, onEdit, onSelect, onDelete }) {
  const label = node.position_name || "Position";
  const person = node.is_vacant ? "Vacant" : node.person_name || "Unassigned";
  const date = node.started_at
    ? `${formatGovernanceDate(node.started_at)}${node.ended_at ? ` – ${formatGovernanceDate(node.ended_at)}` : ""}`
    : null;

  const deleteRole = async () => {
    try {
      const result = await supabase.rpc("delete_organization", { p_id: node.id });
      if (!result || result.error) throw result?.error || new Error("Unable to delete role");
      toast.success("Role removed from the organization");
      await onDelete?.(node);
    } catch (error) {
      toast.error(error?.message || "Unable to delete role");
    }
  };

  return (
    <li className="flex w-[230px] shrink-0 flex-col items-center">
      <div className="relative w-full">
        <Card className={cn("w-full", node.is_primary && "border-primary/50 shadow-sm")}>
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onSelect?.(node)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <Avatar className="h-10 w-10 shrink-0 rounded-lg">
                  <AvatarImage src={node.person_avatar_url || undefined} alt="" />
                  <AvatarFallback className="rounded-lg">{getGovernanceInitials(person)}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold" title={label}>{label}</span>
                  <span
                    className={cn(
                      "mt-0.5 block truncate text-sm",
                      node.is_vacant ? "text-muted-foreground" : "text-foreground",
                    )}
                    title={person}
                  >
                    {person}
                  </span>
                  {date && <span className="mt-1 block truncate text-[11px] text-muted-foreground">{date}</span>}
                </span>
              </button>

              {onEdit && (
                <MenuButton
                  onEdit={() => onEdit(node)}
                  onDelete={deleteRole}
                  editLabel="Edit role"
                  deleteLabel="Remove role"
                  deleteTitle={`Remove ${label}?`}
                  deleteDescription={
                    node.children.length
                      ? "This removes the role from the organization. Its direct reports will become top-level roles."
                      : "This removes the role from the organization. The person and role records themselves are kept."
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {node.children.length > 0 && (
        <div className="relative mt-2 pt-10">
          <TreeConnector count={node.children.length} />
          <ul className="flex items-start justify-center gap-6">
            {node.children.map((child) => (
              <OrganizationNode
                key={child.id}
                node={child}
                onEdit={onEdit}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export default function GovernanceOrganizationTree({
  governanceId,
  asOf,
  canEdit = false,
  onAdd,
  onEdit,
  onSelect,
  className,
}) {
  const query = useGovernanceOrganization({ governanceId, asOf });
  const roots = useMemo(() => buildTree(query.data || []), [query.data]);

  const refresh = async () => {
    await query.refetch();
  };

  if (query.isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading organization...</div>;
  }
  if (query.error) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-destructive">Unable to load organization.</div>;
  }

  return (
    <div className={cn("h-full w-full overflow-auto rounded-2xl border bg-background/50", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Organization</p>
          <p className="text-xs text-muted-foreground">Roles, people and reporting relationships.</p>
        </div>
        {canEdit && <Button size="sm" onClick={onAdd}><Plus className="mr-2 h-4 w-4" />Add role</Button>}
      </div>

      {!roots.length ? (
        <div className="flex min-h-[40vh] items-center justify-center px-6 text-center text-sm text-muted-foreground">
          No roles have been added yet.
        </div>
      ) : (
        <div className="min-h-full min-w-max p-8 sm:p-12">
          <ul className="flex items-start justify-center gap-10">
            {roots.map((root) => (
              <OrganizationNode
                key={root.id}
                node={root}
                onEdit={canEdit ? onEdit : null}
                onSelect={onSelect}
                onDelete={refresh}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
