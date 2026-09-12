import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import { getGovernanceLabel } from "@/utils/governance";

export default function GovernanceOrganizationGrid({ organizations = [], selectedId = null, onSelect, selectable = false, emptyText = "No organizations found." }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    const rows = organizations.filter((item) => item?.id);
    if (!value) return rows;
    return rows.filter((item) => `${item.name || ""} ${item.short_name || ""} ${getGovernanceLabel(item)}`.toLowerCase().includes(value));
  }, [organizations, search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search organizations..." className="h-9 pl-9" />
      </div>
      {filtered.length ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filtered.map((entity) => selectable ? (
            <button key={entity.id} type="button" onClick={() => onSelect?.(entity)} className="block w-full text-left">
              <div className={selectedId === entity.id ? "rounded-lg ring-2 ring-primary ring-offset-1" : "rounded-lg"}>
                <GovernanceDirectoryCard entity={{ ...entity, tab: "organizations" }} tab="organizations" />
              </div>
            </button>
          ) : (
            <GovernanceDirectoryCard key={entity.id} entity={{ ...entity, tab: "organizations" }} tab="organizations" />
          ))}
        </div>
      ) : <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">{emptyText}</div>}
    </div>
  );
}
