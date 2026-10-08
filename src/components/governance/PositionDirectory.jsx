import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

import { Input } from "@/components/ui/input";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
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
}) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
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
  });
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
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        {/* Search */}
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            className="h-9 pl-9"
            placeholder="Search positions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

      </div>

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
          <div className="grid grid-cols-2 overflow-hidden rounded-md border-x border-t sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 [&>*]:min-w-0 [&>*]:border-t [&>*]:border-r [&>*]:border-border sm:[&>*:nth-child(3n)]:border-r-0 lg:[&>*:nth-child(3n)]:border-r lg:[&>*:nth-child(4n)]:border-r-0 xl:[&>*:nth-child(4n)]:border-r xl:[&>*:nth-child(5n)]:border-r-0 2xl:[&>*:nth-child(5n)]:border-r 2xl:[&>*:nth-child(6n)]:border-r-0">
            {dataWithResources.map((entity) => (
              <GovernanceDirectoryCard
                key={entity.id}
                entity={entity}
                tab="positions"
                selectionMode={selectionMode}
                selected={selectedSet.has(entity.id)}
                onSelect={onSelect}
                onEdit={canManage ? () => openEdit(entity) : undefined}
                onAddGeography={canManage ? () => openGeography(entity) : undefined}
                onRemoveGeography={canManage && entity.geography_id ? () => removePositionGeography(entity) : undefined}
                onAddAddress={canManage ? () => openResource(entity, "address") : undefined}
                onRemoveAddress={canManage && entity.address ? async () => { const { error } = await supabase.from("position").update({ address: null }).eq("id", entity.id); if (error) { toast.error(error.message); return; } await refresh(); } : undefined}
                onManageLinks={canManage ? () => openResource(entity, "links") : undefined}
                hasAddress={Boolean(entity.address)}
                hasLinks={Boolean(entity.hasLinks)}
                hasGeography={Boolean(entity.geography_id)}
                onDelete={canManage ? () => removePosition(entity) : undefined}
              />
            ))}
          </div>
        ) : (
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

      {canManage && editingRecord && (
        <GovernancePositionSheet
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          record={editingRecord}
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
