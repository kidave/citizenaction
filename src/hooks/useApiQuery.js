import { useQuery } from "@tanstack/react-query";

export function useApiQuery({ key, url, enabled = true }) {
  return useQuery({
    queryKey: key,
    enabled,
    queryFn: async () => {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data;
    },
  });
}