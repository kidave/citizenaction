// hooks/useCommunitySearch.js
import { useQuery } from "@tanstack/react-query";

export function useCommunitySearch() {
  return useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const res = await fetch("/api/community/search");
      if (!res.ok) throw new Error("Failed to fetch communities");
      return res.json();
    },
  });
}