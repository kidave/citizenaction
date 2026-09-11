import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import GovernanceDirectoryCard from "@/components/governance/GovernanceDirectoryCard";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";

import { useGovernance } from "@/hooks/governance/useGovernance";

import {
  GOVERNANCE_ROOT_TYPES,
  createGovernanceTreeIndex,
  formatGovernanceFilterType,
  getGovernanceLabel,
  getGovernanceRoots,
} from "@/utils/governance";

export default function GovernancePage() {
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");

  const governanceQuery = useGovernance({
    search: "",
    entityType: "all",
    includeAll: true,
  });

  const data = useMemo(
    () => (Array.isArray(governanceQuery.data) ? governanceQuery.data : []),
    [governanceQuery.data],
  );

  const { isLoading, error } = governanceQuery;

  const roots = useMemo(() => getGovernanceRoots(data), [data]);

  const treeIndex = useMemo(() => createGovernanceTreeIndex(data), [data]);

  const visibleRoots = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matchesType = (entity) =>
      entityType === "all" ||
      entity?.entity_type === entityType ||
      entity?.unit_type === entityType;

    if (!query) {
      return roots.filter(matchesType);
    }

    const matchesEntity = (entity) =>
      [
        entity?.name,
        entity?.short_name,
        entity?.entity_type,
        entity?.unit_type,
        entity?.parent_name,
        entity?.category_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchingIds = new Set(
      data.filter(matchesEntity).map((entity) => entity.id),
    );

    return roots.filter((root) => {
      if (!matchesType(root)) return false;

      const queue = [root.id];
      const visited = new Set();

      while (queue.length) {
        const id = queue.shift();

        if (!id || visited.has(id)) continue;

        visited.add(id);

        if (matchingIds.has(id)) {
          return true;
        }

        queue.push(...(treeIndex.childrenByParent.get(id) || []));
      }

      return false;
    });
  }, [data, entityType, roots, search, treeIndex]);

  const orderedRoots = useMemo(
    () =>
      [...visibleRoots].sort((a, b) => {
        const getRank = (entity) => {
          const name = getGovernanceLabel(entity).toLowerCase();

          if (name === "government of india") return 0;
          if (name === "government of maharashtra") return 1;
          if (name === "indian roads congress") return 2;
          if (entity.entity_type === "authority") return 3;

          return 4;
        };

        return (
          getRank(a) - getRank(b) ||
          getGovernanceLabel(a).localeCompare(getGovernanceLabel(b))
        );
      }),
    [visibleRoots],
  );

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader items={[{ label: "Governance" }]} />

      <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                className="h-9 pl-9"
                placeholder="Search governance..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger className="h-9 sm:w-44">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {GOVERNANCE_ROOT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatGovernanceFilterType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading && (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
              Loading governance...
            </div>
          )}

          {error && (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-destructive">
              Failed to load governance data.
            </div>
          )}

          {!isLoading &&
            !error &&
            (orderedRoots.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                {orderedRoots.map((entity) => (
                  <GovernanceDirectoryCard key={entity.id} entity={entity} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[50vh] items-center justify-center text-center">
                <div>
                  <p className="text-sm font-medium">
                    No governance authorities found.
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Try another search or filter.
                  </p>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
