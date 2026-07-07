import { useMutation, useQueryClient } from "@tanstack/react-query";
import classificationService from "@/services/classification.service";

export default function useCreateClassificationCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classificationService.createCode,

    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: ["classification-codes", data.dimension_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["classification-tree", data.dimension_id],
      });
    },
  });
}
