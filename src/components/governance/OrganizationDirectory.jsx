import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import GovernanceEntityModal from "@/components/governance/GovernanceEntityModal";
import GovernanceRelationDialog from "@/components/governance/GovernanceRelationDialog";
import GovernanceOrganizationSheet from "@/components/governance/GovernanceOrganizationSheet";
import GovernancePositionSheet from "@/components/governance/GovernancePositionSheet";
import GovernanceOrganizationResourceDialogs from "@/components/governance/GovernanceOrganizationResourceDialogs";
import LoadingState from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/empty-state";
import ErrorState from "@/components/ui/error-state";
import { useGovernanceCatalog } from "@/hooks/governance/useGovernanceCatalog";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";
import { useGovernanceCrud } from "@/hooks/governance/useGovernanceCrud";
import { useGovernanceGeographyMutation } from "@/hooks/geography/useGovernanceGeography";
import { getGovernanceRoute, GOVERNANCE_TYPES, formatGovernanceFilterType } from "@/utils/governance";


export default function OrganizationDirectory({
  geographyId = null,
  selectionMode = null,
  selectedIds = [],
  selectedId = null,
  onSelect,
  excludeIds = [],
  onlyWithoutParent = false,
  canManage = false,
  search: externalSearch,
  type: externalType,
  categoryId: externalCategoryId,
  createRequest = null,
}) {
  const router = useRouter();
  const [internalSearch, setInternalSearch] = useState("");
  const [internalType, setInternalType] = useState("all");
  const [internalCategoryId, setInternalCategoryId] = useState("all");
  const search = externalSearch ?? internalSearch;
  const type = externalType ?? internalType;
  const categoryId = externalCategoryId ?? internalCategoryId;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [positionOpen, setPositionOpen] = useState(false);
  const [positionOrganizationId, setPositionOrganizationId] = useState(null);
  const { categories = [], isLoading: categoriesLoading } =
    useGovernanceCatalog({ enabled: true });
  const queryClient = useQueryClient();
  const { deleteOrganization } = useGovernanceCrud();
  const { removeGeography } = useGovernanceGeographyMutation();
  const [editingRecord, setEditingRecord] = useState(null);
  const [resourceRecord, setResourceRecord] = useState(null);
  const [addressOpen, setAddressOpen] = useState(false);
  const [geographyOpen, setGeographyOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [relationRecord, setRelationRecord] = useState(null);
  const [relationOpen, setRelationOpen] = useState(false);
  const [relationMode, setRelationMode] = useState("edit-relations");

  useEffect(() => {
    if (createRequest?.tab !== "organizations" || !createRequest.token) return;
    setEditingRecord(null);
    setDialogOpen(true);
  }, [createRequest?.tab, createRequest?.token]);

  const query = useGovernanceDirectory({
    tab: "organizations",
    search,
    type,
    categoryId,
    geographyId,
  });
  const excluded = useMemo(() => new Set(excludeIds), [excludeIds]);
  const data = useMemo(
    () =>
      Array.isArray(query.data)
        ? query.data.filter((item) => !excluded.has(item.id) && (!onlyWithoutParent || !item.parent_id))
        : [],
    [query.data, excluded, onlyWithoutParent],
  );
  const selectedSet = useMemo(
    () =>
      new Set(
        selectedIds.length ? selectedIds : selectedId ? [selectedId] : [],
      ),
    [selectedIds, selectedId],
  );

  const resourceIds = useMemo(() => data.map((item) => item.id), [data]);
  const resourceSummary = useQuery({
    queryKey: ["governance-directory-resources", resourceIds],
    enabled: canManage && resourceIds.length > 0,
    queryFn: async () => {
      const [{ data: governanceRows, error: governanceError }, { data: linkRows, error: linkError }] =
        await Promise.all([
          supabase
            .from("governance")
            .select("id,address,metadata,geography_id")
            .in("id", resourceIds),
          supabase
            .from("link")
            .select("governance_id")
            .in("governance_id", resourceIds),
        ]);

      if (governanceError) throw governanceError;
      if (linkError) throw linkError;

      const linksByGovernance = new Set((linkRows || []).map((row) => row.governance_id));
      return (governanceRows || []).reduce((acc, row) => {
        const metadata = row.metadata || {};
        acc[row.id] = {
          address: row.address || null,
          geography_id: row.geography_id || null,
          hasLinks: linksByGovernance.has(row.id),
          metadata,
        };
        return acc;
      }, {});
    },
  });

  const dataWithResources = useMemo(
    () =>
      data.map((entity) => ({
        ...entity,
        ...(resourceSummary.data?.[entity.id] || {}),
      })),
    [data, resourceSummary.data],
  );

  const openView = async (entity) => {
    const route = getGovernanceRoute(entity, "organization");
    if (!route) return;
    await router.push(route);
  };
  const openTree = async (entity) => {
    const route = getGovernanceRoute(entity, "tree");
    if (!route) return;
    await router.push(route);
  };

  const openEdit = (entity) => { setEditingRecord(entity); setDialogOpen(true); };
  const openAddPosition = (entity) => { if (!entity?.id) return; setPositionOrganizationId(entity.id); setPositionOpen(true); };
  const openResource = (entity, resource) => {
    setResourceRecord(entity);
    setAddressOpen(resource === "address");
    setGeographyOpen(resource === "geography");
    setLinksOpen(resource === "links");
  };

  const openRelations = (entity, mode = "edit-relations") => {
    if (!entity?.id) return;
    setViewRecord(null);
    setRelationRecord(entity);
    setRelationOpen(true);
    setRelationMode(mode);
  };

  const removeAddress = async (entity) => {
    const { error } = await supabase.rpc("update_governance_location", {
      p_governance_id: entity.id,
      p_address: null,
      p_lat: null,
      p_lng: null,
    });
    if (error) {
      const { toast } = await import("sonner");
      toast.error(error.message || "Unable to remove address");
      return;
    }
    await refresh();
    const { toast } = await import("sonner");
    toast.success("Address removed");
  };

  const removeGeographyRecord = async (entity) => {
    try {
      await removeGeography({ governanceId: entity.id });
      await refresh();
      const { toast } = await import("sonner");
      toast.success("Geography removed");
    } catch (error) {
      const { toast } = await import("sonner");
      toast.error(error?.message || "Unable to remove geography");
    }
  };

  const deleteOrganizationRecord = async (entity) => {
    try {
      await deleteOrganization(entity.id);
      await refresh();
    } catch (error) {
      const { toast } = await import("sonner");
      toast.error(error?.message || "Unable to delete organization");
    }
  };

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["governance-directory"] }),
      queryClient.invalidateQueries({
        queryKey: ["governance-organizations"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["governance-directory-resources"],
      }),
    ]);
  };

  return (
    <div className="space-y-4">
      {query.isLoading && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <LoadingState />
        </div>
      )}
      {query.error && (
        <ErrorState title="Unable to load organizations" />
      )}
      {!query.isLoading &&
        !query.error &&
        (data.length ? (
          <div className="grid grid-cols-2 overflow-hidden rounded-md border-x border-t sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 [&>*]:min-w-0 [&>*]:border-t [&>*]:border-r [&>*]:border-border sm:[&>*:nth-child(3n)]:border-r-0 lg:[&>*:nth-child(3n)]:border-r lg:[&>*:nth-child(4n)]:border-r-0 xl:[&>*:nth-child(4n)]:border-r xl:[&>*:nth-child(5n)]:border-r-0 2xl:[&>*:nth-child(5n)]:border-r 2xl:[&>*:nth-child(6n)]:border-r-0">
            {dataWithResources.map((entity) => (
              <GovernanceDirectoryCard
                key={entity.id}
                entity={entity}
                tab="organizations"
                selectionMode={selectionMode}
                selected={selectedSet.has(entity.id)}
                onSelect={onSelect}
                onOpen={() => setViewRecord(entity)}
                onView={() => openView(entity)}
                onViewTree={() => openTree(entity)}
                onEdit={canManage ? () => openEdit(entity) : undefined}
                onPrimaryAction={canManage ? () => openAddPosition(entity) : undefined}
                primaryActionLabel="Add Position"
                onManageRelations={canManage ? () => openRelations(entity, "edit-relations") : undefined}
                onAddParent={canManage ? () => openRelations(entity, "add-parent") : undefined}
                onAddChild={canManage ? () => openRelations(entity, "add-child") : undefined}
                hasParent={Boolean(entity.parent_id)}
                onAddAddress={canManage ? () => openResource(entity, "address") : undefined}
                onRemoveAddress={canManage ? () => removeAddress(entity) : undefined}
                onAddGeography={canManage ? () => openResource(entity, "geography") : undefined}
                onRemoveGeography={canManage ? () => removeGeographyRecord(entity) : undefined}
                onManageLinks={canManage ? () => openResource(entity, "links") : undefined}
                hasAddress={Boolean(entity.address)}
                hasGeography={Boolean(entity.geography_id)}
                hasLinks={Boolean(entity.hasLinks)}
                onDelete={canManage ? () => deleteOrganizationRecord(entity) : undefined}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No organizations found" description="Try another search or filter." />
        ))}

      {canManage && resourceRecord && (
        <GovernanceOrganizationResourceDialogs
          entity={resourceRecord}
          addressOpen={addressOpen}
          onAddressOpenChange={(value) => {
            setAddressOpen(value);
            if (!value && !geographyOpen && !linksOpen) setResourceRecord(null);
          }}
          geographyOpen={geographyOpen}
          onGeographyOpenChange={(value) => {
            setGeographyOpen(value);
            if (!value && !addressOpen && !linksOpen) setResourceRecord(null);
          }}
          linksOpen={linksOpen}
          onLinksOpenChange={(value) => {
            setLinksOpen(value);
            if (!value && !addressOpen && !geographyOpen) setResourceRecord(null);
          }}
          onSaved={refresh}
        />
      )}

      {viewRecord && (
        <GovernanceEntityModal
          open={Boolean(viewRecord)}
          onOpenChange={(value) => { if (!value) setViewRecord(null); }}
          entity={viewRecord}
          parent={null}
          childEntities={[]}
          canEdit={canManage}
          categories={categories}
          onSelect={(entity) => setViewRecord(entity)}
          onSaved={refresh}
          onDeleted={refresh}
          onView={canManage ? () => openView(viewRecord) : undefined}
          onViewTree={canManage ? () => openTree(viewRecord) : undefined}
          onEdit={canManage ? () => { setViewRecord(null); openEdit(viewRecord); } : undefined}
          onPrimaryAction={canManage ? () => openAddPosition(viewRecord) : undefined}
          primaryActionLabel="Add Position"
          onAddRelation={canManage ? () => openRelations(viewRecord, "add-parent") : undefined}
          onAddParent={canManage ? () => openRelations(viewRecord, "add-parent") : undefined}
          onAddChild={canManage ? () => openRelations(viewRecord, "add-child") : undefined}
          onEditRelations={canManage ? () => openRelations(viewRecord) : undefined}
          onManageRelations={canManage ? () => openRelations(viewRecord, "edit-relations") : undefined}
          onAddAddress={canManage ? () => openResource(viewRecord, "address") : undefined}
          onRemoveAddress={canManage ? () => removeAddress(viewRecord) : undefined}
          onManageLinks={canManage ? () => openResource(viewRecord, "links") : undefined}
          onAddGeography={canManage ? () => openResource(viewRecord, "geography") : undefined}
          onChangeGeography={canManage ? () => openResource(viewRecord, "geography") : undefined}
          onRemoveGeography={canManage ? () => removeGeographyRecord(viewRecord) : undefined}
        />
      )}

      {relationRecord && canManage && (
        <GovernanceRelationDialog
          open={relationOpen}
          onOpenChange={(value) => { setRelationOpen(value); if (!value) setRelationRecord(null); }}
          mode={relationMode}
          sourceEntity={relationRecord}
          childEntities={data.filter((item) => item.parent_id === relationRecord.id)}
          categories={categories}
          onCompleted={refresh}
        />
      )}

      {canManage && (
        <GovernancePositionSheet
          open={positionOpen}
          onOpenChange={(value) => { setPositionOpen(value); if (!value) setPositionOrganizationId(null); }}
          defaultOrganizationId={positionOrganizationId}
          onSaved={refresh}
        />
      )}

      {canManage && (
        <GovernanceOrganizationSheet
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          categories={categories}
          record={editingRecord}
          onSaved={refresh}
          onAddressAction={() => editingRecord && openResource(editingRecord, "address")}
          onGeographyAction={() => editingRecord && openResource(editingRecord, "geography")}
          onLinksAction={() => editingRecord && openResource(editingRecord, "links")}
        />
      )}
    </div>
  );
}
