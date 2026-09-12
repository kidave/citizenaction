import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Landmark, Minus, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { buildGovernanceTree, getGovernanceAncestorIds, getGovernanceLabel, getGovernanceTreeLabel, formatGovernanceType, getGovernanceInitials } from "@/utils/governance";

const MIN_ZOOM = 0.55;
const MAX_ZOOM = 1.6;
const ZOOM_STEP = 0.1;
const DEFAULT_ZOOM = 1;

function TreeConnector({ count }) {
  if (!count) return null;
  const points = Array.from({ length: count }, (_, index) => ((index + 0.5) / count) * 100);
  const first = points[0];
  const last = points[points.length - 1];
  return <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-10 w-full overflow-visible text-border" viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M 50 0 L 50 16" fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />{count > 1 && <path d={`M ${first} 16 L ${last} 16`} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />}{points.map((x) => <path key={x} d={`M ${x} 16 L ${x} 40`} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />)}</svg>;
}

function TreeNode({ node, expandedIds, onToggle, selectedId, onSelect, canEdit, actions, onOpenOrganization, onEdit, onAddRelation, onEditRelations, onAddGeography, onChangeGeography, onRemoveGeography, onDelete }) {
  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.has(node.id);
  const selected = selectedId === node.id;
  const label = getGovernanceTreeLabel(node);
  const editable = canEdit;
  const hasGeography = Boolean(node.geography_id);
  const menuAction = (callback) => (event) => { event.stopPropagation(); callback?.(node); };
  const openCard = (event) => { event.stopPropagation(); onSelect?.(node); };
  const avatarUrl = node.image_url || node.current_holder_image_url || undefined;
  const fallbackLabel = node.current_holder_name || label;
  const content = <button type="button" onClick={openCard} className={cn("group flex w-full min-w-0 items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md", selected && "border-primary ring-2 ring-primary/15")} title={getGovernanceLabel(node)}><Avatar className="h-10 w-10 shrink-0 rounded-lg"><AvatarImage src={avatarUrl} alt={avatarUrl ? fallbackLabel : ""} /><AvatarFallback className="rounded-lg bg-muted">{node.type === "authority" ? <Landmark className="h-4 w-4" /> : getGovernanceInitials(fallbackLabel)}</AvatarFallback></Avatar><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{label}</span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{formatGovernanceType(node)}</span></span></button>;
  return <li className="flex w-[240px] shrink-0 flex-col items-center"><div className="flex w-full min-w-0 items-center justify-center gap-1"><ContextMenu><ContextMenuTrigger asChild><div className="min-w-0 flex-1">{content}</div></ContextMenuTrigger><ContextMenuContent onCloseAutoFocus={(event) => event.preventDefault()}>{editable && <ContextMenuItem onSelect={menuAction(onEdit)}><Pencil className="mr-2 h-4 w-4" />Edit</ContextMenuItem>}<ContextMenuItem onSelect={menuAction(onOpenOrganization)}><ExternalLink className="mr-2 h-4 w-4" />Open organization</ContextMenuItem>{editable && <><ContextMenuSeparator /><ContextMenuItem onSelect={menuAction(onAddRelation)}><Plus className="mr-2 h-4 w-4" />Add relation</ContextMenuItem>{actions?.hasRelations?.(node) && <ContextMenuItem onSelect={menuAction(onEditRelations)}><Pencil className="mr-2 h-4 w-4" />Edit relations</ContextMenuItem>}{hasGeography ? <><ContextMenuItem onSelect={menuAction(onChangeGeography)}>Change geography</ContextMenuItem><ContextMenuItem className="text-destructive focus:text-destructive" onSelect={menuAction(onRemoveGeography)}>Remove geography</ContextMenuItem></> : <ContextMenuItem onSelect={menuAction(onAddGeography)}>Add geography</ContextMenuItem>}</>}{editable && onDelete && <><ContextMenuSeparator /><ContextMenuItem className="text-destructive focus:text-destructive" onSelect={menuAction(onDelete)}><Trash2 className="mr-2 h-4 w-4" />Delete</ContextMenuItem></>}</ContextMenuContent></ContextMenu>{hasChildren && <button type="button" onClick={(event) => { event.stopPropagation(); onToggle(node.id); }} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={expanded ? `Collapse ${getGovernanceLabel(node)}` : `Expand ${getGovernanceLabel(node)}`}>{expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button>}</div>{hasChildren && expanded && <div className="relative mt-2 w-max pt-10"><TreeConnector count={node.children.length} /><ul className="flex items-start justify-center gap-6">{node.children.map((child) => <TreeNode key={child.id} node={child} expandedIds={expandedIds} onToggle={onToggle} selectedId={selectedId} onSelect={onSelect} canEdit={canEdit} actions={actions} onOpenOrganization={onOpenOrganization} onEdit={onEdit} onAddRelation={onAddRelation} onEditRelations={onEditRelations} onAddGeography={onAddGeography} onChangeGeography={onChangeGeography} onRemoveGeography={onRemoveGeography} onDelete={onDelete} />)}</ul></div>}</li>;
}

export default function GovernanceFamilyTree({ records = [], selectedId = null, onSelect, className, initialExpandedIds = [], canEdit = false, onOpenOrganization, onEdit, onAddRelation, onEditRelations, onAddGeography, onChangeGeography, onRemoveGeography, onDelete }) {
  const roots = useMemo(() => buildGovernanceTree(records), [records]);
  const [expandedIds, setExpandedIds] = useState(() => new Set(initialExpandedIds));
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  useEffect(() => { const ancestors = getGovernanceAncestorIds(records, selectedId); setExpandedIds((current) => { const next = new Set(current); initialExpandedIds.forEach((id) => next.add(id)); ancestors.forEach((id) => next.add(id)); return next; }); }, [records, selectedId, initialExpandedIds]);
  const changeZoom = (delta) => setZoom((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((current + delta).toFixed(2))));
  const resetView = () => { setZoom(DEFAULT_ZOOM); setPan({ x: 0, y: 0 }); };
  const handleWheel = (event) => { if (event.target.closest("[data-tree-controls]")) return; event.preventDefault(); changeZoom(event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP); };
  const handlePointerDown = (event) => { if (event.button !== 0 || event.target.closest("[data-tree-controls], button, a, [role='menuitem']")) return; dragRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }; event.currentTarget.setPointerCapture?.(event.pointerId); setDragging(true); };
  const handlePointerMove = (event) => { if (!dragRef.current) return; event.preventDefault(); setPan({ x: dragRef.current.panX + event.clientX - dragRef.current.x, y: dragRef.current.panY + event.clientY - dragRef.current.y }); };
  const endDrag = (event) => { if (!dragRef.current) return; dragRef.current = null; event.currentTarget.releasePointerCapture?.(event.pointerId); setDragging(false); };
  if (!roots.length) return null;
  const toggle = (id) => setExpandedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return <div className={cn("relative h-full min-h-[calc(100vh-7rem)] w-full select-none overflow-hidden bg-background", dragging ? "cursor-grabbing" : "cursor-grab", className)} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onWheel={handleWheel}><div data-tree-controls className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-end p-3 sm:p-4"><div className="pointer-events-auto flex select-none items-center rounded-lg border bg-background/95 p-1 shadow-sm backdrop-blur" onPointerDown={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()}><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeZoom(-ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out"><Minus className="h-4 w-4" /></Button><button type="button" className="min-w-[3.5rem] select-none px-2 text-xs font-medium tabular-nums text-muted-foreground hover:text-foreground" onClick={() => setZoom(DEFAULT_ZOOM)} aria-label="Reset zoom" title="Reset zoom">{Math.round(zoom * 100)}%</button><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeZoom(ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in"><Plus className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={resetView} disabled={zoom === DEFAULT_ZOOM && pan.x === 0 && pan.y === 0} aria-label="Reset view"><RotateCcw className="h-4 w-4" /></Button></div></div><div className="absolute left-1/2 top-1/2 w-max origin-center select-none transition-transform duration-100 ease-out" style={{ transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})` }}><ul className="flex items-start justify-center gap-10 p-16 sm:p-24">{roots.map((root) => <TreeNode key={root.id} node={root} expandedIds={expandedIds} onToggle={toggle} selectedId={selectedId} onSelect={onSelect} canEdit={canEdit} actions={{ hasRelations: (item) => Boolean(item.parent_id || item.children?.length) }} onOpenOrganization={onOpenOrganization} onEdit={onEdit} onAddRelation={onAddRelation} onEditRelations={onEditRelations} onAddGeography={onAddGeography} onChangeGeography={onChangeGeography} onRemoveGeography={onRemoveGeography} onDelete={onDelete} />)}</ul></div></div>;
}
