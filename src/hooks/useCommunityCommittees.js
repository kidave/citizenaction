// hooks/useCommunityCommittees.js
import { useQuery } from "@tanstack/react-query";

export function useCommunityCommittees(slug) {
  return useQuery({
    queryKey: ["community-committees", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await fetch(`/api/community/${slug}/committees`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch committees");
      }
      return res.json();
    },
  });
}