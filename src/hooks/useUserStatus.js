import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "context/AuthContext";

export function useUserStatus() {
  const { user, getAccessToken } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["userStatus", user?.id],

    initialData: () => {
      if (typeof window === "undefined") return undefined;
      if (!user) return undefined;
      const cached = localStorage.getItem("userStatus");
      return cached ? JSON.parse(cached) : undefined;
    },

    queryFn: async () => {
      const token = await getAccessToken();
      const response = await fetch("/api/user/status", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      localStorage.setItem("userStatus", JSON.stringify(data));
      return data;
    },

    enabled: !!user, // only fetch if logged in
    staleTime: 5 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Reset on logout to avoid stale cached values
  useEffect(() => {
    if (!user) {
      localStorage.removeItem("userStatus");

      // Correct React Query reset:
      queryClient.removeQueries({ queryKey: ["userStatus"] });
    }
  }, [user, queryClient]);

  return query;
}
