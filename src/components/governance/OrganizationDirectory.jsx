import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Plus, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import GovernanceEntityModal from "@/components/governance/GovernanceEntityModal";
import GovernanceRelationDialog from "@/components/governance/GovernanceRelationDialog";
import GovernanceOrganizationSheet from "@/components/governance/GovernanceOrganizationSheet";
import GovernanceOrganizationResourceDialogs from "@/components/governance/GovernanceOrganizationResourceDialogs";
import LoadingState from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/empty-state";
import ErrorState from "@/components/ui/error-state";
import { useGovernanceCatalog } from "@/hooks/governance/useGovernanceCatalog";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";
import { useGovernanceCrud } from "@/hooks/governance/useGovernanceCrud";
import { useGovernanceGeographyMutation } from "@/hooks/geography/useGovernanceGeography";
import {
  GOVERNANCE_TYPES,
  formatGovernanceFilterType,
  getGovernanceHref,
} from "@/utils/governance;

export default function OrganizationDirectory({
  geographyId = null,
  selectionMode = null,
  selectedIds = [],
  selectedId = null,
  onSelect,
  excludeIds = [],
  onlyWithoutParent = false,
  canManage = false,
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
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
    [query.data, excluded],
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

  const openView = (entity) => {
    const href = getGovernanceHref(entity);
    if (!href) return;
    router.push({ pathname: href, query: { view: "organization" } });
  };
  const openTree = (entity) => {
    const href = getGovernanceHref(entity);
    if (!href) return;
    router.push({ pathname: href, query: { view: "tree" } });
  };

  const openEdit = (entity) => { setEditingRecord(entity); setDialogOpen(true); };
  const openResource = (entity, resource) => {
    setResourceRecord(entity);
    setAddressOpen(resource === "address");
    setGeographyOpen(resource === "geography");
    setLinksOpen(resource === "links");
  };

  const openRelations = (entity) => {
    if (!entity?.id) return;
    setViewRecord(null);
    setRelationRecord(entity);
    setRelationOpen(true);
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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_12rem_auto]">
        {/* Search */}
        <div className="relative col-span-2 min-w-0 sm:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            className="h-9 pl-9"
            placeholder="Search organizations..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {/* Type */}
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9 min-w-0">
            <SelectValue placeholder="Type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All types</SelectItem>

            {GOVERNANCE_TYPES.map((item) => (
              <SelectItem key={item} value={item}>
                {formatGovernanceFilterType(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category */}
        <Select
          value={categoryId}
          onValueChange={setCategoryId}
          disabled={categoriesLoading}
        >
          <SelectTrigger className="h-9 min-w-0">
            <SelectValue placeholder="Category" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>

            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add */}
        {canManage && (
          <Button
            type="button"
            className="h-9 shrink-0"
            onClick={() => { setEditingRecord(null); setDialogOpen(true); }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add organization
          </Button>
        )}
      </div>

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
                onManageRelations={canManage ? () => openRelations(entity) : undefined}
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
          onEdit={canManage ? () => { setViewRecord(null); openEdit(viewRecord); } : undefined}
          onAddRelation={canManage ? () => openRelations(viewRecord) : undefined}
          onEditRelations={canManage ? () => openRelations(viewRecord) : undefined}
          onManageRelations={canManage ? () => openRelations(viewRecord) : undefined}
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
          mode="edit-relations"
          sourceEntity={relationRecord}
          childEntities={data.filter((item) => item.parent_id === relationRecord.id)}
          categories={categories}
          onCompleted={refresh}
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
