import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import GovernancePersonDialog from "@/components/governance/GovernancePersonDialog";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";
import { supabase } from "@/lib/supabase/client";
import { getGovernanceLabel } from "@/utils/governance";

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
  const [organizationId, setOrganizationId] = useState(controlledOrganizationId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const queryClient = useQueryClient();
  const effectiveOrganizationId = controlledOrganizationId ?? organizationId;

  const organizationsQuery = useQuery({
    queryKey: ["governance-directory-organization-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance")
        .select("id,name,short_name,slug,type,status,image_url,current_holder_name,current_holder_image_url")
        .neq("status", "deleted")
        .order("name")
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

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
    () => new Set(selectedIds.length ? selectedIds : selectedId ? [selectedId] : []),
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
      const { error } = await supabase.rpc("delete_person", { p_person_id: entity.id });
      if (error) throw error;
      toast.success("Person deleted");
      await queryClient.invalidateQueries({ queryKey: ["governance-directory"] });
    } catch (error) {
      toast.error(error?.message || "Unable to delete person");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-9"
            placeholder="Search people..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <SearchableSelect
          value={effectiveOrganizationId}
          onValueChange={setOrganizationId}
          options={options}
          placeholder="All organizations"
          searchPlaceholder="Search organizations..."
          emptyText="No organizations found."
          className="sm:w-72"
        />
        {canManage && (
          <Button type="button" className="shrink-0" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add person
          </Button>
        )}
      </div>

      {query.isLoading && (
        <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
          Loading people...
        </div>
      )}
      {query.error && (
        <div className="flex min-h-[30vh] items-center justify-center text-sm text-destructive">
          Failed to load people.
        </div>
      )}
      {!query.isLoading && !query.error && (
        data.length ? (
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
                onDelete={canManage ? () => deletePerson(entity) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[30vh] items-center justify-center text-center">
            <div>
              <p className="text-sm font-medium">No people found.</p>
              <p className="mt-1 text-xs text-muted-foreground">Try another search or filter.</p>
            </div>
          </div>
        )
      )}

      {canManage && (
        <GovernancePersonDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          record={editingRecord}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["governance-directory"] })}
        />
      )}
    </div>
  );
}
