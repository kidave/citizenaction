import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GovernanceEntityModal from "@/components/governance/GovernanceEntityModal";
import GovernanceFamilyTree from "@/components/governance/GovernanceFamilyTree";
import GovernanceOrganizationTree from "@/components/governance/GovernanceOrganizationTree";
import GovernanceLeadershipDialog from "@/components/governance/GovernanceLeadershipDialog";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import GovernanceRelationDialog from "@/components/governance/GovernanceRelationDialog";
import { useGovernanceCatalog } from "@/hooks/governance/useGovernanceCatalog";
import { useGovernanceGeographyMutation } from "@/hooks/geography/useGovernanceGeography";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { supabase } from "@/lib/supabase/client";
import { getGovernanceHref, getGovernanceLabel } from "@/utils/governance";

function getPathSegments(value) { if (Array.isArray(value)) return value.filter(Boolean); if (typeof value === "string") return value.split("/").filter(Boolean); return []; }
async function getGovernanceBySlug(slug) { const result = await supabase.rpc("get_governance_by_slug", { p_slug: slug }); if (!result || result.error) throw result?.error || new Error("Unable to load governance entity"); return result.data?.[0] || null; }

export default function GovernanceRecordPage() {
  const router = useRouter(); const queryClient = useQueryClient();
  const segments = getPathSegments(router.query.path); const slug = segments[segments.length - 1] || null;
  const view = router.query.view === "organization" ? "organization" : "governance"; const year = Number(router.query.year) || new Date().getFullYear(); const asOf = `${year}-12-31T23:59:59.999Z`;
  const [modalOpen, setModalOpen] = useState(false); const [modalEntity, setModalEntity] = useState(null);
  const [relationOpen, setRelationOpen] = useState(false); const [relationMode, setRelationMode] = useState("add-relation"); const [relationSource, setRelationSource] = useState(null);
  const [leadershipOpen, setLeadershipOpen] = useState(false); const [leadershipRecord, setLeadershipRecord] = useState(null);
  const { data: profile } = useMyProfile(); const canEdit = profile?.role === "admin"; const { categories = [] } = useGovernanceCatalog({ enabled: canEdit });
  const { setGeography, removeGeography } = useGovernanceGeographyMutation();
  const governanceQuery = useQuery({ queryKey: ["governance", "record", slug], enabled: !!slug, queryFn: () => getGovernanceBySlug(slug) }); const governance = governanceQuery.data;
  const { data: family = [], isLoading: familyLoading } = useQuery({ queryKey: ["governance-family"], enabled: !!slug && !!governance, queryFn: async () => { const result = await supabase.rpc("get_governance_directory", { p_search: null, p_parent_id: null, p_entity_type: null, p_limit: 500, p_include_all: true }); if (!result || result.error) throw result?.error || new Error("Unable to load governance tree"); return (result.data || []).map((entity) => ({ ...entity, image_url: entity.image_url || entity.metadata?.image_url || null })); } });
  const byId = useMemo(() => new Map(family.map((item) => [item.id, item])), [family]); const currentEntity = modalEntity || governance;
  const lineage = useMemo(() => { if (!governance) return []; const result = []; let current = governance; const seen = new Set(); while (current && !seen.has(current.id)) { seen.add(current.id); result.unshift(current); current = current.parent_id ? byId.get(current.parent_id) : null; } return result; }, [governance, byId]);
  const treeRecords = useMemo(() => { if (!governance || !family.length) return []; const parentById = new Map(family.map((entity) => [entity.id, entity.parent_id || null])); let rootId = governance.id; const seenAncestors = new Set(); while (parentById.get(rootId) && !seenAncestors.has(rootId)) { seenAncestors.add(rootId); rootId = parentById.get(rootId); } const ids = new Set([rootId]); const queue = [rootId]; const childrenByParent = new Map(); family.forEach((entity) => { if (!entity.parent_id) return; const children = childrenByParent.get(entity.parent_id) || []; children.push(entity.id); childrenByParent.set(entity.parent_id, children); }); while (queue.length) { const parentId = queue.shift(); (childrenByParent.get(parentId) || []).forEach((childId) => { if (!ids.has(childId)) { ids.add(childId); queue.push(childId); } }); } return family.filter((entity) => ids.has(entity.id)); }, [family, governance]);

  const selectEntity = async (entity) => { if (!entity?.slug) return; const href = getGovernanceHref(entity); if (!href) return; setModalEntity(entity); setModalOpen(true); await router.push(href, undefined, { shallow: true }); };
  const openRelation = (mode, entity) => { setRelationMode(mode); setRelationSource(entity); setRelationOpen(true); };
  const handleChanged = async () => { setModalEntity(null); await Promise.all([queryClient.invalidateQueries({ queryKey: ["governance-family"] }), queryClient.invalidateQueries({ queryKey: ["governance-directory"] }), queryClient.invalidateQueries({ queryKey: ["governance-organization", governance?.id] }), slug ? queryClient.invalidateQueries({ queryKey: ["governance", "record", slug] }) : Promise.resolve()]); };
  const removeEntityGeography = async (entity) => { try { await removeGeography({ governanceId: entity.id }); await handleChanged(); } catch {} };
  const relationCandidates = family.filter((item) => item.id !== relationSource?.id);
  const relationChildren = relationSource ? family.filter((item) => item.parent_id === relationSource.id) : [];

  if (governanceQuery.isLoading || familyLoading) return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: "Loading..." }]} /><main className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading governance...</main></div>;
  if (governanceQuery.error || !governance) return <div className="flex min-h-dvh w-full flex-col"><GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: "Not found" }]} /><main className="flex flex-1 items-center justify-center text-sm">Governance record not found.</main></div>;

  return <div className="flex min-h-dvh w-full flex-col">
    <GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, ...lineage.slice(0, -1).map((item) => ({ label: getGovernanceLabel(item), href: getGovernanceHref(item) })), { label: getGovernanceLabel(governance) }, ...(view === "organization" ? [{ label: "Organization" }] : [])]} />
    <main className="min-h-0 flex-1 p-0">
      {view === "organization" ? <GovernanceOrganizationTree governanceId={governance.id} asOf={asOf} canEdit={canEdit} onAdd={() => { setLeadershipRecord(null); setLeadershipOpen(true); }} onEdit={(record) => { setLeadershipRecord(record); setLeadershipOpen(true); }} onSelect={(record) => { const target = record.position_governance_id ? byId.get(record.position_governance_id) : record.person_governance_id ? byId.get(record.person_governance_id) : null; if (target) selectEntity(target); }} className="min-h-[calc(100vh-5.5rem)]" /> : <GovernanceFamilyTree records={treeRecords} selectedId={governance.id} initialExpandedIds={lineage.map((item) => item.id)} onSelect={selectEntity} canEdit={canEdit} onOpenOrganization={(entity) => { const href = getGovernanceHref(entity); if (href) router.push({ pathname: href, query: { view: "organization" } }); }} onEdit={selectEntity} onAddRelation={(entity) => openRelation("add-relation", entity)} onEditRelations={(entity) => openRelation("edit-relations", entity)} onAddGeography={selectEntity} onChangeGeography={selectEntity} onRemoveGeography={removeEntityGeography} onDelete={selectEntity} className="min-h-[calc(100vh-5.5rem)]" />}
    </main>
    <GovernanceEntityModal open={modalOpen} onOpenChange={(value) => { setModalOpen(value); if (!value) setModalEntity(null); }} entity={currentEntity} parent={currentEntity?.parent_id ? byId.get(currentEntity.parent_id) || null : null} childEntities={currentEntity ? family.filter((entity) => entity.parent_id === currentEntity.id) : []} canEdit={canEdit} onSelect={selectEntity} onSaved={handleChanged} onDeleted={handleChanged} onAddRelation={(entity) => openRelation("add-relation", entity)} onEditRelations={(entity) => openRelation("edit-relations", entity)} onAddGeography={() => setModalOpen(true)} onChangeGeography={() => setModalOpen(true)} onRemoveGeography={removeEntityGeography} categories={categories} />
    <GovernanceRelationDialog open={relationOpen} onOpenChange={setRelationOpen} mode={relationMode} sourceEntity={relationSource} candidates={relationCandidates} children={relationChildren} categories={categories} onCompleted={handleChanged} />
    <GovernanceLeadershipDialog open={leadershipOpen} onOpenChange={setLeadershipOpen} governanceId={governance.id} record={leadershipRecord} candidates={family} records={queryClient.getQueryData(["governance-organization", governance.id]) || []} onSaved={handleChanged} />
  </div>;
}
