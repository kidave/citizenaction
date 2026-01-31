// hooks/useCommitteePublic.js
import { useQuery } from "@tanstack/react-query";

export function useCommitteePublic(community, scopeType, scopeCode) {
  return useQuery({
    queryKey: ["committee", community, scopeType, scopeCode],
    enabled: !!community && !!scopeType && !!scopeCode,
    queryFn: async () => {
      const res = await fetch(`/api/committee/${community}/${scopeType}/${scopeCode}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch committee");
      }
      return res.json();
    },
  });
}