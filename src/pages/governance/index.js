import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import { useGovernanceCatalog } from "@/hooks/governance/useGovernanceCatalog";
import { useGovernanceDirectory } from "@/hooks/governance/useGovernanceDirectory";
import { useGovernanceDirectoryGeographies } from "@/hooks/governance/useGovernanceDirectoryGeographies";
import { GOVERNANCE_DIRECTORY_TABS, GOVERNANCE_TYPES, formatGovernanceFilterType } from "@/utils/governance";

function getEntityTypeOptions(tab) {
  return tab === "organizations" ? GOVERNANCE_TYPES : [];
}

export default function GovernancePage() {
  const [tab, setTab] = useState("organizations");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [geographyId, setGeographyId] = useState("all");

  const { categories = [], isLoading: categoriesLoading } = useGovernanceCatalog({ enabled: true });
  const geographiesQuery = useGovernanceDirectoryGeographies({ enabled: true });
  const governanceQuery = useGovernanceDirectory({ tab, search, type, categoryId, geographyId });
  const typeOptions = useMemo(() => getEntityTypeOptions(tab), [tab]);
  const data = Array.isArray(governanceQuery.data) ? governanceQuery.data : [];

  const handleTabChange = (value) => {
    if (!value) return;
    setTab(value);
    setType("all");
    setCategoryId("all");
    setGeographyId("all");
  };

  const filterOptionsLoading = categoriesLoading || geographiesQuery.isLoading;

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader items={[{ label: "Governance" }]} />
      <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex justify-center sm:justify-start">
              <ToggleGroup type="single" value={tab} onValueChange={handleTabChange} variant="outline" className="w-full sm:w-auto" aria-label="Governance directory view">
                {GOVERNANCE_DIRECTORY_TABS.map(([value, label]) => <ToggleGroupItem key={value} value={value} className="flex-1 px-4 sm:flex-none">{label}</ToggleGroupItem>)}
              </ToggleGroup>
            </div>
            <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_10rem_12rem_12rem]">
              <div className="relative min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="h-9 pl-9" placeholder={tab === "positions" ? "Search positions..." : tab === "people" ? "Search people..." : "Search organizations..."} value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <Select value={type} onValueChange={setType} disabled={tab !== "organizations"}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All types</SelectItem>{typeOptions.map((item) => <SelectItem key={item} value={item}>{formatGovernanceFilterType(item)}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={filterOptionsLoading}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={geographyId} onValueChange={setGeographyId} disabled={filterOptionsLoading}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Location" /></SelectTrigger>
                <SelectContent className="max-h-80"><SelectItem value="all">All locations</SelectItem>{(geographiesQuery.data || []).map((geography) => <SelectItem key={geography.id} value={geography.id}>{geography.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {governanceQuery.isLoading && <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading {tab}...</div>}
          {governanceQuery.error && <div className="flex min-h-[50vh] items-center justify-center text-sm text-destructive">Failed to load {tab}.</div>}
          {!governanceQuery.isLoading && !governanceQuery.error && (data.length ? <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{data.map((entity) => <GovernanceDirectoryCard key={entity.id} entity={{ ...entity, tab }} tab={tab} />)}</div> : <div className="flex min-h-[50vh] items-center justify-center text-center"><div><p className="text-sm font-medium">No {tab} found.</p><p className="mt-1 text-xs text-muted-foreground">Try another search or filter.</p></div></div>)}
        </div>
      </main>
    </div>
  );
}
