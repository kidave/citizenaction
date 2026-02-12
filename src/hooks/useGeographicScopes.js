export function useGeographicScopes({ type, parentCode, enabled = true }) {
  return useQuery({
    queryKey: ["geographic-scopes", type, parentCode],
    enabled: enabled && !!type,
    queryFn: async () => {
      let query = supabase
        .from("geographic_scope_hierarchy")
        .select("*")
        .order("name");

      if (type) query = query.eq("type", type);
      if (parentCode) query = query.eq("parent_code", parentCode);

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    },
  });
}
