// hooks/useGeographicScopes.js
import { useQuery } from "@tanstack/react-query";

export function useGeographicScopes(scopeType = null, parentCode = null) {
  return useQuery({
    queryKey: ["geographic-scopes", scopeType, parentCode],
    queryFn: async () => {
      let url = "/api/geographic-scopes";
      const params = new URLSearchParams();
      
      if (scopeType) params.append("type", scopeType);
      if (parentCode) params.append("parentCode", parentCode);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch geographic scopes");
      return res.json();
    },
  });
}