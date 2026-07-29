"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],

    queryFn: async () => {
      // -----------------------------
      // Fetch cards
      // -----------------------------
      const { data: cards, error: cardsError } = await supabase
        .from("feed_card_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (cardsError) throw cardsError;

      if (!cards?.length) return [];

      const ids = cards.map((p) => p.id);

      // -----------------------------
      // Fetch stats
      // -----------------------------
      const { data: stats, error: statsError } = await supabase.rpc(
        "get_feed_stats",
        {
          p_post_ids: ids,
        },
      );

      if (statsError) throw statsError;

      // -----------------------------
      // Fetch contributors
      // -----------------------------
      const { data: contributors, error: contributorsError } =
        await supabase.rpc("get_feed_contributors", {
          p_post_ids: ids,
        });

      if (contributorsError) throw contributorsError;

      // -----------------------------
      // Fetch governance
      // -----------------------------
      const { data: governance, error: governanceError } = await supabase.rpc(
        "get_feed_governance",
        {
          p_post_ids: ids,
        },
      );

      if (governanceError) throw governanceError;

      // -----------------------------
      // Convert to maps
      // -----------------------------
      const statsMap = new Map((stats || []).map((s) => [s.post_id, s]));

      const contributorsMap = new Map(
        (contributors || []).map((c) => [c.post_id, c.contributors]),
      );

      const governanceMap = new Map(
        (governance || []).map((g) => [g.post_id, g.governance]),
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

        governance: governanceMap.get(card.id) ?? [],

        contributors: contributorsMap.get(card.id) ?? [],
      }));
    },

    staleTime: 1000 * 60 * 5,
  });
}
