// hooks/useCommunityCommittee.js
import { useQuery } from "@tanstack/react-query";

export function useCommunityCommittee(slug) {
  return useQuery({
    queryKey: ["community-committee", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await fetch(`/api/community/${slug}/committee`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch committee");
      }
      return res.json();
    },
  });
}