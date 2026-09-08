import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
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

    data.filter((entity) => matches.has(entity.id)).forEach((entity) => {
      let current = entity;
      const seen = new Set();
      while (current?.parent_id && !seen.has(current.parent_id)) {
        seen.add(current.parent_id);
        matches.add(current.parent_id);
        current = byId.get(current.parent_id);
      }
    });

    return data.filter((entity) => matches.has(entity.id));
  }, [data, search]);

  const selected = data.find((entity) => entity.id === selectedId) || null;
  const childEntities = useMemo(
    () => (selected ? data.filter((entity) => entity.parent_id === selected.id) : []),
    [data, selected],
  );
  const parent = useMemo(
    () => (selected ? data.find((entity) => entity.id === selected.parent_id) || null : null),
    [data, selected],
  );

  const selectEntity = (entity) => {
    setSelectedId(entity?.id || null);
    setModalOpen(Boolean(entity));
  };

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader items={[{ label: "Governance" }]} />

      <main className="flex min-h-0 flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Governance</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Explore how public authorities, organisations and their units are connected.
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search governance..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <section className="min-h-0 flex-1">
            {isLoading && <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Loading governance...</div>}
            {error && <div className="flex min-h-[50vh] items-center justify-center text-sm text-destructive">Failed to load governance data.</div>}

            {!isLoading && !error && visibleRecords.length === 0 && (
              <div className="flex min-h-[50vh] items-center justify-center text-center">
                <div>
                  <p className="text-sm font-medium">No governance entities found.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Try another search.</p>
                </div>
              </div>
            )}

            {!isLoading && !error && visibleRecords.length > 0 && (
              <GovernanceFamilyTree
                records={visibleRecords}
                selectedId={selectedId}
                onSelect={selectEntity}
              />
            )}
          </section>
        </div>
      </main>

      <GovernanceEntityModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedId(null);
        }}
        entity={selected}
        parent={parent}
        childEntities={childEntities}
        canEdit={false}
        onSelect={selectEntity}
      />
    </div>
  );
}
