import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GovernanceEntityModal from "@/components/governance/GovernanceEntityModal";
import GovernanceFamilyTree from "@/components/governance/GovernanceFamilyTree";
import GovernanceOrganizationOverview from "@/components/governance/GovernanceOrganizationOverview";
import GovernanceLeadershipDialog from "@/components/governance/GovernanceLeadershipDialog";
import GovernanceOrganizationSheet from "@/components/governance/GovernanceOrganizationSheet";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import GovernanceRelationDialog from "@/components/governance/GovernanceRelationDialog";
import AddGeographyDialog from "@/components/geography/AddGeographyDialog";
import LoadingState from "@/components/ui/loading-state";
import ErrorState from "@/components/ui/error-state";
import { useGovernanceCatalog } from "@/hooks/governance/useGovernanceCatalog";
import { useGovernanceGeographyMutation } from "@/hooks/geography/useGovernanceGeography";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";
import { getGovernanceHref, getGovernanceLabel } from "@/utils/governance";

function getPathSegments(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.split("/").filter(Boolean);
  return [];
}

async function getGovernanceBySlug(slug) {
  const result = await supabase.rpc("get_governance_by_slug", { p_slug: slug });
  if (!result || result.error) throw result?.error || new Error("Unable to load governance entity");
  return result.data?.[0] || null;
}

export default function GovernanceRecordPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const segments = getPathSegments(router.query.path);
  const slug = segments[segments.length - 1] || null;
  const view = router.query.view === "organization" ? "organization" : "governance";
  const year = Number(router.query.year) || new Date().getFullYear();
  const asOf = `${year}-12-31T23:59:59.999Z`;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntity, setModalEntity] = useState(null);
  const [organizationSheetOpen, setOrganizationSheetOpen] = useState(false);
  const [organizationSheetEntity, setOrganizationSheetEntity] = useState(null);
  const [relationOpen, setRelationOpen] = useState(false);
  const [relationMode, setRelationMode] = useState("add-relation");
  const [relationSource, setRelationSource] = useState(null);
  const [geographyOpen, setGeographyOpen] = useState(false);
  const [geographyEntity, setGeographyEntity] = useState(null);
  const [leadershipOpen, setLeadershipOpen] = useState(false);
  const [leadershipRecord, setLeadershipRecord] = useState(null);

  const { data: profile } = useMyProfile();
  const canEdit = profile?.role === "admin";
  const { categories = [] } = useGovernanceCatalog({ enabled: canEdit });
  const { removeGeography } = useGovernanceGeographyMutation();

  const governanceQuery = useQuery({
    queryKey: queryKeys.governance.record(slug),
    enabled: !!slug,
    queryFn: () => getGovernanceBySlug(slug),
  });
  const governance = governanceQuery.data;

  const { data: family = [], isLoading: familyLoading } = useQuery({
    queryKey: queryKeys.governance.family(slug),
    enabled: !!slug && !!governance,
    queryFn: async () => {
      const [directoryResult, geographyResult] = await Promise.all([
        supabase.rpc("get_governance_tree", {
          p_search: null,
          p_parent_id: null,
          p_type: null,
          p_limit: 500,
          p_include_all: true,
        }),
        supabase.from("governance").select("id,geography_id"),
      ]);
      if (!directoryResult || directoryResult.error) throw directoryResult?.error || new Error("Unable to load governance tree");
      if (geographyResult?.error) throw geographyResult.error;
      const geographyById = new Map((geographyResult.data || []).map((item) => [item.id, item.geography_id || null]));
      return (directoryResult.data || []).map((entity) => ({
        ...entity,
        image_url: entity.image_url || entity.metadata?.image_url || null,
        geography_id: geographyById.get(entity.id) ?? entity.geography_id ?? null,
      }));
    },
  });

  const byId = useMemo(() => new Map(family.map((item) => [item.id, item])), [family]);
  const currentEntity = modalEntity || governance;

  const lineage = useMemo(() => {
    if (!governance) return [];
    const result = [];
    let current = governance;
    const seen = new Set();
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      result.unshift(current);
      current = current.parent_id ? byId.get(current.parent_id) : null;
    }
    return result;
  }, [governance, byId]);

  const treeRecords = useMemo(() => {
    if (!governance || !family.length) return [];
    const parentById = new Map(family.map((entity) => [entity.id, entity.parent_id || null]));
    let rootId = governance.id;
    const seenAncestors = new Set();
    while (parentById.get(rootId) && !seenAncestors.has(rootId)) {
      seenAncestors.add(rootId);
      rootId = parentById.get(rootId);
    }
    const ids = new Set([rootId]);
    const queue = [rootId];
    const childrenByParent = new Map();
    family.forEach((entity) => {
      if (!entity.parent_id) return;
      const children = childrenByParent.get(entity.parent_id) || [];
      children.push(entity.id);
      childrenByParent.set(entity.parent_id, children);
    });
    while (queue.length) {
      const parentId = queue.shift();
      (childrenByParent.get(parentId) || []).forEach((childId) => {
        if (!ids.has(childId)) {
          ids.add(childId);
          queue.push(childId);
        }
      });
    }
    return family.filter((entity) => ids.has(entity.id));
  }, [family, governance]);

  const initialExpandedIds = useMemo(() => {
    if (!governance || !treeRecords.length) return [];
    const parentById = new Map(treeRecords.map((entity) => [entity.id, entity.parent_id || null]));
    const childrenByParent = new Map();
    treeRecords.forEach((entity) => {
      if (!entity.parent_id) return;
      const children = childrenByParent.get(entity.parent_id) || [];
      children.push(entity.id);
      childrenByParent.set(entity.parent_id, children);
    });
    let rootId = governance.id;
    const seen = new Set();
    while (parentById.get(rootId) && !seen.has(rootId)) {
      seen.add(rootId);
      rootId = parentById.get(rootId);
    }
    const expanded = new Set();
    const queue = [[rootId, 0]];
    while (queue.length) {
      const [id, depth] = queue.shift();
      if (depth >= 3 || expanded.has(id)) continue;
      expanded.add(id);
      (childrenByParent.get(id) || []).forEach((childId) => queue.push([childId, depth + 1]));
    }
    return Array.from(expanded);
  }, [governance, treeRecords]);

  const openEntity = async (entity) => {
    if (!entity?.slug) return;
    const href = getGovernanceHref(entity);
    if (!href) return;
    setModalEntity(entity);
    setModalOpen(true);
    await router.push(href, undefined, { shallow: true });
  };

  const selectEntity = (entity) => openEntity(entity);
  const editEntity = (entity) => {
    if (!entity?.id) return;
    setOrganizationSheetEntity(entity);
    setOrganizationSheetOpen(true);
  };
  const openRelation = (mode, entity) => {
    if (!entity?.id) return;
    setModalOpen(false);
    setModalEntity(null);
    setRelationMode(mode);
    setRelationSource(entity);
    setRelationOpen(true);
  };
  const openGeography = (entity) => {
    if (!entity?.id) return;
    setModalOpen(false);
    setModalEntity(null);
    setGeographyEntity(entity);
    setGeographyOpen(true);
  };
  const handleChanged = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.family(slug) }),
      queryClient.invalidateQueries({ queryKey: ["governance-directory"] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.organization(governance?.id) }),
      queryClient.invalidateQueries({ queryKey: ["governance-organization-context", governance?.id] }),
      slug ? queryClient.invalidateQueries({ queryKey: queryKeys.governance.record(slug) }) : Promise.resolve(),
    ]);
    setModalEntity(null);
    setOrganizationSheetEntity(null);
    setOrganizationSheetOpen(false);
  };
  const removeEntityGeography = async (entity) => {
    if (!entity?.id) return;
    try {
      await removeGeography({ governanceId: entity.id });
      await handleChanged();
      const { toast } = await import("sonner");
      toast.success("Geography removed");
    } catch (error) {
      const { toast } = await import("sonner");
      toast.error(error?.message || "Unable to remove geography");
    }
  };

  const relationChildren = relationSource ? family.filter((item) => item.parent_id === relationSource.id) : [];
  const loading = governanceQuery.isLoading || familyLoading;
  const directoryTabHref = "/governance?tab=organizations";

  if (loading) {
    return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: directoryTabHref }, { label: "Loading..." }]} backHref={directoryTabHref} /><main className="flex flex-1"><LoadingState className="w-full" label="Loading governance" /></main></div>;
  }

  if (governanceQuery.error || !governance) {
    return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: directoryTabHref }, { label: "Not found" }]} backHref={directoryTabHref} /><main className="flex flex-1"><ErrorState className="w-full" title="Governance record not found" /></main></div>;
  }

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader items={[{ label: "Governance", href: directoryTabHref }, ...lineage.slice(0, -1).map((item) => ({ label: getGovernanceLabel(item), href: getGovernanceHref(item) })), { label: getGovernanceLabel(governance) }, ...(view === "organization" ? [{ label: "Organization" }] : [])]} backHref={directoryTabHref} />
      <main className="min-h-0 flex-1 p-0">
        {view === "organization" ? (
          <GovernanceOrganizationOverview
            governance={governance}
            asOf={asOf}
            canEdit={canEdit}
            onAdd={() => { setLeadershipRecord(null); setLeadershipOpen(true); }}
            onEdit={editEntity}
          />
        ) : (
          <GovernanceFamilyTree
            records={treeRecords}
            selectedId={governance.id}
            initialExpandedIds={initialExpandedIds}
            onSelect={selectEntity}
            canEdit={canEdit}
            onOpenOrganization={(entity) => {
              const href = getGovernanceHref(entity);
              if (href) router.push({ pathname: href, query: { view: "organization" } });
            }}
            onEdit={editEntity}
            onAddRelation={(entity) => openRelation("add-relation", entity)}
            onEditRelations={(entity) => openRelation("edit-relations", entity)}
            onAddGeography={openGeography}
            onChangeGeography={openGeography}
            onRemoveGeography={removeEntityGeography}
            onDelete={selectEntity}
            className="min-h-[calc(100vh-5.5rem)]"
          />
        )}
      </main>

      <GovernanceEntityModal
        open={modalOpen}
        onOpenChange={(value) => { setModalOpen(value); if (!value) setModalEntity(null); }}
        entity={currentEntity}
        parent={currentEntity?.parent_id ? byId.get(currentEntity.parent_id) || null : null}
        childEntities={currentEntity ? family.filter((entity) => entity.parent_id === currentEntity.id) : []}
        canEdit={canEdit}
        onSelect={selectEntity}
        onSaved={handleChanged}
        onDeleted={handleChanged}
        onAddRelation={(entity) => openRelation("add-relation", entity)}
        onEditRelations={(entity) => openRelation("edit-relations", entity)}
        onAddGeography={(entity) => openGeography(entity || currentEntity)}
        onChangeGeography={(entity) => openGeography(entity || currentEntity)}
        onRemoveGeography={(entity) => removeEntityGeography(entity || currentEntity)}
        categories={categories}
      />

      <GovernanceOrganizationSheet
        open={organizationSheetOpen}
        onOpenChange={(value) => {
          setOrganizationSheetOpen(value);
          if (!value) setOrganizationSheetEntity(null);
        }}
        record={organizationSheetEntity}
        categories={categories}
        onSaved={handleChanged}
      />

      <GovernanceRelationDialog
        open={relationOpen}
        onOpenChange={setRelationOpen}
        mode={relationMode}
        sourceEntity={relationSource}
        childEntities={relationChildren}
        categories={categories}
        onCompleted={handleChanged}
      />

      <GovernanceLeadershipDialog
        open={leadershipOpen}
        onOpenChange={setLeadershipOpen}
        governanceId={governance.id}
        record={leadershipRecord}
        candidates={family}
        records={queryClient.getQueryData(queryKeys.governance.organization(governance.id)) || []}
        onSaved={handleChanged}
      />

      {geographyEntity && (
        <AddGeographyDialog
          open={geographyOpen}
          onOpenChange={(value) => { setGeographyOpen(value); if (!value) setGeographyEntity(null); }}
          governanceId={geographyEntity.id}
          entityName={getGovernanceLabel(geographyEntity)}
          onSaved={handleChanged}
        />
      )}
    </div>
  );
}
