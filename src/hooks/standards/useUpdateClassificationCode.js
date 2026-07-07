import { useMutation, useQueryClient } from "@tanstack/react-query";
import classificationService from "@/services/classification.service";

export default function useUpdateClassificationCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) =>
      classificationService.updateCode(id, values),

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
