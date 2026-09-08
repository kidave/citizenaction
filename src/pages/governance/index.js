import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import GovernanceContributionDialog from "@/components/governance/GovernanceContributionDialog";
import GovernanceEntityModal from "@/components/governance/GovernanceEntityModal";
import GovernanceFamilyTree from "@/components/governance/GovernanceFamilyTree";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import { useGovernance } from "@/hooks/governance/useGovernance";

function matchesSearch(entity, query) {
  if (!query) return true;
  const value = query.toLowerCase();
  return [entity?.name, entity?.short_name, entity?.entity_type, entity?.unit_type, entity?.parent_name]
    .filter(Boolean)
    .some((part) => String(part).toLowerCase().includes(value));
}

export default function GovernancePage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestRecord, setSuggestRecord] = useState(null);
  const [defaultParentId, setDefaultParentId] = useState(null);

  const { data = [], isLoading, error } = useGovernance({
    search: "",
    entityType: "all",
    includeAll: true,
  });

  const visibleRecords = useMemo(() => {
    if (!search.trim()) return data;

    const query = search.trim();
    const matches = new Set(data.filter((entity) => matchesSearch(entity, query)).map((entity) => entity.id));

    const byId = new Map(data.map((entity) => [entity.id, entity]));
    const addAncestors = (entity) => {
      let current = entity;
      const seen = new Set();
      while (current?.parent_id && !seen.has(current.parent_id)) {
        seen.add(current.parent_id);
        matches.add(current.parent_id);
        current = byId.get(current.parent_id);
      }
    };

    data.filter((entity) => matches.has(entity.id)).forEach(addAncestors);
    return data.filter((entity) => matches.has(entity.id));
  }, [data, search]);

  const selected = data.find((entity) => entity.id === selectedId) || null;
  const children = useMemo(() => (selected ? data.filter((entity) => entity.parent_id === selected.id) : []), [data, selected]);
  const parent = useMemo(() => (selected ? data.find((entity) => entity.id === selected.parent_id) || null : null), [data, selected]);

  const selectEntity = (entity) => {
    setSelectedId(entity?.id || null);
    setModalOpen(Boolean(entity));
  };

  const openEdit = (entity) => {
    setModalOpen(false);
    setSuggestRecord(entity);
    setDefaultParentId(null);
    setShowSuggest(true);
  };

  const addChild = (entity) => {
    setModalOpen(false);
    setSuggestRecord(null);
    setDefaultParentId(entity?.id || null);
    setShowSuggest(true);
  };

  const addParent = (entity) => {
    setModalOpen(false);
    setSuggestRecord(entity ? { ...entity, __suggestAction: "move" } : null);
    setDefaultParentId(null);
    setShowSuggest(true);
  };

  const closeSuggest = (open) => {
    setShowSuggest(open);
    if (!open) {
      setSuggestRecord(null);
      setDefaultParentId(null);
    }
  };

  return (
    <div className="min-h-dvh w-full">
      <GovernancePageHeader items={[{ label: "Governance" }]} />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-72">
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Governance</p>
                  <h1 className="mt-1 text-lg font-semibold">Explore the structure</h1>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Select an entity in the tree to see its place, parent and children.</p>
                </div>
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { setSuggestRecord(null); setDefaultParentId(null); setShowSuggest(true); }} title="Suggest a change">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Suggest a change</span>
                </Button>
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search governance..." value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>

              <div className="mt-5 border-t pt-4 text-xs text-muted-foreground">{data.length} governance records</div>
              <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">Click a node to open its details. From there you can suggest an edit or add a parent or child.</div>
            </div>
          </aside>

          <section className="min-w-0 flex-1 rounded-xl border bg-card p-4 shadow-sm sm:p-6">
            {isLoading && <div className="py-16 text-center text-sm text-muted-foreground">Loading governance...</div>}
            {error && <div className="py-16 text-center text-sm text-destructive">Failed to load governance data.</div>}

            {!isLoading && !error && visibleRecords.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm font-medium">No governance entities found.</p>
                <p className="mt-1 text-xs text-muted-foreground">Try another search.</p>
              </div>
            )}

            {!isLoading && !error && visibleRecords.length > 0 && (
              <>
                <GovernanceFamilyTree records={visibleRecords} selectedId={selectedId} onSelect={selectEntity} onAddChild={addChild} onAddParent={addParent} />
                <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                  <span>{visibleRecords.length} shown</span>
                  <Badge variant="outline">Community maintained</Badge>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <GovernanceEntityModal open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) setSelectedId(null); }} entity={selected} parent={parent} children={children} onEdit={openEdit} onAddChild={addChild} onAddParent={addParent} onSelect={selectEntity} />
      <GovernanceContributionDialog open={showSuggest} onOpenChange={closeSuggest} record={suggestRecord} defaultParentId={defaultParentId} />
    </div>
  );
}
