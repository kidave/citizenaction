// hooks/useClubSearch.js
import { useQuery } from "@tanstack/react-query";

export function useClubSearch() {
  return useQuery({
    queryKey: ["club-search"],
    queryFn: async () => {
      const res = await fetch(`/api/club/search`);
      if (!res.ok) {
        throw new Error("Failed to fetch club search results");
      }
      return res.json();
    },
  });
}