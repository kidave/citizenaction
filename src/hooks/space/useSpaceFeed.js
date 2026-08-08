"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useSpaceFeed(spaceId) {
  return useQuery({
    queryKey: ["space-feed", spaceId],

    enabled: !!spaceId,

    queryFn: async () => {
      const { data: cards, error: cardsError } = await supabase
        .from("feed_card_view")
        .select("*")
        .eq("space_id", spaceId)
        .order("created_at", { ascending: false });

      if (cardsError) {
        throw cardsError;
      }

      if (!cards?.length) {
        return [];
      }

      const ids = cards.map((post) => post.id);

      // -----------------------------
      // Stats
      // -----------------------------

      const { data: stats, error: statsError } = await supabase.rpc(
        "get_post_stats",
        {
          p_post_ids: ids,
        },
      );

      if (statsError) {
        throw statsError;
      }

      // -----------------------------
      // Contributors
      // -----------------------------

      const { data: contributors, error: contributorsError } =
        await supabase.rpc("get_post_contributors", {
          p_post_ids: ids,
        });

      if (contributorsError) {
        throw contributorsError;
      }

      // -----------------------------
      // Governance
      // -----------------------------

      const { data: governance, error: governanceError } = await supabase.rpc(
        "get_post_governance",
        {
          p_post_ids: ids,
        },
      );

      if (governanceError) {
        throw governanceError;
      }

      // -----------------------------
      // Maps
      // -----------------------------

      const statsMap = new Map(
        (stats || []).map((item) => [item.post_id, item]),
      );

      const contributorsMap = new Map(
        (contributors || []).map((item) => [item.post_id, item.contributors]),
      );

      const governanceMap = new Map(
        (governance || []).map((item) => [item.post_id, item.governance]),
      );

      // -----------------------------
      // Merge
      // -----------------------------

      return cards.map((card) => ({
        ...card,

        stats: statsMap.get(card.id) ?? {
          support_count: 0,
          contribution_count: 0,
          contributor_count: 0,
          is_supported: false,
        },

        contributors: contributorsMap.get(card.id) ?? [],

        governance: governanceMap.get(card.id) ?? [],
      }));
    },

    staleTime: 1000 * 60 * 5,
  });
}
