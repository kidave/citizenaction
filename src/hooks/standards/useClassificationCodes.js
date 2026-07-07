import { useQuery } from "@tanstack/react-query";
import classificationService from "@/services/classification.service";

export default function useClassificationCodes(dimensionId, options = {}) {
  return useQuery({
    queryKey: ["classification-codes", dimensionId],
    queryFn: () => classificationService.getCodes(dimensionId),
    enabled: !!dimensionId,
    staleTime: 1000 * 60 * 30,
    ...options,
  });
}
