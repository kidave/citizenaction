import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Building2, BriefcaseBusiness, CalendarDays, ChevronDown, ChevronRight, ExternalLink, GitBranch, Search, UserCheck, UserRoundX, MoreHorizontal, Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import LoadingState from "@/components/ui/loading-state";
import ErrorState from "@/components/ui/error-state";
import EmptyState from "@/components/ui/empty-state";
import { formatGovernanceDate, getGovernanceInitials } from "@/utils/governance";
import { supabase } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import GovernanceAppointmentDialog from "@/components/governance/GovernanceAppointmentDialog";
import GovernanceAppointmentDeleteButton from "@/components/governance/GovernanceAppointmentDeleteButton";

const LeafletMap = dynamic(() => import("@/components/geography/LeafletMap"), { ssr: false, loading: () => <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-muted-foreground">Loading map…</div> });
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

export default function GovernanceOrganizationOverview({ governance, asOf, canEdit = false, onEdit, onEditPosition, onDeletePosition, onViewTree, onAddPosition, onManageRelations, onAddParent, onAddChild, onAddAddress, onRemoveAddress, onAddGeography, onRemoveGeography, onManageLinks, onDelete }) {
  const query = useGovernanceOrganizationContext({ governanceId: governance?.id, asOf });
  const organizations = query.data?.organizations || [];
  const appointments = query.data?.appointments || [];
  const [positionSearch, setPositionSearch] = useState("");
  const [joinedFrom, setJoinedFrom] = useState("");
  const [joinedTo, setJoinedTo] = useState("");
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [appointmentRecord, setAppointmentRecord] = useState(null);
  const [appointmentPositionId, setAppointmentPositionId] = useState(null);
  const positionsQuery = useQuery({
    queryKey: ["governance-organization-positions", governance?.id],
    enabled: Boolean(governance?.id),
    queryFn: async () => {
      const { data, error } = await supabase.from("position")
        .select("id,name,slug,image_url,appointing_organization_id,address,metadata")
        .eq("appointing_organization_id", governance.id)
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });
  const { data: locationData } = useQuery({
    queryKey: ["governance-organization-map", governance?.id],
    enabled: Boolean(governance?.id),
    queryFn: async () => {
      const { data, error } = await supabase.from("governance").select("id,address,lat,lng,geom,geography_id,metadata").eq("id", governance.id).maybeSingle();
      if (error) throw error;
      return data || {};
    },
  });
  const { data: boundary } = useQuery({
    queryKey: ["governance-jurisdiction-geometry", locationData?.geography_id],
    enabled: Boolean(locationData?.geography_id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_geography_geometry", { p_geography_id: locationData.geography_id });
      if (error) throw error;
      return data?.type === "Feature" ? data.geometry : data?.geometry || data || null;
    },
  });

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

  const organizationAppointments = appointments.filter((item) => item.organization_id === governance?.id);
  const currentPositions = (positionsQuery.data || []).map((position) => {
    const appointment = organizationAppointments
      .filter((item) => item.position_id === position.id && !item.is_vacant && item.person_id)
      .sort((a, b) => String(b.started_at || "").localeCompare(String(a.started_at || "")))[0] || null;
    return {
      ...position, ...(appointment || {}),
      position_id: position.id, position_name: position.name, position_slug: position.slug,
      position_avatar_url: position.image_url, organization_slug: governance?.slug,
      appointment_id: appointment?.appointment_id || null, person_id: appointment?.person_id || null,
      person_name: appointment?.person_name || null, person_slug: appointment?.person_slug || null,
      person_avatar_url: appointment?.person_avatar_url || null, started_at: appointment?.started_at || null,
      is_vacant: !appointment,
    };
  });
  const filteredPositions = currentPositions.filter((item) => {
    const needle = positionSearch.trim().toLowerCase();
    const matchesSearch = !needle || [item.position_name, item.person_name].some((value) => String(value || "").toLowerCase().includes(needle));
    const joined = item.started_at ? String(item.started_at).slice(0, 10) : "";
    return matchesSearch && (!joinedFrom || (joined && joined >= joinedFrom)) && (!joinedTo || (joined && joined <= joinedTo));
  });
  const totalPositions = currentPositions.length;
  const filledPositions = currentPositions.filter((item) => !item.is_vacant).length;
  const vacantPositions = totalPositions - filledPositions;
  const unitCount = organizations.length;

  return (
    <div className="min-h-[calc(100vh-5.5rem)] bg-background">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="py-1">
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
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {root.website && <Button asChild variant="outline" size="sm"><a href={root.website} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Website</a></Button>}
                  {onViewTree && <Button type="button" variant="outline" size="sm" onClick={onViewTree}><GitBranch className="mr-2 h-4 w-4" />View tree</Button>}
                  {canEdit && <GovernanceCardActions
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
                    hasAddress={Boolean(locationData?.address || root.address)}
                    hasGeography={Boolean(locationData?.geography_id || root.geography_id)}
                    hasLinks={Boolean(root.hasLinks)}
                  >
                    <Button type="button" variant="outline" size="sm"><MoreHorizontal className="mr-2 h-4 w-4" />Organization actions</Button>
                  </GovernanceCardActions>}
                </div>
              </div>
            </div>


        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Units", value: Math.max(0, unitCount - 1), Icon: Building2 },
              { label: "Positions", value: totalPositions, Icon: BriefcaseBusiness },
              { label: "Filled", value: filledPositions, Icon: UserCheck },
              { label: "Vacant", value: vacantPositions, Icon: UserRoundX },
            ].map(({ label, value, Icon }) => <Card key={label}><CardContent className="flex items-start justify-between gap-3 p-4"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p></div><span className="rounded-lg bg-muted p-2 text-muted-foreground"><Icon className="h-4 w-4" /></span></CardContent></Card>)}
          </div>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[320px] w-full sm:h-[360px]">
                <LeafletMap
                  lat={Number(locationData?.lat ?? locationData?.metadata?.lat) || 19.076}
                  lng={Number(locationData?.lng ?? locationData?.metadata?.lng) || 72.8777}
                  showMarker={Number.isFinite(Number(locationData?.lat ?? locationData?.metadata?.lat)) && Number.isFinite(Number(locationData?.lng ?? locationData?.metadata?.lng))}
                  zoom={12}
                  boundary={boundary || locationData?.geom || null}
                  markers={[]}
                />
              </div>
              {!locationData?.geography_id && !locationData?.geom && <div className="border-t px-3 py-2 text-xs text-muted-foreground">No jurisdiction boundary is linked yet. Add geography from organization actions to display the boundary.</div>}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Positions</h2>
              <p className="text-sm text-muted-foreground">Only positions belonging directly to this organization.</p>
            </div>
            {canEdit && <Button type="button" size="sm" onClick={() => onAddPosition?.(governance)}><Plus className="mr-2 h-4 w-4" />Add position</Button>}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={positionSearch} onChange={(event) => setPositionSearch(event.target.value)} placeholder="Search positions or people…" className="pl-9" aria-label="Search positions or people" /></div>
            <div className="grid grid-cols-2 gap-2 sm:w-auto">
              <label className="flex items-center gap-2 rounded-md border px-3"><CalendarDays className="h-4 w-4 text-muted-foreground" /><Input type="date" value={joinedFrom} onChange={(event) => setJoinedFrom(event.target.value)} className="w-full border-0 p-0 shadow-none focus-visible:ring-0" aria-label="Joined from date" /></label>
              <label className="flex items-center gap-2 rounded-md border px-3"><CalendarDays className="h-4 w-4 text-muted-foreground" /><Input type="date" value={joinedTo} onChange={(event) => setJoinedTo(event.target.value)} className="w-full border-0 p-0 shadow-none focus-visible:ring-0" aria-label="Joined to date" /></label>
            </div>
          </div>
          {positionsQuery.isLoading ? <LoadingState label="Loading positions" /> : positionsQuery.error ? <ErrorState title="Unable to load positions" /> : filteredPositions.length ? (
            <div className="overflow-hidden rounded-lg border">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Current person</TableHead>
                      <TableHead className="hidden sm:table-cell">Joined</TableHead>
                      <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPositions.map((item) => {
                      const positionHref = item.position_slug && item.organization_slug ? `/governance/${item.organization_slug}/${item.position_slug}` : null;
                      const personHref = item.person_slug ? `/governance/person/${item.person_slug}` : null;
                      const vacant = item.is_vacant || !item.person_id;
                      return (
                        <TableRow key={item.appointment_id || item.position_id}>
                          <TableCell className="max-w-[280px]">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {positionHref ? <Link href={positionHref} className="block truncate font-medium hover:underline">{item.position_name || "Position"}</Link> : <span className="block truncate font-medium">{item.position_name || "Position"}</span>}
                              </TooltipTrigger>
                              <TooltipContent>{item.position_name || "Position"}</TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="max-w-[260px]">
                            <div className="flex min-w-0 items-center gap-2">
                              <Avatar className="h-8 w-8 shrink-0 rounded-md">
                                <AvatarImage src={vacant ? (root.image_url || undefined) : (item.person_avatar_url || undefined)} alt="" />
                                <AvatarFallback className="rounded-md text-xs">{getGovernanceInitials(vacant ? root.name : item.person_name)}</AvatarFallback>
                              </Avatar>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {personHref && !vacant ? <Link href={personHref} className="block truncate text-sm hover:underline">{item.person_name}</Link> : <span className={`block truncate text-sm ${vacant ? "text-muted-foreground" : ""}`}>{vacant ? "Vacant" : item.person_name || "Unassigned"}</span>}
                                </TooltipTrigger>
                                <TooltipContent>{vacant ? "Vacant — no current person assigned" : item.person_name || "No current person assigned"}</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{vacant || !item.started_at ? "—" : formatGovernanceDate(item.started_at)}</TableCell>
                          <TableCell>
                            {canEdit && item.appointment_id ? <GovernanceAppointmentDeleteButton appointmentId={item.appointment_id} personName={item.person_name} positionName={item.position_name} onEditPosition={() => onEditPosition?.(item)} onEdit={() => { setAppointmentRecord(item); setAppointmentPositionId(item.position_id); setAppointmentDialogOpen(true); }} onDeleted={async () => { await query.refetch(); await positionsQuery.refetch(); }} /> : canEdit ? <GovernanceCardActions onEdit={() => onEditPosition?.(item)} editLabel="Edit Position" onDelete={() => onDeletePosition?.(item)} entityLabel="position"><span className="block h-8 w-8" aria-hidden="true" /></GovernanceCardActions> : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TooltipProvider>
            </div>
          ) : (
            <EmptyState title={currentPositions.length ? "No matching positions" : "No positions found"} description={currentPositions.length ? "Try changing your search or date range." : canEdit ? "Add the first position for this organization." : "No positions have been recorded."} />
          )}
        </section>
        {canEdit && <GovernanceAppointmentDialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen} mode="position" organizationId={governance?.id} positionId={appointmentPositionId} record={appointmentRecord} onSaved={async () => { await query.refetch(); await positionsQuery.refetch(); }} />}
      </div>
    </div>
  );
}
