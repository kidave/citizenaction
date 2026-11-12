import { useMutation } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useImportGovernancePersonImage() {
  const mutation = useMutation({
    mutationFn: async ({ personId, sourceUrl }) => {
      const url = String(sourceUrl || "").trim();
      if (!personId) throw new Error("Person is required.");
      if (!url) throw new Error("Image URL is required.");

      const { data, error } = await supabase.functions.invoke(
        "import-governance-person-image",
        {
          body: {
            personId,
            sourceUrl: url,
          },
        },
      );

      if (error) throw error;
      if (!data?.imageUrl) {
        throw new Error(data?.error || "Unable to import image.");
      }

      return data;
    },
  });

  return {
    importPersonImage: mutation.mutateAsync,
    isImportingPersonImage: mutation.isPending,
  };
}
