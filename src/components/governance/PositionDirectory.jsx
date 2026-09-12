import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { getGovernanceLabel } from "@/utils/governance";

export default function PositionDirectory({ geographyId = null, selectionMode = null, selectedIds = [], selectedId = null, onSelect, organizationId: controlledOrganizationId = null }) {
  const [search, setSearch] = useState("");
  const [organizationId, setOrganizationId] = useState(controlledOrganizationId);
  const effectiveOrganizationId = controlledOrganizationId ?? organizationId;
  const organizationsQuery = useQuery({
    queryKey: ["governance-directory-organization-filter"],
    queryFn: async () => {
      const { data, error } = await supabase.from("governance").select("id,name,short_name,slug,type,status,image_url,current_holder_name,current_holder_image_url").neq("status", "deleted").order("name").limit(500);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
  const options = useMemo(() => (organizationsQuery.data || []).map((item) => ({ value: item.id, label: getGovernanceLabel(item), searchValue: `${item.name || ""} ${item.short_name || ""}` })), [organizationsQuery.data]);
  const query = useGovernanceDirectory({ tab: "positions", search, organizationId: effectiveOrganizationId, geographyId });
  const data = Array.isArray(query.data) ? query.data : [];
  const selectedSet = useMemo(() => new Set(selectedIds.length ? selectedIds : selectedId ? [selectedId] : []), [selectedIds, selectedId]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-9 pl-9" placeholder="Search positions..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <SearchableSelect value={effectiveOrganizationId} onValueChange={setOrganizationId} options={options} placeholder="All organizations" searchPlaceholder="Search organizations..." emptyText="No organizations found." />
      </div>

      {query.isLoading && <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">Loading positions...</div>}
      {query.error && <div className="flex min-h-[30vh] items-center justify-center text-sm text-destructive">Failed to load positions.</div>}
      {!query.isLoading && !query.error && (
        data.length ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((entity) => <GovernanceDirectoryCard key={entity.id} entity={entity} tab="positions" selectionMode={selectionMode} selected={selectedSet.has(entity.id)} onSelect={onSelect} />)}
          </div>
        ) : <div className="flex min-h-[30vh] items-center justify-center text-center"><div><p className="text-sm font-medium">No positions found.</p><p className="mt-1 text-xs text-muted-foreground">Try another search or filter.</p></div></div>
      )}
    </div>
  );
}
