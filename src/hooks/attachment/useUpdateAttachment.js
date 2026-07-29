"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useUpdateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, credit_name, credit_url }) => {
      const { data, error } = await supabase
        .from("attachment")
        .update({
          credit_name,
          credit_url,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      queryClient.invalidateQueries();

      toast.success("Attachment updated");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
