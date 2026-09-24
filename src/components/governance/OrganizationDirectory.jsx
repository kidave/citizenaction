import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import GovernanceOrganizationSheet from "@/components/governance/GovernanceOrganizationSheet";
import LoadingState from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/empty-state";
import ErrorState from "@/components/ui/error-state";
import { useGovernanceCatalog } from "@/hooks/governance/useGovernanceCatalog";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";
import { useGovernanceCrud } from "@/hooks/governance/useGovernanceCrud";
import {
  GOVERNANCE_TYPES,
  formatGovernanceFilterType,
} from "@/utils/governance";

export default function OrganizationDirectory({
  geographyId = null,
  selectionMode = null,
  selectedIds = [],
  selectedId = null,
  onSelect,
  excludeIds = [],
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
  const [editingRecord, setEditingRecord] = useState(null);

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
        ? query.data.filter((item) => !excluded.has(item.id))
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

  const openEdit = (entity) => { setEditingRecord(entity); setDialogOpen(true); };

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
          <div className="grid grid-cols-2 overflow-hidden rounded-md border sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 [&>*]:min-w-0 [&>*]:border-b [&>*]:border-r [&>*]:border-border [&>*]:last:border-r-0 sm:[&>*:nth-child(3n)]:border-r-0 lg:[&>*:nth-child(3n)]:border-r lg:[&>*:nth-child(4n)]:border-r-0 xl:[&>*:nth-child(4n)]:border-r xl:[&>*:nth-child(5n)]:border-r-0 2xl:[&>*:nth-child(5n)]:border-r 2xl:[&>*:nth-child(6n)]:border-r-0 [&>*:nth-last-child(-n+2)]:border-b-0 sm:[&>*:nth-last-child(-n+3)]:border-b-0 lg:[&>*:nth-last-child(-n+4)]:border-b-0 xl:[&>*:nth-last-child(-n+5)]:border-b-0 2xl:[&>*:nth-last-child(-n+6)]:border-b-0">
            {data.map((entity) => (
              <GovernanceDirectoryCard
                key={entity.id}
                entity={entity}
                tab="organizations"
                selectionMode={selectionMode}
                selected={selectedSet.has(entity.id)}
                onSelect={onSelect}
                onEdit={canManage ? () => openEdit(entity) : undefined}
                onDelete={canManage ? () => deleteOrganizationRecord(entity) : undefined}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No organizations found" description="Try another search or filter." />
        ))}

      {canManage && (
        <GovernanceOrganizationSheet
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          categories={categories}
          record={editingRecord}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
