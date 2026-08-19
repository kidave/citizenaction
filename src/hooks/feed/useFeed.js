"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useFeed({ categorySlug = "" } = {}) {
  // --------------------------------
  // Feed query
  // --------------------------------

  const feedQuery = useQuery({
    queryKey: [
      "feed",
      {
        categorySlug,
      },
    ],

    // Keep the previous feed visible while
    // a new category is being fetched.
    placeholderData: (previousData) => previousData,

    queryFn: async () => {
      // --------------------------------
      // Fetch feed cards
      // --------------------------------

      let query = supabase
        .from("feed_card_view")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      // --------------------------------
      // Category filter
      // --------------------------------

      if (categorySlug) {
        query = query.eq("category_slug", categorySlug);
      }

      const { data: cards, error: cardsError } = await query;

      if (cardsError) {
        throw cardsError;
      }

      // --------------------------------
      // No posts
      // --------------------------------

      if (!cards?.length) {
        return [];
      }

      const ids = cards.map((post) => post.id);

      // --------------------------------
      // Fetch stats
      // --------------------------------

      const { data: stats, error: statsError } = await supabase.rpc(
        "get_post_stats",
        {
          p_post_ids: ids,
        },
      );

      if (statsError) {
        throw statsError;
      }

      // --------------------------------
      // Fetch contributors
      // --------------------------------

      const { data: contributors, error: contributorsError } =
        await supabase.rpc("get_post_contributors", {
          p_post_ids: ids,
        });

      if (contributorsError) {
        throw contributorsError;
      }

      // --------------------------------
      // Fetch governance
      // --------------------------------

      const { data: governance, error: governanceError } = await supabase.rpc(
        "get_post_governance",
        {
          p_post_ids: ids,
        },
      );

      if (governanceError) {
        throw governanceError;
      }

      // --------------------------------
      // Convert to maps
      // --------------------------------

      const statsMap = new Map(
        (stats || []).map((item) => [item.post_id, item]),
      );

      const contributorsMap = new Map(
        (contributors || []).map((item) => [item.post_id, item.contributors]),
      );

      const governanceMap = new Map(
        (governance || []).map((item) => [item.post_id, item.governance]),
      );

      // --------------------------------
      // Merge
      // --------------------------------

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

  // --------------------------------
  // Categories
  // --------------------------------

  const categoriesQuery = useQuery({
    queryKey: ["feed-categories"],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("category")
        .select("id, name, slug")
        .order("name", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

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
