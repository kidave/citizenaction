import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
export function useImportGovernanceOrganizationImage() {
  const mutation = useMutation({
    mutationFn: async ({ organizationId, sourceUrl }) => {
      const url = String(sourceUrl || "").trim();
      if (!organizationId) throw new Error("Organization is required.");
      if (!url) throw new Error("Image URL is required.");
      const { data, error } = await supabase.functions.invoke("import-governance-organization-image", { body: { organizationId, sourceUrl: url } });
      if (error) throw error;
      if (!data?.imageUrl) throw new Error(data?.error || "Unable to import image.");
      return data;
    },
  });
  return { importOrganizationImage: mutation.mutateAsync, isImportingOrganizationImage: mutation.isPending };
}
