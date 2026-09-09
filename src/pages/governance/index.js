import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import { useGovernance } from "@/hooks/governance/useGovernance";
import { useGovernanceCatalog } from "@/hooks/governance/useGovernanceCatalog";
import { getGovernanceLabel } from "@/utils/governance";

const ROOT_TYPES = ["all", "authority", "organisation", "ministry", "department", "unit"];
function formatType(value) { if (!value || value === "all") return "All types"; return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()); }
function getDescendantCount(records, rootId) { const childrenByParent = new Map(); records.forEach((record) => { if (!record.parent_id) return; const children = childrenByParent.get(record.parent_id) || []; children.push(record.id); childrenByParent.set(record.parent_id, children); }); let count = 0; const queue = [...(childrenByParent.get(rootId) || [])]; while (queue.length) { const id = queue.shift(); count += 1; queue.push(...(childrenByParent.get(id) || [])); } return count; }

export default function GovernancePage() {
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [locationId, setLocationId] = useState("all");
  const { categories, locations } = useGovernanceCatalog();
  const { data = [], isLoading, error } = useGovernance({ search: "", entityType: "all", includeAll: true, categoryId: categoryId === "all" ? null : categoryId, locationId: locationId === "all" ? null : locationId });

  const roots = useMemo(() => data.filter((entity) => !entity.parent_id && (entity.entity_type === "authority" || entity.unit_type === "authority")), [data]);
  const visibleRoots = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matchesType = (entity) => entityType === "all" || entity.entity_type === entityType || entity.unit_type === entityType;
    if (!query) return roots.filter(matchesType);
    const matches = new Set(data.filter((entity) => [entity.name, entity.short_name, entity.entity_type, entity.unit_type, entity.parent_name, entity.category_name, entity.location_name].filter(Boolean).join(" ").toLowerCase().includes(query)).map((entity) => entity.id));
    const childrenByParent = new Map();
    data.forEach((entity) => { if (!entity.parent_id) return; const children = childrenByParent.get(entity.parent_id) || []; children.push(entity.id); childrenByParent.set(entity.parent_id, children); });
    return roots.filter((root) => {
      if (!matchesType(root)) return false;
      const queue = [root.id]; const visited = new Set();
      while (queue.length) { const id = queue.shift(); if (visited.has(id)) continue; visited.add(id); if (matches.has(id)) return true; queue.push(...(childrenByParent.get(id) || [])); }
      return false;
    });
  }, [data, roots, search, entityType]);

  const orderedRoots = useMemo(() => [...visibleRoots].sort((a, b) => { const rank = (entity) => { const name = getGovernanceLabel(entity).toLowerCase(); if (name === "government of india") return 0; if (name === "government of maharashtra") return 1; if (name === "indian roads congress") return 2; return 3; }; return rank(a) - rank(b) || getGovernanceLabel(a).localeCompare(getGovernanceLabel(b)); }), [visibleRoots]);

  return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance" }]} /><main className="flex-1 px-4 py-5 sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-6xl"><div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="relative min-w-0 lg:col-span-2"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search governance..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><Select value={entityType} onValueChange={setEntityType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROOT_TYPES.map((type) => <SelectItem key={type} value={type}>{formatType(type)}</SelectItem>)}</SelectContent></Select><Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select><Select value={locationId} onValueChange={setLocationId}><SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger><SelectContent><SelectItem value="all">All locations</SelectItem>{locations.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></div>{isLoading && <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading governance...</div>}{error && <div className="flex min-h-[50vh] items-center justify-center text-sm text-destructive">Failed to load governance data.</div>}{!isLoading && !error && (orderedRoots.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{orderedRoots.map((entity) => <GovernanceDirectoryCard key={entity.id} entity={entity} descendantCount={getDescendantCount(data, entity.id)} />)}</div> : <div className="flex min-h-[50vh] items-center justify-center text-center"><div><p className="text-sm font-medium">No governance authorities found.</p><p className="mt-1 text-xs text-muted-foreground">Try another search or filter.</p></div></div>)}</div></main></div>;
}
