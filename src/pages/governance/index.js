import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import GovernanceContributionDialog from "@/components/governance/GovernanceContributionDialog";
import GovernanceFamilyTree from "@/components/governance/GovernanceFamilyTree";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import { useGovernance } from "@/hooks/governance/useGovernance";
import { getGovernanceHref, getGovernanceLabel } from "@/utils/governance";

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
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestRecord, setSuggestRecord] = useState(null);
  const [defaultParentId, setDefaultParentId] = useState(null);

  const { data = [], isLoading, error } = useGovernance({
    search: "",
    entityType: "all",
    includeAll: true,
  });

  const visibleRecords = useMemo(
    () => data.filter((entity) => matchesSearch(entity, search.trim())),
    [data, search],
  );

  const selected = data.find((entity) => entity.id === selectedId) || null;

  const children = useMemo(
    () => (selected ? data.filter((entity) => entity.parent_id === selected.id) : []),
    [data, selected],
  );

  const parent = useMemo(
    () => (selected ? data.find((entity) => entity.id === selected.parent_id) || null : null),
    [data, selected],
  );

  const openRecord = (entity) => {
    setSelectedId(entity?.id || null);
  };

  const openEdit = (entity) => {
    setSuggestRecord(entity);
    setDefaultParentId(null);
    setShowSuggest(true);
  };

  const addChild = (entity) => {
    setSuggestRecord(null);
    setDefaultParentId(entity?.id || null);
    setShowSuggest(true);
  };

  const addParent = (entity) => {
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
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Select an organisation, authority or unit to see where it belongs.
                  </p>
                </div>
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEdit(null)} title="Suggest a change">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Suggest a change</span>
                </Button>
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search governance..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {selected ? (
                <div className="mt-5 border-t pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{getGovernanceLabel(selected)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {selected.unit_type || selected.entity_type || "Governance"}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openEdit(selected)}>
                      Edit
                    </Button>
                  </div>

                  {parent && (
                    <button
                      type="button"
                      onClick={() => setSelectedId(parent.id)}
                      className="mt-4 block w-full rounded-md bg-muted/50 p-3 text-left hover:bg-muted"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Parent</p>
                      <p className="mt-1 text-sm font-medium">{getGovernanceLabel(parent)}</p>
                    </button>
                  )}

                  <div className="mt-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Children</p>
                    {children.length ? (
                      <div className="mt-2 space-y-1">
                        {children.map((child) => (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => setSelectedId(child.id)}
                            className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                          >
                            {getGovernanceLabel(child)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">No child entities recorded.</p>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => addChild(selected)}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add child
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addParent(selected)}>
                      Add parent
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 border-t pt-4">
                  <p className="text-sm font-medium">Select an entity</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Click any node in the tree to open its details and suggest an edit.
                  </p>
                </div>
              )}

              <div className="mt-5 border-t pt-4 text-xs text-muted-foreground">
                {data.length} governance records
              </div>
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
                <GovernanceFamilyTree
                  records={visibleRecords}
                  selectedId={selectedId}
                  onSelect={openRecord}
                  onAddChild={addChild}
                  onAddParent={addParent}
                />

                <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                  <span>{visibleRecords.length} shown</span>
                  <Badge variant="outline">Community maintained</Badge>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <GovernanceContributionDialog
        open={showSuggest}
        onOpenChange={closeSuggest}
        record={suggestRecord}
        defaultParentId={defaultParentId}
      />
    </div>
  );
}
