import { useMemo } from "react";
import { Plus } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatGovernanceDate, getGovernanceLabel, getGovernanceInitials } from "@/utils/governance";
import { useGovernanceOrganization } from "@/hooks/governance/useGovernanceOrganization";

function buildTree(records) {
  const nodes = new Map((records || []).map((record) => [record.id, { ...record, children: [] }]));
  const roots = [];
  nodes.forEach((node) => {
    if (node.parent_id && nodes.has(node.parent_id)) nodes.get(node.parent_id).children.push(node);
    else roots.push(node);
  });
  const sort = (items) => {
    items.sort((a, b) => `${a.position_name || ""}${a.person_name || ""}`.localeCompare(`${b.position_name || ""}${b.person_name || ""}`));
    items.forEach((item) => sort(item.children));
  };
  sort(roots);
  return roots;
}

function OrganizationNode({ node, onEdit, onSelect }) {
  const label = node.position_name || "Position";
  const person = node.is_vacant ? "Vacant" : node.person_name || "Unassigned";
  const date = node.started_at ? `${formatGovernanceDate(node.started_at)}${node.ended_at ? ` – ${formatGovernanceDate(node.ended_at)}` : ""}` : null;

  return (
    <li className="flex min-w-0 flex-col items-center">
      <Card className={cn("w-[230px] max-w-full", node.is_primary && "border-primary/50")}>
        <CardContent className="p-4">
          <button type="button" onClick={() => onSelect?.(node)} className="flex w-full items-center gap-3 text-left">
            <Avatar className="h-10 w-10 shrink-0 rounded-lg"><AvatarFallback className="rounded-lg">{getGovernanceInitials(person)}</AvatarFallback></Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold" title={label}>{label}</span>
              <span className={cn("mt-0.5 block truncate text-sm", node.is_vacant ? "text-muted-foreground" : "text-foreground")} title={person}>{person}</span>
              {date && <span className="mt-1 block truncate text-[11px] text-muted-foreground">{date}</span>}
            </span>
          </button>
          {onEdit && <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs" onClick={() => onEdit(node)}>Edit role</Button>}
        </CardContent>
      </Card>
      {node.children.length > 0 && (
        <div className="mt-6 w-full px-1">
          <ul className="grid w-full items-start gap-4" style={{ gridTemplateColumns: `repeat(${node.children.length}, minmax(0, 1fr))` }}>
            {node.children.map((child) => <OrganizationNode key={child.id} node={child} onEdit={onEdit} onSelect={onSelect} />)}
          </ul>
        </div>
      )}
    </li>
  );
}

export default function GovernanceOrganizationTree({ governanceId, asOf, canEdit = false, onAdd, onEdit, onSelect, className }) {
  const query = useGovernanceOrganization({ governanceId, asOf });
  const roots = useMemo(() => buildTree(query.data || []), [query.data]);

  if (query.isLoading) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading organization...</div>;
  if (query.error) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-destructive">Unable to load organization.</div>;

  return (
    <div className={cn("h-full w-full overflow-auto rounded-2xl border bg-background/50", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div><p className="text-sm font-semibold">Organization</p><p className="text-xs text-muted-foreground">People and roles within this organization.</p></div>
        {canEdit && <Button size="sm" onClick={onAdd}><Plus className="mr-2 h-4 w-4" />Add role</Button>}
      </div>
      {!roots.length ? (
        <div className="flex min-h-[40vh] items-center justify-center px-6 text-center text-sm text-muted-foreground">No roles have been added yet.</div>
      ) : (
        <div className="flex min-h-full min-w-[720px] items-start justify-center gap-16 p-8 sm:p-12">
          {roots.map((root) => <OrganizationNode key={root.id} node={root} onEdit={canEdit ? onEdit : null} onSelect={onSelect} />)}
        </div>
      )}
    </div>
  );
}
