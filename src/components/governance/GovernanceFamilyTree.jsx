import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Landmark } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getGovernanceLabel } from "@/utils/governance";

const TEXT_TYPES = new Set(["ministry", "department", "person", "position"]);

function formatType(entity) {
  const type = entity?.unit_type && entity.unit_type !== "authority" ? entity.unit_type : entity?.entity_type;
  if (!type) return "Governance";
  if (type === "other") return "Organisation";
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(value) {
  return value?.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "G";
}

function buildTree(records) {
  const nodes = new Map((records || []).map((record) => [record.id, { ...record, children: [] }]));
  const roots = [];
  nodes.forEach((node) => {
    if (node.parent_id && nodes.has(node.parent_id)) nodes.get(node.parent_id).children.push(node);
    else roots.push(node);
  });
  const sort = (items) => {
    items.sort((a, b) => getGovernanceLabel(a).localeCompare(getGovernanceLabel(b)));
    items.forEach((item) => sort(item.children));
  };
  sort(roots);
  return roots;
}

function getAncestorIds(records, selectedId) {
  if (!selectedId) return [];
  const byId = new Map(records.map((record) => [record.id, record]));
  const ids = [];
  let current = byId.get(selectedId);
  const seen = new Set();
  while (current?.parent_id && !seen.has(current.parent_id)) {
    seen.add(current.parent_id);
    ids.push(current.parent_id);
    current = byId.get(current.parent_id);
  }
  return ids;
}

function TreeNode({ node, expandedIds, onToggle, selectedId, onSelect }) {
  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.has(node.id);
  const selected = selectedId === node.id;
  const textOnly = TEXT_TYPES.has(node.entity_type);
  const label = getGovernanceLabel(node);

  return (
    <li className="flex min-w-0 flex-col items-center">
      <div className="flex items-center gap-2">
        {textOnly ? (
          <button type="button" onClick={() => onSelect?.(node)} className={cn("rounded-md px-3 py-2 text-center transition-colors hover:bg-muted", selected && "bg-accent ring-1 ring-primary/25")}>
            <span className="block max-w-xs whitespace-normal text-sm font-medium">{label}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{formatType(node)}</span>
          </button>
        ) : (
          <button type="button" onClick={() => onSelect?.(node)} className={cn("group flex min-w-[190px] max-w-[280px] items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md", selected && "border-primary ring-2 ring-primary/15")}>
            <Avatar className="h-10 w-10 shrink-0 rounded-lg">
              <AvatarImage src={node.image_url || undefined} alt="" />
              <AvatarFallback className="rounded-lg bg-muted">{node.entity_type === "authority" ? <Landmark className="h-4 w-4" /> : getInitials(label)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <span className="block whitespace-normal text-sm font-semibold">{label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{formatType(node)}</span>
            </span>
          </button>
        )}

        {hasChildren && (
          <button type="button" onClick={() => onToggle(node.id)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={expanded ? `Collapse ${label}` : `Expand ${label}`}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="relative mt-8 pt-6">
          <span className="absolute left-1/2 top-0 h-6 w-px -translate-x-1/2 bg-border" />
          <ul className="flex min-w-max items-start justify-center gap-10">
            {node.children.map((child) => (
              <li key={child.id} className="relative pt-0">
                <span className="absolute left-1/2 top-[-24px] h-6 w-px -translate-x-1/2 bg-border" />
                <TreeNode node={child} expandedIds={expandedIds} onToggle={onToggle} selectedId={selectedId} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export default function GovernanceFamilyTree({ records = [], selectedId = null, onSelect, className, initialExpandedIds = [] }) {
  const roots = useMemo(() => buildTree(records), [records]);
  const [expandedIds, setExpandedIds] = useState(() => new Set(initialExpandedIds));

  useEffect(() => {
    const ancestors = getAncestorIds(records, selectedId);
    setExpandedIds((current) => {
      const next = new Set(current);
      initialExpandedIds.forEach((id) => next.add(id));
      ancestors.forEach((id) => next.add(id));
      if (roots.length === 1) next.add(roots[0].id);
      return next;
    });
  }, [records, selectedId, roots, initialExpandedIds]);

  const toggle = (id) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!roots.length) return null;

  return (
    <div className={cn("h-full w-full overflow-auto rounded-2xl border bg-background/50", className)}>
      <div className="flex min-h-full min-w-max items-start justify-center gap-16 p-8 sm:p-12">
        {roots.map((root) => (
          <TreeNode key={root.id} node={root} expandedIds={expandedIds} onToggle={toggle} selectedId={selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
