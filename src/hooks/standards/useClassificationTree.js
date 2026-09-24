import { useQuery } from "@tanstack/react-query";
import classificationService from "@/services/classification.service";

export default function useClassificationTree(dimensionId, options = {}) {
  return useQuery({
    queryKey: ["classification-tree", dimensionId],
    enabled: !!dimensionId,
    staleTime: 1000 * 60 * 30,

    queryFn: async () => {
      const rows = await classificationService.getCodes(dimensionId);

      return classificationService.buildTree(rows);
    },

    ...options,
  });
}
