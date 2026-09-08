import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useAdminSpaceApplications() {
  return useQuery({
    queryKey: ["admin-space-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("space_application")
        .select("id,proposed_name,proposed_slug,category,category_id,status,created_at,reviewed_at,official_category:category_id (id,name,slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}
