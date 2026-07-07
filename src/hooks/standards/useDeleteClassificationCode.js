import { useMutation, useQueryClient } from "@tanstack/react-query";
import classificationService from "@/services/classification.service";

export default function useDeleteClassificationCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dimensionId }) => classificationService.deleteCode(id),

    onSuccess(_, variables) {
      queryClient.invalidateQueries({
        queryKey: ["classification-codes", variables.dimensionId],
      });

      queryClient.invalidateQueries({
        queryKey: ["classification-tree", variables.dimensionId],
      });
    },
  });
}
