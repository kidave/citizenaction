import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import { Building2, CalendarDays, ChevronDown, ChevronRight, ExternalLink, Network, Mail, MapPin, Phone, Search, MoreHorizontal, Plus, Link2, Globe } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import GovernanceAppointmentDialog from "@/components/governance/GovernanceAppointmentDialog";
import GovernanceAppointmentDeleteButton from "@/components/governance/GovernanceAppointmentDeleteButton";
import GovernanceResourceDialogs from "@/components/governance/GovernanceResourceDialogs";
import GovernanceResources from "@/components/governance/GovernanceResources";
import PostLinks from "@/components/post/PostLinks";

const LeafletMap = dynamic(() => import("@/components/geography/LeafletMap"), { ssr: false, loading: () => <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-muted-foreground">Loading map…</div> });
import { useGovernanceOrganizationContext } from "@/hooks/governance/useGovernanceOrganizationContext";
import { GovernanceActionDropdown } from "@/components/governance/GovernanceActionMenu";


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
  const [appointmentLocationRecord, setAppointmentLocationRecord] = useState(null);
  const [appointmentAddressOpen, setAppointmentAddressOpen] = useState(false);
  const [appointmentGeographyOpen, setAppointmentGeographyOpen] = useState(false);
  const [organizationAddressOpen, setOrganizationAddressOpen] = useState(false);
  const [organizationGeographyOpen, setOrganizationGeographyOpen] = useState(false);
  const [organizationLinksOpen, setOrganizationLinksOpen] = useState(false);
  const positionsQuery = useQuery({
    queryKey: ["governance-organization-positions", governance?.id],
    enabled: Boolean(governance?.id),
    queryFn: async () => {
      const { data, error } = await supabase.from("position")
        .select("id,name,slug,image_url,appointing_organization_id,address,metadata,geography_id,lat,lng,official_phone,official_email,geographies(name,official_name)")
        .eq("appointing_organization_id", governance.id)
        .order("name");
      if (error) throw error;
      const positions = data || [];
      if (!positions.length) return [];
      const { data: history, error: historyError } = await supabase.from("position_appointment").select("position_id").in("position_id", positions.map((item) => item.id));
      if (historyError) throw historyError;
      const counts = new Map();
      (history || []).forEach((item) => counts.set(item.position_id, (counts.get(item.position_id) || 0) + 1));
      return positions.map((item) => ({ ...item, appointment_history_count: counts.get(item.id) || 0 }));
    },
  });
  const appointmentIds = appointments.map((item) => item.appointment_id || item.id).filter(Boolean);
  const appointmentLocationsQuery = useQuery({
    queryKey: ["governance-appointment-locations", governance?.id, appointmentIds.join(",")],
    enabled: appointmentIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("position_appointment").select("id,geography_id,address,lat,lng,official_phone,official_email,geographies(name,official_name)").in("id", appointmentIds);
      if (error) throw error;
      return data || [];
    },
  });
  const appointmentLocations = new Map((appointmentLocationsQuery.data || []).map((item) => [item.id, item]));

  const organizationResourcesQuery = useQuery({
    queryKey: ["governance-organization-resources", governance?.id],
    enabled: Boolean(governance?.id),
    queryFn: async () => {
      const [attachmentsResult, linksResult] = await Promise.all([
        supabase.from("attachment").select("*").eq("governance_id", governance.id).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
        supabase.from("link").select("*").eq("governance_id", governance.id).order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
      ]);
      if (attachmentsResult.error) throw attachmentsResult.error;
      if (linksResult.error) throw linksResult.error;
      return { attachments: attachmentsResult.data || [], links: linksResult.data || [] };
    },
  });
  const organizationResources = organizationResourcesQuery.data || { attachments: [], links: [] };

  const { data: locationData } = useQuery({
    queryKey: ["governance-organization-map", governance?.id],
    enabled: Boolean(governance?.id),
    queryFn: async () => {
      const { data, error } = await supabase.from("governance").select("id,address,lat,lng,geom,geography_id,metadata,email,phone,geographies(name,official_name)").eq("id", governance.id).maybeSingle();
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
  // Render one row per current appointment. A position may legitimately have
  // multiple simultaneous appointments, so never collapse them to the latest row.
  const currentPositions = (positionsQuery.data || []).flatMap((position) => {
    const currentAppointments = organizationAppointments
      .filter((item) => item.position_id === position.id && !item.is_vacant && item.person_id);
    const sharedPosition = {
      ...position,
      position_id: position.id,
      position_name: position.name,
      position_slug: position.slug,
      position_avatar_url: position.image_url,
      organization_slug: governance?.slug,
      address: position.address || locationData?.address || null,
      lat: position.lat ?? position.metadata?.office_lat ?? locationData?.lat ?? locationData?.metadata?.office_lat ?? null,
      lng: position.lng ?? position.metadata?.office_lng ?? locationData?.lng ?? locationData?.metadata?.office_lng ?? null,
      geography_id: position.geography_id || locationData?.geography_id || null,
      geographies: position.geographies || locationData?.geographies || null,
      official_phone: position.official_phone || position.metadata?.official_phone || locationData?.phone || null,
      official_email: position.official_email || position.metadata?.official_email || locationData?.email || null,
    };
    if (!currentAppointments.length) {
      return [{
        ...sharedPosition,
        appointment_id: null,
        person_id: null,
        person_name: null,
        person_slug: null,
        person_avatar_url: null,
        started_at: null,
        ended_at: null,
        is_vacant: true,
      }];
    }
    return currentAppointments.map((appointment) => {
      const appointmentId = appointment.appointment_id || appointment.id || null;
      const appointmentLocation = appointmentLocations.get(appointmentId) || {};
      return {
        ...sharedPosition,
        ...appointment,
        ...appointmentLocation,
        appointment_address: appointmentLocation.address || appointment.address || null,
        appointment_geography_id: appointmentLocation.geography_id || appointment.geography_id || null,
        position_id: position.id,
        position_name: position.name,
        position_slug: position.slug,
        position_avatar_url: position.image_url,
        organization_slug: governance?.slug,
        appointment_id: appointmentId,
        address: appointmentLocation.address || appointment.address || position.address || locationData?.address || null,
        lat: appointmentLocation.lat ?? appointment.lat ?? position.lat ?? position.metadata?.office_lat ?? locationData?.lat ?? locationData?.metadata?.office_lat ?? null,
        lng: appointmentLocation.lng ?? appointment.lng ?? position.lng ?? position.metadata?.office_lng ?? locationData?.lng ?? locationData?.metadata?.office_lng ?? null,
        geography_id: appointmentLocation.geography_id || appointment.geography_id || position.geography_id || locationData?.geography_id || null,
        geographies: appointmentLocation.geographies || appointment.geographies || position.geographies || locationData?.geographies || null,
        official_phone: appointmentLocation.official_phone || appointment.official_phone || appointment.metadata?.official_phone || position.official_phone || position.metadata?.official_phone || locationData?.phone || null,
        official_email: appointmentLocation.official_email || appointment.official_email || appointment.metadata?.official_email || position.official_email || position.metadata?.official_email || locationData?.email || null,
        is_vacant: false,
      };
    });
  });
  const filteredPositions = currentPositions.filter((item) => {
    const needle = positionSearch.trim().toLowerCase();
    const matchesSearch = !needle || [item.position_name, item.person_name].some((value) => String(value || "").toLowerCase().includes(needle));
    const joined = item.started_at ? String(item.started_at).slice(0, 10) : "";
    return matchesSearch && (!joinedFrom || (joined && joined >= joinedFrom)) && (!joinedTo || (joined && joined <= joinedTo));
  });
  return (
    <div className="min-h-[calc(100vh-5.5rem)] bg-background">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid items-stretch gap-4 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-14 w-14 shrink-0 rounded-xl sm:h-16 sm:w-16">
                <AvatarImage src={root.image_url || undefined} alt="" />
                <AvatarFallback className="rounded-xl text-lg">{getGovernanceInitials(root.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{root.name}</h1>
                {root.short_name && <p className="mt-1 text-sm text-muted-foreground">{root.short_name}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {onViewTree && <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={onViewTree} aria-label="View organization tree"><Network className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>View organization tree</TooltipContent></Tooltip>}
                {canEdit && <GovernanceActionDropdown
                  onViewTree={() => onViewTree?.()}
                  onEdit={() => onEdit?.(governance)}
                  onPrimaryAction={() => onAddPosition?.(governance)}
                  primaryActionLabel="Add Position"
                  onManageRelations={() => onManageRelations?.(governance)}
                  onAddParent={() => onAddParent?.(governance)}
                  onAddChild={() => onAddChild?.(governance)}
                  onAddAddress={() => setOrganizationAddressOpen(true)}
                  onRemoveAddress={() => onRemoveAddress?.(governance)}
                  onAddGeography={() => setOrganizationGeographyOpen(true)}
                  onRemoveGeography={() => onRemoveGeography?.(governance)}
                  onManageLinks={() => setOrganizationLinksOpen(true)}
                  onDelete={() => onDelete?.(governance)}
                  hasAddress={Boolean(locationData?.address || root.address)}
                  hasGeography={Boolean(locationData?.geography_id || root.geography_id)}
                  hasLinks={organizationResources.links.length > 0}
                >
                />}
              </div>
            </div>
            {root.description && <p className="text-sm leading-6 text-muted-foreground">{root.description}</p>}
            <div className="space-y-3 text-sm">
              {(root.metadata?.official_email || root.official_email || root.email || locationData?.metadata?.official_email || locationData?.official_email || locationData?.email) && <a className="flex min-w-0 items-center gap-2 hover:underline" href={`mailto:${root.metadata?.official_email || root.official_email || root.email || locationData?.metadata?.official_email || locationData?.official_email || locationData?.email}`}><Mail className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="break-all">{root.metadata?.official_email || root.official_email || root.email || locationData?.metadata?.official_email || locationData?.official_email || locationData?.email}</span></a>}
              {(root.metadata?.official_phone || root.official_phone || root.phone || locationData?.metadata?.official_phone || locationData?.official_phone || locationData?.phone) && <a className="flex items-center gap-2 hover:underline" href={`tel:${root.metadata?.official_phone || root.official_phone || root.phone || locationData?.metadata?.official_phone || locationData?.official_phone || locationData?.phone}`}><Phone className="h-4 w-4 shrink-0 text-muted-foreground" /><span>{root.metadata?.official_phone || root.official_phone || root.phone || locationData?.metadata?.official_phone || locationData?.official_phone || locationData?.phone}</span></a>}
              {root.website && <a className="flex min-w-0 items-center gap-2 underline underline-offset-4 hover:text-foreground" href={root.website} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="break-all">{root.website}</span></a>}
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-2 border-t pt-3">
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => setOrganizationAddressOpen(true)} aria-label="View or edit organization address"><MapPin className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>{locationData?.address || root.address || "Add organization address"}</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => setOrganizationGeographyOpen(true)} aria-label="View or edit organization boundary"><Globe className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>{locationData?.geographies?.official_name || locationData?.geographies?.name || root.geographies?.official_name || root.geographies?.name || (locationData?.geography_id || root.geography_id ? "View or edit boundary" : "Add organization boundary")}</TooltipContent></Tooltip>
            </div>
          </div>
          <Card className="min-w-0 overflow-hidden">
            <CardContent className="h-full min-h-[360px] p-0 sm:min-h-[420px]">
              <div className="h-full min-h-[360px] w-full sm:min-h-[420px]">
                <LeafletMap
                  lat={Number(locationData?.lat ?? locationData?.metadata?.office_lat ?? locationData?.metadata?.lat) || 19.076}
                  lng={Number(locationData?.lng ?? locationData?.metadata?.office_lng ?? locationData?.metadata?.lng) || 72.8777}
                  showMarker={locationData?.lat != null || locationData?.metadata?.office_lat != null || locationData?.metadata?.lat != null}
                  zoom={12}
                  boundary={boundary || locationData?.geom || null}
                  markers={[]}
                  citizenMarker={{ image_url: governance?.image_url || null, label: governance?.name || "Organization" }}
                />
              </div>
              {!locationData?.geography_id && !locationData?.geom && <div className="border-t px-3 py-2 text-xs text-muted-foreground">No boundary linked yet.</div>}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 border-t pt-5 lg:grid-cols-2">
          <div className="min-w-0 space-y-3">
            <GovernanceResources title="Media and documents" governanceId={governance?.id} attachments={organizationResources.attachments} links={[]} canEdit={canEdit} onChanged={() => organizationResourcesQuery.refetch()} />
          </div>
          <div className="min-w-0 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Links</h2>
              <span className="inline-flex items-center gap-2">
                {canEdit ? <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => setOrganizationLinksOpen(true)} aria-label={`Manage links (${organizationResources.links.length})`}><Link2 className="h-4 w-4" />{organizationResources.links.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px]">{organizationResources.links.length}</span>}</Button></TooltipTrigger><TooltipContent>Manage links</TooltipContent></Tooltip> : <><Link2 className="h-4 w-4 text-muted-foreground" />{organizationResources.links.length > 0 && <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs">{organizationResources.links.length}</span>}</>}
              </span>
            </div>
            {organizationResources.links.length ? <PostLinks links={organizationResources.links} /> : <p className="text-sm text-muted-foreground">No links added yet.</p>}
          </div>
        </section>
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Positions</h2>
              <p className="text-sm text-muted-foreground">Only positions belonging directly to this organization.</p>
            </div>
            {canEdit && <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" onClick={() => onAddPosition?.(governance)}><Plus className="mr-2 h-4 w-4" />Add position</Button>
            </div>}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={positionSearch} onChange={(event) => setPositionSearch(event.target.value)} placeholder="Search positions or people…" className="pl-9" aria-label="Search positions or people" /></div>
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="justify-start gap-2 font-normal sm:w-[320px]">
                  <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {joinedFrom || joinedTo
                    ? `${joinedFrom ? new Date(joinedFrom + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Start date"} – ${joinedTo ? new Date(joinedTo + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "End date"}`
                    : "Filter joined date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={{
                    from: joinedFrom ? new Date(joinedFrom + "T12:00:00") : undefined,
                    to: joinedTo ? new Date(joinedTo + "T12:00:00") : undefined,
                  }}
                  onSelect={(range) => {
                    setJoinedFrom(range?.from ? `${range.from.getFullYear()}-${String(range.from.getMonth() + 1).padStart(2, "0")}-${String(range.from.getDate()).padStart(2, "0")}` : "");
                    setJoinedTo(range?.to ? `${range.to.getFullYear()}-${String(range.to.getMonth() + 1).padStart(2, "0")}-${String(range.to.getDate()).padStart(2, "0")}` : "");
                  }}
                  initialFocus
                />
                {(joinedFrom || joinedTo) && <div className="border-t p-2"><Button type="button" variant="ghost" size="sm" onClick={() => { setJoinedFrom(""); setJoinedTo(""); }}>Clear dates</Button></div>}
              </PopoverContent>
            </Popover>
          </div>
          {positionsQuery.isLoading ? <LoadingState label="Loading positions" /> : positionsQuery.error ? <ErrorState title="Unable to load positions" /> : filteredPositions.length ? (
            <div className="overflow-hidden rounded-lg border">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Current person</TableHead>
                      <TableHead className="hidden lg:table-cell">Phone</TableHead>
                      <TableHead className="hidden lg:table-cell">Email</TableHead>
                      <TableHead className="hidden md:table-cell">Address</TableHead>
                      <TableHead className="hidden xl:table-cell">Boundary</TableHead>
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
                                <div className="min-w-0">
                                  {positionHref ? <Link href={positionHref} className="block truncate font-medium hover:underline">{item.position_name || "Position"}</Link> : <span className="block truncate font-medium">{item.position_name || "Position"}</span>}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>{item.position_name || "Position"}</TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="max-w-[220px]">
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
                          <TableCell className="hidden max-w-[150px] lg:table-cell">
                            {(item.official_phone || item.metadata?.official_phone || item.position_metadata?.official_phone || item.position_official_phone || locationData?.metadata?.official_phone || locationData?.phone) ? <a className="flex items-center gap-2 truncate text-sm text-muted-foreground hover:underline" href={`tel:${item.official_phone || item.metadata?.official_phone || item.position_metadata?.official_phone || item.position_official_phone || locationData?.metadata?.official_phone || locationData?.phone}`}><Phone className="h-4 w-4 shrink-0" /><span className="truncate">{item.official_phone || item.metadata?.official_phone || item.position_metadata?.official_phone || item.position_official_phone || locationData?.metadata?.official_phone || locationData?.phone}</span></a> : <span className="text-sm text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="hidden max-w-[190px] lg:table-cell">
                            {(item.official_email || item.metadata?.official_email || item.position_metadata?.official_email || item.position_official_email || locationData?.metadata?.official_email || locationData?.email) ? <a className="flex items-center gap-2 truncate text-sm text-muted-foreground hover:underline" href={`mailto:${item.official_email || item.metadata?.official_email || item.position_metadata?.official_email || item.position_official_email || locationData?.metadata?.official_email || locationData?.email}`}><Mail className="h-4 w-4 shrink-0" /><span className="truncate">{item.official_email || item.metadata?.official_email || item.position_metadata?.official_email || item.position_official_email || locationData?.metadata?.official_email || locationData?.email}</span></a> : <span className="text-sm text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {item.address ? <Tooltip><TooltipTrigger asChild><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`} target="_blank" rel="noreferrer" aria-label={`Open address for ${item.position_name || "position"} in Google Maps`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"><MapPin className="h-4 w-4" /></a></TooltipTrigger><TooltipContent>{item.address}</TooltipContent></Tooltip> : <span className="text-sm text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="hidden max-w-[190px] xl:table-cell">
                            {(item.geographies?.official_name || item.geographies?.name) ? <Tooltip><TooltipTrigger asChild><button type="button" onClick={() => { setAppointmentLocationRecord(item); setAppointmentGeographyOpen(true); }} className="max-w-full truncate text-left text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">{item.geographies.official_name || item.geographies.name}</button></TooltipTrigger><TooltipContent>View or edit boundary: {item.geographies.official_name || item.geographies.name}</TooltipContent></Tooltip> : <span className="text-sm text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{vacant || !item.started_at ? "—" : formatGovernanceDate(item.started_at)}</TableCell>
                          <TableCell>
                            {canEdit && item.appointment_id ? <GovernanceAppointmentDeleteButton appointmentId={item.appointment_id} personName={item.person_name} positionName={item.position_name} onAssignPerson={() => { setAppointmentRecord(null); setAppointmentPositionId(item.position_id); setAppointmentDialogOpen(true); }} onEdit={() => { setAppointmentRecord(item); setAppointmentPositionId(item.position_id); setAppointmentDialogOpen(true); }} onManageAddress={() => { setAppointmentLocationRecord(item); setAppointmentAddressOpen(true); }} hasAddress={Boolean(item.appointment_address)} onRemoveAddress={async () => { const { error } = await supabase.rpc("update_position_appointment_location", { p_appointment_id: item.appointment_id, p_address: null, p_lat: null, p_lng: null }); if (error) { toast.error(error.message || "Unable to remove appointment address"); return; } toast.success("Appointment address removed"); await query.refetch(); await positionsQuery.refetch(); await appointmentLocationsQuery.refetch(); }} onManageGeography={() => { setAppointmentLocationRecord(item); setAppointmentGeographyOpen(true); }} hasGeography={Boolean(item.appointment_geography_id)} onRemoveGeography={async () => { const { error } = await supabase.rpc("set_position_appointment_geography", { p_appointment_id: item.appointment_id, p_geography_id: null }); if (error) { toast.error(error.message || "Unable to remove appointment boundary"); return; } toast.success("Appointment boundary removed"); await query.refetch(); await positionsQuery.refetch(); await appointmentLocationsQuery.refetch(); }} onDeleted={async () => { await query.refetch(); await positionsQuery.refetch(); await appointmentLocationsQuery.refetch(); }} /> : canEdit ? <GovernanceCardActions onPrimaryAction={() => { setAppointmentRecord(null); setAppointmentPositionId(item.position_id); setAppointmentDialogOpen(true); }} primaryActionLabel="Assign person" onDelete={item.appointment_history_count ? undefined : () => onDeletePosition?.(item)} entityLabel="position"><span className="block h-8 w-8" aria-hidden="true" /></GovernanceCardActions> : null}
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
        <GovernanceResourceDialogs
          entity={governance ? { ...governance, address: locationData?.address || governance.address, lat: locationData?.lat, lng: locationData?.lng, geography_id: locationData?.geography_id } : null}
          entityType="governance"
          addressOpen={organizationAddressOpen}
          onAddressOpenChange={setOrganizationAddressOpen}
          geographyOpen={organizationGeographyOpen}
          onGeographyOpenChange={setOrganizationGeographyOpen}
          linksOpen={organizationLinksOpen}
          onLinksOpenChange={setOrganizationLinksOpen}
          onSaved={async () => { await query.refetch(); await positionsQuery.refetch(); await appointmentLocationsQuery.refetch(); await organizationResourcesQuery.refetch(); }}
        />
        <GovernanceResourceDialogs
          entity={appointmentLocationRecord ? {
            id: appointmentLocationRecord.appointment_id || appointmentLocationRecord.id,
            name: appointmentLocationRecord.person_name ? appointmentLocationRecord.person_name + "'s appointment" : appointmentLocationRecord.position_name || "Appointment",
            address: appointmentLocationRecord.address || "",
            lat: appointmentLocationRecord.lat,
            lng: appointmentLocationRecord.lng,
            geography_id: appointmentLocationRecord.geography_id || null,
          } : null}
          entityType="appointment"
          addressOpen={appointmentAddressOpen}
          onAddressOpenChange={setAppointmentAddressOpen}
          geographyOpen={appointmentGeographyOpen}
          onGeographyOpenChange={setAppointmentGeographyOpen}
          onSaved={async () => { await query.refetch(); await positionsQuery.refetch(); await appointmentLocationsQuery.refetch(); }}
        />
        {canEdit && <GovernanceAppointmentDialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen} mode="position" organizationId={governance?.id} positionId={appointmentPositionId} record={appointmentRecord} onSaved={async () => { await query.refetch(); await positionsQuery.refetch(); }} />}
      </div>
    </div>
  );
}
