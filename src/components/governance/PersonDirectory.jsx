import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import GovernancePersonSheet from "@/components/governance/GovernancePersonSheet";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";
import { useGovernanceCrud } from "@/hooks/governance/useGovernanceCrud";
import { useGovernanceOrganizations } from "@/hooks/governance/useGovernanceOrganizations";
import { getGovernanceLabel } from "@/utils/governance";
import LoadingState from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/empty-state";
import ErrorState from "@/components/ui/error-state";

export default function PersonDirectory({
  geographyId = null,
  selectionMode = null,
  selectedIds = [],
  selectedId = null,
  onSelect,
  organizationId: controlledOrganizationId = null,
  canManage = false,
}) {
  const [search, setSearch] = useState("");
  const [organizationId, setOrganizationId] = useState(
    controlledOrganizationId,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const queryClient = useQueryClient();
  const { deletePerson } = useGovernanceCrud();
  const effectiveOrganizationId = controlledOrganizationId ?? organizationId;

  const organizationsQuery = useGovernanceOrganizations();

  const options = useMemo(
    () =>
      (organizationsQuery.data || []).map((item) => ({
        value: item.id,
        label: getGovernanceLabel(item),
        searchValue: `${item.name || ""} ${item.short_name || ""}`,
      })),
    [organizationsQuery.data],
  );

  const query = useGovernanceDirectory({
    tab: "people",
    search,
    organizationId: effectiveOrganizationId,
    geographyId,
  });
  const data = Array.isArray(query.data) ? query.data : [];
  const selectedSet = useMemo(
    () =>
      new Set(
        selectedIds.length ? selectedIds : selectedId ? [selectedId] : [],
      ),
    [selectedIds, selectedId],
  );

  const openCreate = () => {
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const openEdit = (entity) => {
    setEditingRecord(entity);
    setDialogOpen(true);
  };

  const deletePerson = async (entity) => {
    try {
      const { error } = await supabase.rpc("delete_person", {
        p_person_id: entity.id,
      });
      if (error) throw error;
      toast.success("Person deleted");
      await queryClient.invalidateQueries({
        queryKey: ["governance-directory"],
      });
    } catch (error) {
      toast.error(error?.message || "Unable to delete person");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_18rem_auto]">
        {/* Search */}
        <div className="relative col-span-2 min-w-0 sm:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            className="h-9 pl-9"
            placeholder="Search people..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {/* Organization filter */}
        <SearchableSelect
          value={effectiveOrganizationId}
          onValueChange={setOrganizationId}
          options={options}
          placeholder="All organizations"
          searchPlaceholder="Search organizations..."
          emptyText="No organizations found."
          className="min-w-0"
        />

        {/* Add */}
        {canManage && (
          <Button type="button" className="h-9 shrink-0" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add person
          </Button>
        )}
      </div>

      {query.isLoading && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <LoadingState />
        </div>
      )}
      {query.error && (
        <ErrorState title="Unable to load people" />
      )}
      {!query.isLoading &&
        !query.error &&
        (data.length ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((entity) => (
              <GovernanceDirectoryCard
                key={entity.id}
                entity={entity}
                tab="people"
                selectionMode={selectionMode}
                selected={selectedSet.has(entity.id)}
                onSelect={onSelect}
                onEdit={canManage ? () => openEdit(entity) : undefined}
                onDelete={canManage ? () => removePerson(entity) : undefined}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No people found" description="Try another search or filter." />
        ))}

      {canManage && (
        <GovernancePersonSheet
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
