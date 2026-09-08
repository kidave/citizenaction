import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import GovernanceEntityModal from "@/components/governance/GovernanceEntityModal";
import GovernanceFamilyTree from "@/components/governance/GovernanceFamilyTree";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { supabase } from "@/lib/supabase/client";
import { getGovernanceHref, getGovernanceLabel } from "@/utils/governance";

function getPathSegments(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.split("/").filter(Boolean);
  return [];
}

async function getGovernanceBySlug(slug) {
  const { data, error } = await supabase.rpc("get_governance_by_slug", { p_slug: slug });
  if (error) throw error;
  return data?.[0] || null;
}

export default function GovernanceRecordPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const segments = getPathSegments(router.query.path);
  const slug = segments[segments.length - 1] || null;
  const [modalOpen, setModalOpen] = useState(false);

  const { data: profile } = useMyProfile();
  const canEdit = profile?.role === "admin";

  const { data: governance, isLoading, error } = useQuery({
    queryKey: ["governance", "record", slug],
    enabled: !!slug,
    queryFn: () => getGovernanceBySlug(slug),
  });

  const { data: family = [], isLoading: familyLoading } = useQuery({
    queryKey: ["governance-family"],
    enabled: !!slug && !!governance,
    queryFn: async () => {
      const { data, error: familyError } = await supabase.rpc("get_governance_directory", {
        p_search: null,
        p_parent_id: null,
        p_entity_type: null,
        p_limit: 500,
        p_include_all: true,
      });
      if (familyError) throw familyError;
      return (data || []).map((entity) => ({
        ...entity,
        image_url: entity.image_url || entity.metadata?.image_url || null,
      }));
    },
  });

  const byId = useMemo(() => new Map(family.map((item) => [item.id, item])), [family]);
  const selectedId = governance?.id || null;

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
    const ids = new Set([governance.id]);
    const queue = [governance.id];
    while (queue.length) {
      const parentId = queue.shift();
      family.forEach((entity) => {
        if (entity.parent_id === parentId && !ids.has(entity.id)) {
          ids.add(entity.id);
          queue.push(entity.id);
        }
      });
    }
    return family.filter((entity) => ids.has(entity.id));
  }, [family, governance]);

  const selectEntity = async (entity) => {
    if (!entity?.slug) return;
    const href = getGovernanceHref(entity);
    if (!href) return;
    await router.push(href, undefined, { shallow: true });
    setModalOpen(true);
  };

  const handleSaved = (updated) => {
    queryClient.setQueryData(["governance", "record", updated.slug], updated);
    queryClient.invalidateQueries({ queryKey: ["governance-family"] });
    queryClient.invalidateQueries({ queryKey: ["governance-directory"] });
    toast.success("Governance entity updated");
  };

  if (isLoading || familyLoading) {
    return (
      <div className="flex min-h-dvh w-full flex-col">
        <GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: "Loading..." }]} />
        <main className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading governance...</main>
      </div>
    );
  }

  if (error || !governance) {
    return (
      <div className="flex min-h-dvh w-full flex-col">
        <GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: "Not found" }]} />
        <main className="flex flex-1 items-center justify-center text-sm">Governance record not found.</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader
        items={[
          { label: "Governance", href: "/governance" },
          ...lineage.slice(0, -1).map((item) => ({ label: getGovernanceLabel(item), href: getGovernanceHref(item) })),
          { label: getGovernanceLabel(governance) },
        ]}
      />

      <main className="min-h-0 flex-1 p-3 sm:p-4">
        <GovernanceFamilyTree
          records={treeRecords}
          selectedId={selectedId}
          initialExpandedIds={[governance.id]}
          onSelect={selectEntity}
          className="min-h-[calc(100vh-5.5rem)]"
        />
      </main>

      <GovernanceEntityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        entity={governance}
        parent={governance.parent_id ? byId.get(governance.parent_id) || null : null}
        childEntities={family.filter((entity) => entity.parent_id === governance.id)}
        canEdit={canEdit}
        onSelect={selectEntity}
        onSaved={handleSaved}
      />
    </div>
  );
}
