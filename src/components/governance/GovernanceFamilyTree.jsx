import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Landmark } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  getGovernanceInitials,
  getGovernanceLabel,
  getGovernanceTreeLabel,
  getGovernanceTypeLabel,
} from "@/utils/governance";

const TEXT_TYPES = new Set(["ministry", "department", "person", "position"]);

function buildTree(records) {
  const nodes = new Map((records || []).map((record) => [record.id, { ...record, children: [] }]));
  const roots = [];
  nodes.forEach((node) => {
    if (node.parent_id && nodes.has(node.parent_id)) nodes.get(node.parent_id).children.push(node);
    else roots.push(node);
  });
  const sort = (items) => {
    items.sort((a, b) => getGovernanceTreeLabel(a).localeCompare(getGovernanceTreeLabel(b)));
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
  const label = getGovernanceTreeLabel(node);
  const typeLabel = getGovernanceTypeLabel(node);

  return (
    <li className="flex min-w-0 flex-col items-center">
      <div className="flex w-full min-w-0 items-center justify-center gap-2">
        {textOnly ? (
          <button type="button" onClick={() => onSelect?.(node)} className={cn("min-w-0 w-[180px] max-w-[220px] rounded-md px-3 py-2 text-center transition-colors hover:bg-muted", selected && "bg-accent ring-1 ring-primary/25")} title={getGovernanceLabel(node)}>
            <span className="block truncate text-sm font-medium">{label}</span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{typeLabel}</span>
          </button>
        ) : (
          <button type="button" onClick={() => onSelect?.(node)} className={cn("group flex w-[210px] min-w-0 items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md", selected && "border-primary ring-2 ring-primary/15")} title={getGovernanceLabel(node)}>
            <Avatar className="h-10 w-10 shrink-0 rounded-lg">
              <AvatarImage src={node.image_url || undefined} alt="" />
              <AvatarFallback className="rounded-lg bg-muted">{node.entity_type === "authority" ? <Landmark className="h-4 w-4" /> : getGovernanceInitials(label)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{label}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{typeLabel}</span>
            </span>
          </button>
        )}

        {hasChildren && (
          <button type="button" onClick={(event) => { event.stopPropagation(); onToggle(node.id); }} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={expanded ? `Collapse ${getGovernanceLabel(node)}` : `Expand ${getGovernanceLabel(node)}`}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="mt-8 w-full overflow-visible px-1">
          <ul className="grid w-full items-start gap-4" style={{ gridTemplateColumns: `repeat(${node.children.length}, minmax(0, 1fr))` }}>
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} expandedIds={expandedIds} onToggle={onToggle} selectedId={selectedId} onSelect={onSelect} />
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
      roots.forEach((root) => next.add(root.id));
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
      <div className="flex min-h-full min-w-[720px] items-start justify-center gap-16 p-8 sm:p-12">
        {roots.map((root) => (
          <TreeNode key={root.id} node={root} expandedIds={expandedIds} onToggle={toggle} selectedId={selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
