import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useAdminSpaceApplications() {
  return useQuery({
    queryKey: ["admin-space-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("space_application")
        .select("id,proposed_name,proposed_slug,category,category_id,status,created_at,reviewed_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data?.length) return [];
      const categoryIds = [...new Set(data.map((row) => row.category_id).filter(Boolean))];
      if (!categoryIds.length) return data || [];
      const { data: categories, error: categoryError } = await supabase.from("category").select("id,name,slug").in("id", categoryIds);
      if (categoryError) throw categoryError;
      const byId = new Map((categories || []).map((category) => [category.id, category]));
      return data.map((row) => ({ ...row, official_category: byId.get(row.category_id) || null }));
    },
  });
}
