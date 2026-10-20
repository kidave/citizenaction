import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

import GovernanceCardActions from "@/components/governance/GovernanceCardActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getGovernanceHref, getGovernanceInitials, getGovernanceName } from "@/utils/governance";
import GovernancePositionSheet from "@/components/governance/GovernancePositionSheet";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";
import { useGovernanceCrud } from "@/hooks/governance/useGovernanceCrud";
import AddGeographyDialog from "@/components/geography/AddGeographyDialog";
import GovernanceResourceDialogs from "@/components/governance/GovernanceResourceDialogs";
import { useGovernanceGeographyMutation } from "@/hooks/geography/useGovernanceGeography";
import LoadingState from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/empty-state";
import ErrorState from "@/components/ui/error-state";

export default function PositionDirectory({
  geographyId = null,
  selectionMode = null,
  selectedIds = [],
  selectedId = null,
  onSelect,
  canManage = false,
  search: externalSearch,
  organizationId = null,
  createRequest = null,
}) {
  const [internalSearch, setInternalSearch] = useState("");
  const search = externalSearch ?? internalSearch;

  const [editingRecord, setEditingRecord] = useState(null);
  const [geographyRecord, setGeographyRecord] = useState(null);
  const [resourceRecord, setResourceRecord] = useState(null);
  const [addressOpen, setAddressOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);
  const queryClient = useQueryClient();
  const { deletePosition: removePosition } = useGovernanceCrud();
  const { removeGeography } = useGovernanceGeographyMutation();





  const query = useGovernanceDirectory({
    tab: "positions",
    search,
    geographyId,
    organizationId,
  });


  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (createRequest?.tab !== "positions" || !createRequest.token) return;
    setEditingRecord(null);
    setDialogOpen(true);
  }, [createRequest?.token, createRequest?.tab]);

  const data = Array.isArray(query.data) ? query.data : [];
  const resourceIds = useMemo(() => data.map((item) => item.id), [data]);
  const resourceQuery = useQuery({
    queryKey: ["position-directory-resources", resourceIds],
    enabled: canManage && resourceIds.length > 0,
    queryFn: async () => {
      const [{ data: positionRows, error: positionError }, { data: linkRows, error: linkError }] = await Promise.all([
        supabase.from("position").select("id,address,metadata,geography_id").in("id", resourceIds),
        supabase.from("link").select("position_id").in("position_id", resourceIds),
      ]);
      if (positionError) throw positionError;
      if (linkError) throw linkError;
      const linked = new Set((linkRows || []).map((row) => row.position_id));
      return (positionRows || []).reduce((acc, row) => {
        acc[row.id] = { address: row.address || null, geography_id: row.geography_id || null, hasLinks: linked.has(row.id), metadata: row.metadata || {} };
        return acc;
      }, {});
    },
  });
  const dataWithResources = useMemo(() => data.map((entity) => ({ ...entity, ...(resourceQuery.data?.[entity.id] || {}) })), [data, resourceQuery.data]);
  const selectedSet = useMemo(
    () =>
      new Set(
        selectedIds.length ? selectedIds : selectedId ? [selectedId] : [],
      ),
    [selectedIds, selectedId],
  );

  const openEdit = (entity) => {
    setEditingRecord(entity);
    setDialogOpen(true);
  };

  const openGeography = (entity) => setGeographyRecord(entity);
  const openResource = (entity, resource) => {
    setResourceRecord(entity);
    setAddressOpen(resource === "address");
    setLinksOpen(resource === "links");
  };

  const removePositionGeography = async (entity) => {
    if (!entity?.id) return;
    try {
      await removeGeography({ entityId: entity.id, entityType: "position" });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["governance-directory"] }),
        queryClient.invalidateQueries({ queryKey: ["position-directory-resources"] }),
      ]);
    } catch (error) {
      const { toast } = await import("sonner");
      toast.error(error?.message || "Unable to remove geography");
    }
  };


  return (
    <div className="space-y-4">
      {query.isLoading && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <LoadingState />
        </div>
      )}
      {query.error && (
        <ErrorState title="Unable to load positions" />
      )}
      {!query.isLoading &&
        !query.error &&
        (data.length ? (
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader><TableRow><TableHead>Position</TableHead><TableHead>Current person</TableHead><TableHead className="w-12"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
              <TableBody>
                {dataWithResources.map((entity) => {
                  const name = getGovernanceName(entity);
                  const href = getGovernanceHref({ ...entity, tab: "positions" });
                  const holder = entity.current_holder_name || entity.person_name || entity.current_person_name || null;
                  const holderImage = entity.current_holder_image_url || entity.person_avatar_url || null;
                  const vacant = !holder;
                  return (
                    <TableRow key={entity.id} className={selectedSet.has(entity.id) ? "bg-primary/5" : ""}>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0 rounded-md"><AvatarImage src={entity.image_url || undefined} alt={name}/><AvatarFallback className="rounded-md">{getGovernanceInitials(name)}</AvatarFallback></Avatar>
                          <div className="min-w-0">
                            {href ? <Link href={href} className="block truncate font-medium hover:underline">{name}</Link> : <span className="font-medium">{name}</span>}
                            {entity.code && <div className="truncate text-xs text-muted-foreground">{entity.code}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar className="h-8 w-8 shrink-0 rounded-md"><AvatarImage src={vacant ? (entity.organization_image_url || entity.organization_logo_url || undefined) : holderImage || undefined} alt=""/><AvatarFallback className="rounded-md text-xs">{getGovernanceInitials(vacant ? entity.organization_name || name : holder)}</AvatarFallback></Avatar>
                          <span className={`truncate text-sm ${vacant ? "text-muted-foreground" : ""}`}>{vacant ? "Vacant — no current person assigned" : holder}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {selectionMode ? <button type="button" className="text-xs underline" onClick={() => onSelect?.(entity)}>{selectedSet.has(entity.id) ? "Selected" : "Select"}</button> : canManage && <GovernanceCardActions
                          onEdit={() => openEdit(entity)}
                          editLabel="Edit Position"
                          onAddGeography={() => openGeography(entity)}
                          onRemoveGeography={entity.geography_id ? () => removePositionGeography(entity) : undefined}
                          onAddAddress={() => openResource(entity, "address")}
                          onRemoveAddress={entity.address ? async () => { const { error } = await supabase.from("position").update({ address: null }).eq("id", entity.id); if (error) { toast.error(error.message); return; } await queryClient.invalidateQueries({ queryKey: ["governance-directory"] }); } : undefined}
                          onManageLinks={() => openResource(entity, "links")}
                          onDelete={() => removePosition(entity)}
                          hasAddress={Boolean(entity.address)}
                          hasGeography={Boolean(entity.geography_id)}
                          hasLinks={Boolean(entity.hasLinks)}
                          entityLabel="position"
                        ><span className="block h-8 w-8" aria-hidden="true" /></GovernanceCardActions>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>        ) : (
          <EmptyState title="No positions found" description="Try another search." />
        ))}

      {canManage && geographyRecord && (
        <AddGeographyDialog
          open={Boolean(geographyRecord)}
          onOpenChange={(value) => {
            if (!value) setGeographyRecord(null);
          }}
          entityId={geographyRecord.id}
          entityType="position"
          entityName={geographyRecord.name}
          onSaved={async () => {
            await queryClient.invalidateQueries({ queryKey: ["governance-directory"] });
          }}
        />
      )}

      {canManage && resourceRecord && (
        <GovernanceResourceDialogs
          entity={resourceRecord}
          entityType="position"
          addressOpen={addressOpen}
          onAddressOpenChange={(value) => {
            setAddressOpen(value);
            if (!value && !linksOpen) setResourceRecord(null);
          }}
          linksOpen={linksOpen}
          onLinksOpenChange={(value) => {
            setLinksOpen(value);
            if (!value && !addressOpen) setResourceRecord(null);
          }}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["position-directory-resources"] })}
        />
      )}

      {canManage && (
        <GovernancePositionSheet
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          record={editingRecord}
          defaultOrganizationId={organizationId}
          onSaved={() =>
            queryClient.invalidateQueries({
              queryKey: ["governance-directory"],
            })
          }
        />
      )}
    </div>
  );
}
