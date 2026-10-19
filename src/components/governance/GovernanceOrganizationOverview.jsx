import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, ChevronDown, ChevronRight, ExternalLink, GitBranch, MoreHorizontal, Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import LoadingState from "@/components/ui/loading-state";
import ErrorState from "@/components/ui/error-state";
import EmptyState from "@/components/ui/empty-state";
import { formatGovernanceDate, getGovernanceInitials } from "@/utils/governance";
import { useGovernanceOrganizationContext } from "@/hooks/governance/useGovernanceOrganizationContext";
import GovernanceCardActions from "@/components/governance/GovernanceCardActions";


function OrganizationUnit({ node, childrenByParent, canEdit, onSelect, expandedPath, onToggle }) {
  const children = childrenByParent.get(node.id) || [];
  const hasChildren = children.length > 0;
  const open = expandedPath.includes(node.id);

  return (
    <div className="space-y-2">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-start gap-3 p-4">
            <Avatar className="h-10 w-10 shrink-0 rounded-lg">
              <AvatarImage src={node.image_url || undefined} alt="" />
              <AvatarFallback className="rounded-lg"><Building2 className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={{ pathname: "/governance/[...path]", query: { path: [node.slug], view: "organization" } }}
                  className="font-medium hover:underline"
                >
                  {node.name}
                </Link>
                {node.type && <Badge variant="secondary" className="text-[10px]">{node.type}</Badge>}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{node.position_count || 0} positions</span>
                <span>{node.filled_position_count || 0} filled</span>
              </div>
            </div>
            {hasChildren && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onToggle(node.id)}
                aria-label={open ? "Collapse unit" : "Expand unit"}
              >
                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {open && hasChildren && (
        <div className="ml-4 space-y-2 border-l pl-4 sm:ml-6 sm:pl-6">
          {children.map((child) => (
            <OrganizationUnit
              key={child.id}
              node={child}
              childrenByParent={childrenByParent}
              canEdit={canEdit}
              onSelect={onSelect}
              expandedPath={expandedPath}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportingNode({ node, childrenByParent, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const children = childrenByParent.get(node.appointment_id) || [];
  const personLabel = node.is_vacant ? "Vacant" : node.person_name || "Unassigned";
  const positionHref = node.position_slug && node.organization_slug
    ? `/governance/${node.organization_slug}/${node.position_slug}`
    : null;
  const personHref = node.person_slug ? `/governance/person/${node.person_slug}` : null;

  return (
    <div className="relative">
      <Card className={cn(node.is_primary && "border-primary/40")}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0 rounded-lg">
              <AvatarImage src={node.person_avatar_url || node.position_avatar_url || undefined} alt="" />
              <AvatarFallback className="rounded-lg">{getGovernanceInitials(personLabel)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              {positionHref ? (
                <Link href={positionHref} className="block truncate text-sm font-semibold hover:underline">{node.position_name || "Position"}</Link>
              ) : (
                <div className="truncate text-sm font-semibold">{node.position_name || "Position"}</div>
              )}
              {personHref ? (
                <Link href={personHref} className="block truncate text-sm text-muted-foreground hover:underline">{personLabel}</Link>
              ) : (
                <div className="truncate text-sm text-muted-foreground">{personLabel}</div>
              )}
              <div className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
                <span>{node.organization_name}</span>
                {node.started_at && <span>{formatGovernanceDate(node.started_at)}{node.ended_at ? ` – ${formatGovernanceDate(node.ended_at)}` : ""}</span>}
              </div>
            </div>
            {children.length > 0 && (
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setOpen((value) => !value)} aria-label={open ? "Collapse reporting branch" : "Expand reporting branch"}>
                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {open && children.length > 0 && (
        <div className="ml-4 mt-2 space-y-2 border-l pl-4 sm:ml-8 sm:pl-6">
          {children.map((child) => <ReportingNode key={child.appointment_id} node={child} childrenByParent={childrenByParent} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

export default function GovernanceOrganizationOverview({ governance, asOf, canEdit = false, onEdit, onViewTree, onAddPosition, onManageRelations, onAddParent, onAddChild, onAddAddress, onRemoveAddress, onAddGeography, onRemoveGeography, onManageLinks, onDelete }) {
  const query = useGovernanceOrganizationContext({ governanceId: governance?.id, asOf });
  const organizations = query.data?.organizations || [];
  const appointments = query.data?.appointments || [];

  const childrenByParent = useMemo(() => {
    const map = new Map();
    organizations.forEach((item) => {
      if (!item.parent_entity_id) return;
      const children = map.get(item.parent_entity_id) || [];
      children.push(item);
      map.set(item.parent_entity_id, children);
    });
    return map;
  }, [organizations]);

  const appointmentsByParent = useMemo(() => {
    const map = new Map();
    appointments.forEach((item) => {
      if (!item.reports_to_position_id || item.reports_to_position_id === item.position_id) return;
      const children = map.get(item.reports_to_position_id) || [];
      children.push(item);
      map.set(item.reports_to_position_id, children);
    });
    return map;
  }, [appointments]);

  const reportingRoots = useMemo(() => {
    const positionIds = new Set(appointments.map((item) => item.position_id));
    return appointments.filter((item) => !item.reports_to_position_id || !positionIds.has(item.reports_to_position_id));
  }, [appointments]);

  const unmapped = useMemo(
    () => appointments.filter((item) => !item.reports_to_position_id),
    [appointments],
  );

  const [expandedPath, setExpandedPath] = useState(() => (governance?.id ? [governance.id] : []));

  const toggleOrganizationUnit = (id) => {
    setExpandedPath((currentPath) => {
      const index = currentPath.indexOf(id);
      if (index >= 0) return currentPath.slice(0, index);
      const parentId = organizations.find((item) => item.id === id)?.parent_entity_id;
      const parentIndex = parentId ? currentPath.indexOf(parentId) : -1;
      return [...(parentIndex >= 0 ? currentPath.slice(0, parentIndex + 1) : []), id];
    });
  };

  const root = organizations.find((item) => item.id === governance?.id) || {
    ...governance,
    depth: 0,
    position_count: appointments.filter((item) => item.organization_id === governance?.id).length,
    filled_position_count: appointments.filter((item) => item.organization_id === governance?.id && !item.is_vacant && item.person_id).length,
  };

  if (query.isLoading) {
    return <LoadingState className="min-h-[50vh]" label="Loading organization" />;
  }

  if (query.error) {
    return <ErrorState className="min-h-[50vh]" title="Unable to load organization structure" />;
  }

  const totalPositions = appointments.length;
  const filledPositions = appointments.filter((item) => !item.is_vacant && item.person_id).length;
  const unitCount = organizations.length;

  return (
    <div className="min-h-[calc(100vh-5.5rem)] bg-background">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar className="h-16 w-16 rounded-xl sm:h-20 sm:w-20">
                <AvatarImage src={root.image_url || undefined} alt="" />
                <AvatarFallback className="rounded-xl text-lg">{getGovernanceInitials(root.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{root.name}</h1>
                  {root.type && <Badge variant="secondary">{root.type}</Badge>}
                </div>
                {root.short_name && <p className="mt-1 text-sm text-muted-foreground">{root.short_name}</p>}
                {root.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{root.description}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {root.website && <Button asChild variant="outline" size="sm"><a href={root.website} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Website</a></Button>}
                  {onViewTree && <Button type="button" variant="outline" size="sm" onClick={onViewTree}><GitBranch className="mr-2 h-4 w-4" />View tree</Button>}
                  
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Units</div><div className="mt-1 text-lg font-semibold">{unitCount}</div></div>
              <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Current positions</div><div className="mt-1 text-lg font-semibold">{totalPositions}</div></div>
              <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Filled</div><div className="mt-1 text-lg font-semibold">{filledPositions}</div></div>
              <div className="rounded-lg border bg-muted/30 p-3"><div className="text-xs text-muted-foreground">Reporting roots</div><div className="mt-1 text-lg font-semibold">{reportingRoots.length}</div></div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Card>
            <CardContent className="space-y-3 p-4">
              <h2 className="text-sm font-semibold">Office and jurisdiction</h2>
              {root.address ? (
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Office address</div>
                  <p className="mt-1 text-sm">{root.address}</p>
                </div>
              ) : (
                <EmptyState title="No office address" description={canEdit ? "Use the organization actions to add the office address." : "An office address has not been recorded."} />
              )}
              {root.geography_id ? (
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Jurisdiction</div>
                  <p className="mt-1 text-sm">A jurisdiction boundary is linked to this organization.</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No jurisdiction boundary is linked yet.</p>
              )}
              <p className="text-xs text-muted-foreground">A map will be shown when the saved boundary and address coordinates are available.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Organization details</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Recorded organization information and reporting coverage.</p>
                </div>
                {canEdit && (
                  <GovernanceCardActions
                    onView={() => onEdit?.(governance)}
                    onViewTree={() => onViewTree?.()}
                    onEdit={() => onEdit?.(governance)}
                    onPrimaryAction={() => onAddPosition?.(governance)}
                    primaryActionLabel="Add Position"
                    onManageRelations={() => onManageRelations?.(governance)}
                    onAddParent={() => onAddParent?.(governance)}
                    onAddChild={() => onAddChild?.(governance)}
                    onAddAddress={() => onAddAddress?.(governance)}
                    onRemoveAddress={() => onRemoveAddress?.(governance)}
                    onAddGeography={() => onAddGeography?.(governance)}
                    onRemoveGeography={() => onRemoveGeography?.(governance)}
                    onManageLinks={() => onManageLinks?.(governance)}
                    onDelete={() => onDelete?.(governance)}
                    hasAddress={Boolean(root.address)}
                    hasGeography={Boolean(root.geography_id)}
                    hasLinks={Boolean(root.hasLinks)}
                  >
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" aria-label="Organization actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </GovernanceCardActions>
                )}
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-muted-foreground">Units</dt><dd className="mt-1 font-medium">{unitCount}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Current positions</dt><dd className="mt-1 font-medium">{totalPositions}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Filled positions</dt><dd className="mt-1 font-medium">{filledPositions}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Reporting roots</dt><dd className="mt-1 font-medium">{reportingRoots.length}</dd></div>
              </dl>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Current positions</h2>
              <p className="text-sm text-muted-foreground">Roles and their current holders in this organization.</p>
            </div>
            {canEdit && (
              <Button type="button" size="sm" onClick={() => onAddPosition?.(governance)}>
                <Plus className="mr-2 h-4 w-4" />Add position
              </Button>
            )}
          </div>
          {appointments.length ? (
            <div className="divide-y rounded-lg border">
              {appointments.map((item) => {
                const positionHref = item.position_slug && item.organization_slug ? `/governance/${item.organization_slug}/${item.position_slug}` : null;
                const personHref = item.person_slug ? `/governance/person/${item.person_slug}` : null;
                const vacant = item.is_vacant || !item.person_id;
                return (
                  <div key={item.appointment_id || item.position_id} className="flex min-w-0 items-center gap-3 p-3 sm:p-4">
                    <Avatar className="h-10 w-10 shrink-0 rounded-lg">
                      <AvatarImage src={vacant ? (root.image_url || undefined) : (item.person_avatar_url || undefined)} alt="" />
                      <AvatarFallback className="rounded-lg">{getGovernanceInitials(vacant ? root.name : item.person_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      {positionHref ? <Link href={positionHref} className="block truncate text-sm font-medium hover:underline">{item.position_name || "Position"}</Link> : <div className="truncate text-sm font-medium">{item.position_name || "Position"}</div>}
                      {personHref && !vacant ? <Link href={personHref} className="block truncate text-sm text-muted-foreground hover:underline">{item.person_name}</Link> : <div className={`text-sm ${vacant ? "font-medium text-muted-foreground" : "text-muted-foreground"}`}>{vacant ? "Vacant — no current person assigned" : item.person_name || "No current person assigned"}</div>}
                    </div>
                    {item.started_at && <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{formatGovernanceDate(item.started_at)}</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No current positions" description={canEdit ? "Add the first position for this organization." : "No current positions have been recorded."} />
          )}
        </section>
      </div>
    </div>
  );
}
