import { useQuery } from "@tanstack/react-query";
import classificationService from "@/services/classification.service";
import { queryKeys } from "@/lib/queryKeys";

export default function useClassificationSystems(options = {}) {
  return useQuery({
    queryKey: queryKeys.standards.systems,
    queryFn: () => classificationService.getSystems(),
    staleTime: 1000 * 60 * 30,
    ...options,
  });
}
