"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function useFeed({ categorySlug = "" } = {}) {
  const feedQuery = useQuery({
    queryKey: queryKeys.feed.list({ categorySlug }),
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      let query = supabase
        .from("feed_card_view")
        .select("*")
        .order("start_at", {
          ascending: false,
          nullsFirst: false,
        })
        .order("created_at", { ascending: false });

      if (categorySlug) {
        query = query.eq("category_slug", categorySlug);
      }

      const { data: cards, error: cardsError } = await query;
      if (cardsError) throw cardsError;
      if (!cards?.length) return [];

      const ids = cards.map((post) => post.id);

      const [statsResult, contributorsResult, governanceResult] =
        await Promise.all([
          supabase.rpc("get_post_stats", { p_post_ids: ids }),
          supabase.rpc("get_post_contributors", { p_post_ids: ids }),
          supabase.rpc("get_post_governance", { p_post_ids: ids }),
        ]);

      const { data: stats, error: statsError } = statsResult;
      const { data: contributors, error: contributorsError } =
        contributorsResult;
      const { data: governance, error: governanceError } = governanceResult;

      if (statsError) throw statsError;
      if (contributorsError) throw contributorsError;
      if (governanceError) throw governanceError;

      const statsMap = new Map(
        (stats || []).map((item) => [item.post_id, item]),
      );
      const contributorsMap = new Map(
        (contributors || []).map((item) => [item.post_id, item.contributors]),
      );
      const governanceMap = new Map(
        (governance || []).map((item) => [item.post_id, item.governance]),
      );

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

  const categoriesQuery = useQuery({
    queryKey: queryKeys.feed.categories,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("category")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30,
  });

  return {
    ...feedQuery,
    posts: feedQuery.data || [],
    categories: categoriesQuery.data || [],
    categoriesLoading: categoriesQuery.isLoading,
    categoriesError: categoriesQuery.error,
  };
}
