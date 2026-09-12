import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";

export default function PersonDirectory({ geographyId = null, selectionMode = null, selectedIds = [], selectedId = null, onSelect }) {
  const [search, setSearch] = useState("");
  const query = useGovernanceDirectory({ tab: "people", search, geographyId });
  const data = Array.isArray(query.data) ? query.data : [];
  const selectedSet = useMemo(() => new Set(selectedIds.length ? selectedIds : selectedId ? [selectedId] : []), [selectedIds, selectedId]);

  return (
    <div className="space-y-4">
      <div className="relative min-w-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-9 pl-9" placeholder="Search people..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {query.isLoading && <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">Loading people...</div>}
      {query.error && <div className="flex min-h-[30vh] items-center justify-center text-sm text-destructive">Failed to load people.</div>}
      {!query.isLoading && !query.error && (
        data.length ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((entity) => <GovernanceDirectoryCard key={entity.id} entity={entity} tab="people" selectionMode={selectionMode} selected={selectedSet.has(entity.id)} onSelect={onSelect} />)}
          </div>
        ) : <div className="flex min-h-[30vh] items-center justify-center text-center"><div><p className="text-sm font-medium">No people found.</p><p className="mt-1 text-xs text-muted-foreground">Try another search.</p></div></div>
      )}
    </div>
  );
}
