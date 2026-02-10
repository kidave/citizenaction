// hooks/useGeographicScopes.js
import { useQuery } from "@tanstack/react-query";

export function useGeographicScopes({ type, parentCode, enabled }) {
  return useQuery({
    queryKey: ["geographic-scopes", type, parentCode],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("type", type);

      if (parentCode) {
        params.append("parentCode", parentCode);
      }

      const res = await fetch(`/api/geographic-scopes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch geographic scopes");

      return res.json();
    },
  });
}
