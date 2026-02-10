// hooks/useCommunityClub.js
import { useQuery } from "@tanstack/react-query";

export function useCommunityClub(slug) {
  return useQuery({
    queryKey: ["community-club", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await fetch(`/api/community/${slug}/club`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch club");
      }
      return res.json();
    },
  });
}