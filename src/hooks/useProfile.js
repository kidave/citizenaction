import { useQuery } from "@tanstack/react-query";
import { useAuth } from "context/AuthContext";

async function fetchProfile(getAccessToken) {
  const token = await getAccessToken();
  const res = await fetch("/api/profile/getProfile", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to load profile");
  }
  return data;
}

export default function useProfile() {
  const { user, getAccessToken } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(getAccessToken),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
}
