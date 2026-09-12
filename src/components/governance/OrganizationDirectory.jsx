import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GeographyFocusSelector from "@/components/geography/GeographyFocusSelector";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import { useGovernanceCatalog } from "@/hooks/governance/useGovernanceCatalog";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";
import { GOVERNANCE_TYPES, formatGovernanceFilterType } from "@/utils/governance";

export default function OrganizationDirectory({
  geographyId = null,
  selectionMode = null,
  selectedIds = [],
  selectedId = null,
  onSelect,
  excludeIds = [],
  showFocus = false,
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [localGeographyId, setLocalGeographyId] = useState(geographyId);
  const { categories = [], isLoading: categoriesLoading } = useGovernanceCatalog({ enabled: true });

  const effectiveGeographyId = showFocus ? localGeographyId : geographyId;
  const query = useGovernanceDirectory({
    tab: "organizations",
    search,
    type,
    categoryId,
    geographyId: effectiveGeographyId,
  });

  const excluded = useMemo(() => new Set(excludeIds), [excludeIds]);
  const data = useMemo(
    () => (Array.isArray(query.data) ? query.data.filter((item) => !excluded.has(item.id)) : []),
    [query.data, excluded],
  );
  const selectedSet = useMemo(() => new Set(selectedIds.length ? selectedIds : selectedId ? [selectedId] : []), [selectedIds, selectedId]);

  return (
    <div className="space-y-4">
      {(showFocus || geographyId !== null) && (
        <div className="flex justify-end">
          <GeographyFocusSelector value={effectiveGeographyId} onValueChange={setLocalGeographyId} />
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_12rem]">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-9 pl-9" placeholder="Search organizations..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {GOVERNANCE_TYPES.map((item) => <SelectItem key={item} value={item}>{formatGovernanceFilterType(item)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryId} onValueChange={setCategoryId} disabled={categoriesLoading}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {query.isLoading && <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">Loading organizations...</div>}
      {query.error && <div className="flex min-h-[30vh] items-center justify-center text-sm text-destructive">Failed to load organizations.</div>}
      {!query.isLoading && !query.error && (
        data.length ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((entity) => (
              <GovernanceDirectoryCard
                key={entity.id}
                entity={entity}
                tab="organizations"
                selectionMode={selectionMode}
                selected={selectedSet.has(entity.id)}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[30vh] items-center justify-center text-center">
            <div><p className="text-sm font-medium">No organizations found.</p><p className="mt-1 text-xs text-muted-foreground">Try another search or filter.</p></div>
          </div>
        )
      )}
    </div>
  );
}
