// hooks/useUserStatus.js
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "context/AuthContext";

export function useUserStatus() {
  const { user, getAccessToken } = useAuth();

  return useQuery({
    queryKey: ["userStatus", user?.id],
    queryFn: async () => {
      const token = await getAccessToken();
      const response = await fetch("/api/user/status", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch user status");
      return response.json();
    },
    enabled: !!user, // Only run if user exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
}