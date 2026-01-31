import { useQuery } from "@tanstack/react-query";

export function useCommunityPublic(slug) {
  return useQuery({
    queryKey: ["community", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await fetch(`/api/community/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch community");
      return res.json();
    },
  });
}
