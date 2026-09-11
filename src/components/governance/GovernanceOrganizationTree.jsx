import { useMemo, useRef, useState } from "react";
import { ExternalLink, Pencil, Plus, RotateCcw, Trash2, Minus } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatGovernanceDate, getGovernanceInitials } from "@/utils/governance";
import { useGovernanceOrganization } from "@/hooks/governance/useGovernanceOrganization";
import { supabase } from "@/lib/supabase/client";

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

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

function TreeConnector({ count }) {
  if (count < 1) return null;
  const points = Array.from({ length: count }, (_, index) => ((index + 0.5) / count) * 100);
  const first = points[0];
  const last = points[points.length - 1];
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-10 w-full overflow-visible text-border" viewBox="0 0 100 40" preserveAspectRatio="none">
      <path d="M 50 0 L 50 16" fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      {count > 1 && <path d={`M ${first} 16 L ${last} 16`} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />}
      {points.map((x) => <path key={x} d={`M ${x} 16 L ${x} 40`} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />)}
    </svg>
  );
}

function OrganizationNode({ node, canEdit, onEdit, onOpen, onSelect, onDelete }) {
  const label = node.position_name || "Position";
  const person = node.is_vacant ? "Vacant" : node.person_name || "Unassigned";
  const avatar = node.is_vacant ? node.position_avatar_url : node.person_avatar_url || node.position_avatar_url;
  const fallbackName = node.is_vacant ? label : person;
  const date = node.started_at ? `${formatGovernanceDate(node.started_at)}${node.ended_at ? ` – ${formatGovernanceDate(node.ended_at)}` : ""}` : null;

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

  const menuAction = (callback) => (event) => {
    event.stopPropagation();
    callback?.(node);
  };

  return (
    <li className="flex w-[230px] shrink-0 flex-col items-center">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="w-full" onClick={() => onSelect?.(node)}>
            <Card className={cn("w-full cursor-pointer", node.is_primary && "border-primary/50 shadow-sm")}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0 rounded-lg">
                    <AvatarImage src={avatar || undefined} alt="" />
                    <AvatarFallback className="rounded-lg">{getGovernanceInitials(fallbackName)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold" title={label}>{label}</span>
                    <span className={cn("mt-0.5 block truncate text-sm", node.is_vacant ? "text-muted-foreground" : "text-foreground")} title={person}>{person}</span>
                    {date && <span className="mt-1 block truncate text-[11px] text-muted-foreground">{date}</span>}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent onCloseAutoFocus={(event) => event.preventDefault()}>
          {canEdit && <ContextMenuItem onSelect={menuAction(onEdit)}><Pencil className="mr-2 h-4 w-4" />Edit</ContextMenuItem>}
          <ContextMenuItem onSelect={menuAction(onOpen)}><ExternalLink className="mr-2 h-4 w-4" />Open role</ContextMenuItem>
          {canEdit && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={menuAction(() => onSelect?.(node))}><Plus className="mr-2 h-4 w-4" />Add role</ContextMenuItem>
              {onDelete && <><ContextMenuSeparator /><ContextMenuItem className="text-destructive focus:text-destructive" onSelect={deleteRole}><Trash2 className="mr-2 h-4 w-4" />Remove role</ContextMenuItem></>}
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {node.children.length > 0 && (
        <div className="relative mt-2 pt-10">
          <TreeConnector count={node.children.length} />
          <ul className="flex items-start justify-center gap-6">
            {node.children.map((child) => <OrganizationNode key={child.id} node={child} canEdit={canEdit} onEdit={onEdit} onOpen={onOpen} onSelect={onSelect} onDelete={onDelete} />)}
          </ul>
        </div>
      )}
    </li>
  );
}

export default function GovernanceOrganizationTree({ governanceId, asOf, canEdit = false, onAdd, onEdit, onSelect, onOpen, className }) {
  const query = useGovernanceOrganization({ governanceId, asOf });
  const roots = useMemo(() => buildTree(query.data || []), [query.data]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);

  const refresh = async () => { await query.refetch(); };
  const changeZoom = (delta) => setZoom((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((current + delta).toFixed(2)))));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handlePointerDown = (event) => {
    if (event.button !== 0 || event.target.closest("button, a, [role='menuitem']")) return;
    dragRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
  };
  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    setPan({ x: dragRef.current.panX + event.clientX - dragRef.current.x, y: dragRef.current.panY + event.clientY - dragRef.current.y });
  };
  const endDrag = (event) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDragging(false);
  };

  if (query.isLoading) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading organization...</div>;
  if (query.error) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-destructive">Unable to load organization.</div>;

  return (
    <div
      className={cn("relative h-full min-h-[calc(100vh-7rem)] w-full overflow-hidden bg-background", dragging ? "cursor-grabbing" : "cursor-grab", className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 sm:p-4">
        <div className="pointer-events-auto rounded-lg border bg-background/95 px-3 py-2 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold">Organization</p>
          <p className="text-xs text-muted-foreground">Roles, people and reporting relationships.</p>
        </div>
        <div className="pointer-events-auto flex items-center rounded-lg border bg-background/95 p-1 shadow-sm backdrop-blur">
          {canEdit && <Button size="sm" className="mr-1" onClick={onAdd}><Plus className="mr-2 h-4 w-4" />Add role</Button>}
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeZoom(-ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out"><Minus className="h-4 w-4" /></Button>
          <button type="button" className="min-w-[3.5rem] px-2 text-xs font-medium tabular-nums text-muted-foreground hover:text-foreground" onClick={() => setZoom(1)} aria-label="Reset zoom">{Math.round(zoom * 100)}%</button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeZoom(ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in"><Plus className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={resetView} disabled={zoom === 1 && pan.x === 0 && pan.y === 0} aria-label="Reset view"><RotateCcw className="h-4 w-4" /></Button>
        </div>
      </div>

      {!roots.length ? (
        <div className="flex h-full min-h-[40vh] items-center justify-center px-6 text-center text-sm text-muted-foreground">No roles have been added yet.</div>
      ) : (
        <div className="absolute left-1/2 top-1/2 w-max origin-center select-none transition-transform duration-100 ease-out" style={{ transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})` }}>
          <ul className="flex items-start justify-center gap-10 p-16 sm:p-24">
            {roots.map((root) => <OrganizationNode key={root.id} node={root} canEdit={canEdit} onEdit={onEdit} onOpen={onOpen} onSelect={onSelect} onDelete={refresh} />)}
          </ul>
        </div>
      )}
    </div>
  );
}
