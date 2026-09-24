import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
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
  const { deletePerson: removePerson } = useGovernanceCrud();
  const effectiveOrganizationId = controlledOrganizationId ?? organizationId;

  const organizationsQuery = useGovernanceOrganizations();

  const organizationOptions = useMemo(
    () => [
      { value: "all", label: "All organizations" },
      ...(organizationsQuery.data || []).map((item) => ({
        value: item.id,
        label: item.name || getGovernanceLabel(item),
      })),
    ],
    [organizationsQuery.data],
  );

  const organizationItems = useMemo(
    () =>
      Combobox.createItems(organizationOptions, {
        getValue: (item) => item.value,
        getLabel: (item) => item.label,
      }),
    [organizationOptions],
  );

  const selectedOrganizationId = effectiveOrganizationId || "all";

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
        <Combobox
          items={organizationItems}
          value={selectedOrganizationId}
          onValueChange={(value) =>
            setOrganizationId(value === "all" ? null : value || null)
          }
          autoHighlight
          className="min-w-0"
        >
          <ComboboxInput
            placeholder="All organizations"
            className="h-9"
            showClear={Boolean(effectiveOrganizationId)}
          />
          <ComboboxContent>
            <ComboboxEmpty>No organizations found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.id} value={item.id}>
                  {item.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

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
          <div className="grid grid-cols-2 overflow-hidden rounded-md border-x border-t sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 [&>*]:min-w-0 [&>*]:border-t [&>*]:border-r [&>*]:border-border sm:[&>*:nth-child(3n)]:border-r-0 lg:[&>*:nth-child(3n)]:border-r lg:[&>*:nth-child(4n)]:border-r-0 xl:[&>*:nth-child(4n)]:border-r xl:[&>*:nth-child(5n)]:border-r-0 2xl:[&>*:nth-child(5n)]:border-r 2xl:[&>*:nth-child(6n)]:border-r-0">
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
