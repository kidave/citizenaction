// hooks/useCommitteesSearch.js
import { useQuery } from "@tanstack/react-query";

export function useCommitteeSearch() {
  return useQuery({
    queryKey: ["committees-search"],
    queryFn: async () => {
      const res = await fetch(`/api/committee/search`);
      if (!res.ok) {
        throw new Error("Failed to fetch committees");
      }
      return res.json();
    },
  });
}