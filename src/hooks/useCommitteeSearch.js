// hooks/useCommitteeSearch.js
import { useQuery } from "@tanstack/react-query";

export function useCommitteeSearch() {
  return useQuery({
    queryKey: ["committee-search"],
    queryFn: async () => {
      const res = await fetch(`/api/committee/search`);
      if (!res.ok) {
        throw new Error("Failed to fetch committee search results");
      }
      return res.json();
    },
  });
}