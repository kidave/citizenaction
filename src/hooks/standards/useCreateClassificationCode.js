import { useMutation, useQueryClient } from "@tanstack/react-query";
import classificationService from "@/services/classification.service";
import { queryKeys } from "@/lib/queryKeys";

export default function useCreateClassificationCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classificationService.createCode,
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: queryKeys.standards.codes(data.dimension_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.standards.tree(data.dimension_id) });
    },
  });
}
