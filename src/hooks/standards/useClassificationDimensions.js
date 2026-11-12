import { useQuery } from "@tanstack/react-query";
import classificationService from "@/services/classification.service";
import { queryKeys } from "@/lib/queryKeys";

export default function useClassificationDimensions(systemId, options = {}) {
  return useQuery({
    queryKey: queryKeys.standards.dimensions(systemId),
    queryFn: () => classificationService.getDimensions(systemId),
    enabled: !!systemId,
    staleTime: 1000 * 60 * 30,
    ...options,
  });
}
