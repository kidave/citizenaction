"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useSpaceFeed(spaceId) {
  return useQuery({
    queryKey: ["space-feed", spaceId],

    enabled: !!spaceId,

    queryFn: async () => {
      // =========================================
      // POSTS
      // =========================================

      const { data: posts, error: postsError } = await supabase.rpc(
        "get_space_posts",
        {
          p_space_id: spaceId,
        },
      );

      if (postsError) {
        throw postsError;
      }

      if (!posts?.length) {
        return [];
      }

      const postIds = posts.map((post) => post.id);

      // =========================================
      // STATS
      // =========================================

      const { data: stats, error: statsError } = await supabase.rpc(
        "get_post_stats",
        {
          p_post_ids: postIds,
        },
      );

      if (statsError) {
        throw statsError;
      }

      // =========================================
      // CONTRIBUTORS
      // =========================================

      const { data: contributors, error: contributorsError } =
        await supabase.rpc("get_post_contributors", {
          p_post_ids: postIds,
        });

      if (contributorsError) {
        throw contributorsError;
      }

      // =========================================
      // GOVERNANCE
      // =========================================

      const { data: governance, error: governanceError } = await supabase.rpc(
        "get_post_governance",
        {
          p_post_ids: postIds,
        },
      );

      if (governanceError) {
        throw governanceError;
      }

      // =========================================
      // MAP RESULTS
      // =========================================

      const statsMap = new Map(
        (stats || []).map((item) => [item.post_id, item]),
      );

      const contributorsMap = new Map(
        (contributors || []).map((item) => [item.post_id, item.contributors]),
      );

      const governanceMap = new Map(
        (governance || []).map((item) => [item.post_id, item.governance]),
      );

      // =========================================
      // MERGE
      // =========================================

      return posts.map((post) => ({
        ...post,

        stats: statsMap.get(post.id) ?? {
          support_count: 0,
          contribution_count: 0,
          contributor_count: 0,
          is_supported: false,
        },

        contributors: contributorsMap.get(post.id) ?? [],

        governance: governanceMap.get(post.id) ?? [],
      }));
    },

    staleTime: 1000 * 60 * 5,
  });
}
