import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, GitBranch, MoreHorizontal, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getGovernanceHref, getGovernanceLabel } from "@/utils/governance";

function buildTree(records) {
  const nodes = new Map();
  const roots = [];

  (records || []).forEach((record) => {
    nodes.set(record.id, { ...record, children: [] });
  });

  nodes.forEach((node) => {
    if (node.parent_id && nodes.has(node.parent_id)) {
      nodes.get(node.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (items) => {
    items.sort((a, b) => getGovernanceLabel(a).localeCompare(getGovernanceLabel(b)));
    items.forEach((item) => sortNodes(item.children));
  };

  sortNodes(roots);
  return roots;
}

function formatType(node) {
  const type = node?.unit_type || node?.entity_type;
  if (!type) return "Governance";
  if (type === "other") return "Organisation";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function TreeNode({ node, depth = 0, selectedId, onSelect, onAddChild, onAddParent }) {
  const [open, setOpen] = useState(depth === 0);
  const label = getGovernanceLabel(node);
  const href = getGovernanceHref(node);
  const isSelected = selectedId === node.id;
  const isTextOnly = ["ministry", "department", "person"].includes(node.entity_type);
  const hasChildren = node.children.length > 0;

  const select = () => onSelect(node);

  return (
    <li className="relative">
      <div className="flex items-center gap-1.5">
        {hasChildren ? (
          <button
            type="button"
            aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-accent"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-7 shrink-0" />
        )}

        {isTextOnly ? (
          <button
            type="button"
            onClick={select}
            className={cn(
              "min-w-0 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
              isSelected && "bg-accent ring-1 ring-ring/50",
            )}
          >
            <span className="font-medium">{label}</span>
            <span className="ml-2 text-xs text-muted-foreground">{formatType(node)}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={select}
            className={cn(
              "group flex min-w-0 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left shadow-sm transition-colors hover:bg-accent",
              isSelected && "border-primary bg-accent ring-1 ring-primary/20",
            )}
          >
            <span className="min-w-0 truncate text-sm font-medium">{label}</span>
            <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
              {formatType(node)}
            </Badge>
          </button>
        )}

        {isSelected && (
          <div className="flex items-center gap-1 pl-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(event) => {
                event.stopPropagation();
                onAddChild(node);
              }}
              title="Add child"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only">Add child</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(event) => {
                event.stopPropagation();
                onAddParent(node);
              }}
              title="Add parent"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              <span className="sr-only">Add parent</span>
            </Button>
          </div>
        )}
      </div>

      {hasChildren && open ? (
        <ul className="ml-3 mt-1 space-y-1 border-l pl-4">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onAddParent={onAddParent}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function GovernanceFamilyTree({
  records,
  selectedId = null,
  onSelect,
  onAddChild,
  onAddParent,
  className,
}) {
  const roots = useMemo(() => buildTree(records), [records]);

  if (!roots.length) return null;

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-4 flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold">Governance structure</h2>
          <p className="text-xs text-muted-foreground">Select an entity to explore its place in the hierarchy.</p>
        </div>
      </div>

      <ul className="space-y-2">
        {roots.map((root) => (
          <TreeNode
            key={root.id}
            node={root}
            selectedId={selectedId}
            onSelect={onSelect}
            onAddChild={onAddChild}
            onAddParent={onAddParent}
          />
        ))}
      </ul>
    </div>
  );
}
