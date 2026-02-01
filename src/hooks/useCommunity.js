// useCommunity
import { useApiQuery } from "./useApiQuery";

export const useCommunity = (slug) =>

useApiQuery({
  key: ["community", slug],
  url: `/api/community/${slug}`,
  enabled: !!slug,
});