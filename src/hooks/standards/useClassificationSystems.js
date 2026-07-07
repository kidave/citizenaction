import { useQuery } from "@tanstack/react-query";
import classificationService from "@/services/classification.service";

export default function useClassificationSystems(options = {}) {
  return useQuery({
    queryKey: ["classification-systems"],
    queryFn: () => classificationService.getSystems(),
    staleTime: 1000 * 60 * 30,
    ...options,
  });
}
