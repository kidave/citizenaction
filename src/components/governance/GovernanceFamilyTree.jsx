import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Landmark,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MenuButton from "@/components/ui/MenuButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildGovernanceTree,
  getGovernanceAncestorIds,
  getGovernanceLabel,
  getGovernanceTreeLabel,
  formatGovernanceType,
  getGovernanceInitials,
} from "@/utils/governance";

const TEXT_TYPES = new Set(["ministry", "department", "person", "position"]);
const MIN_ZOOM = 0.65;
const MAX_ZOOM = 1.4;
const ZOOM_STEP = 0.1;
const DEFAULT_ZOOM = 1;

function TreeConnector({ count }) {
  if (!count) return null;
  const points = Array.from(
    { length: count },
    (_, index) => ((index + 0.5) / count) * 100,
  );
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

function TreeNode({
  node,
  expandedIds,
  onToggle,
  selectedId,
  onSelect,
  canEdit,
  onAddRelation,
}) {
  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.has(node.id);
  const selected = selectedId === node.id;
  const textOnly = TEXT_TYPES.has(node.entity_type);
  const label = getGovernanceTreeLabel(node);
  const actions = canEdit && !textOnly;

  return (
    <li className="flex w-[240px] shrink-0 flex-col items-center">
      <div className="flex w-full min-w-0 items-center justify-center gap-1">
        {textOnly ? (
          <button
            type="button"
            onClick={() => onSelect?.(node)}
            className={cn(
              "w-full min-w-0 rounded-md px-3 py-2 text-center transition-colors hover:bg-muted",
              selected && "bg-accent ring-1 ring-primary/25",
            )}
            title={getGovernanceLabel(node)}
          >
            <span className="block truncate text-sm font-medium">{label}</span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {formatGovernanceType(node)}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelect?.(node)}
            className={cn(
              "group flex w-full min-w-0 items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
              selected && "border-primary ring-2 ring-primary/15",
            )}
            title={getGovernanceLabel(node)}
          >
            <Avatar className="h-10 w-10 shrink-0 rounded-lg">
              <AvatarImage src={node.image_url || undefined} alt="" />
              <AvatarFallback className="rounded-lg bg-muted">
                {node.entity_type === "authority" ? (
                  <Landmark className="h-4 w-4" />
                ) : (
                  getGovernanceInitials(label)
                )}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{label}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {formatGovernanceType(node)}
              </span>
            </span>
          </button>
        )}

        {actions && (
          <MenuButton
            onAddRelation={() => onAddRelation?.(node)}
          />
        )}

        {hasChildren && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggle(node.id);
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={expanded ? `Collapse ${getGovernanceLabel(node)}` : `Expand ${getGovernanceLabel(node)}`}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="relative mt-2 w-max pt-10">
          <TreeConnector count={node.children.length} />
          <ul className="flex items-start justify-center gap-6">
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                expandedIds={expandedIds}
                onToggle={onToggle}
                selectedId={selectedId}
                onSelect={onSelect}
                canEdit={canEdit}
                onAddRelation={onAddRelation}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export default function GovernanceFamilyTree({
  records = [],
  selectedId = null,
  onSelect,
  className,
  initialExpandedIds = [],
  canEdit = false,
  onAddRelation,
}) {
  const roots = useMemo(() => buildGovernanceTree(records), [records]);
  const [expandedIds, setExpandedIds] = useState(() => new Set(initialExpandedIds));
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    const ancestors = getGovernanceAncestorIds(records, selectedId);
    setExpandedIds((current) => {
      const next = new Set(current);
      initialExpandedIds.forEach((id) => next.add(id));
      ancestors.forEach((id) => next.add(id));
      roots.forEach((root) => next.add(root.id));
      return next;
    });
  }, [records, selectedId, roots, initialExpandedIds]);

  const changeZoom = (delta) => {
    setZoom((current) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((current + delta).toFixed(2)))),
    );
  };

  if (!roots.length) return null;

  return (
    <div className={cn("relative h-full w-full overflow-auto rounded-2xl border bg-background/50", className)}>
      <div className="absolute right-3 top-3 z-20 flex items-center rounded-lg border bg-background/95 p-1 shadow-sm backdrop-blur">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeZoom(-ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out">
          <Minus className="h-4 w-4" />
        </Button>
        <button type="button" className="min-w-[3.5rem] px-2 text-xs font-medium tabular-nums text-muted-foreground hover:text-foreground" onClick={() => setZoom(DEFAULT_ZOOM)} aria-label="Reset zoom" title="Reset zoom">
          {Math.round(zoom * 100)}%
        </button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeZoom(ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">
          <Plus className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(DEFAULT_ZOOM)} disabled={zoom === DEFAULT_ZOOM} aria-label="Reset zoom">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-full min-w-max p-8 pt-14 sm:p-12 sm:pt-16">
        <div className="origin-top-left transition-transform duration-150" style={{ transform: `scale(${zoom})` }}>
          <ul className="flex items-start justify-center gap-10">
            {roots.map((root) => (
              <TreeNode
                key={root.id}
                node={root}
                expandedIds={expandedIds}
                onToggle={(id) => setExpandedIds((current) => {
                  const next = new Set(current);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                })}
                selectedId={selectedId}
                onSelect={onSelect}
                canEdit={canEdit}
                onAddRelation={onAddRelation}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
