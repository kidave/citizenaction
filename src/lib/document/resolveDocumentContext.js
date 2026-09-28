export async function resolveDocumentContext(supabase, post) {
  const spaces = Array.isArray(post?.spaces) ? post.spaces : [];
  const governance = Array.isArray(post?.governance) ? post.governance : [];

  const categoryIds = [...new Set(spaces.map((space) => space?.category_id).filter(Boolean))];
  const governanceIds = [...new Set(governance.map((item) => item?.id).filter(Boolean))];

  const [categoriesResult, governanceResult] = await Promise.all([
    categoryIds.length
      ? supabase.from("category").select("id,name,slug").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
    governanceIds.length
      ? supabase
          .from("governance")
          .select("id,name,short_name,slug,type,image_url,website,category_id,geography_id")
          .in("id", governanceIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const categories = categoriesResult.data || [];
  const organizations = governanceResult.data || [];
  let geography = null;

  const organizationWithGeography = organizations.find((organization) => organization?.geography_id);
  if (organizationWithGeography?.geography_id) {
    const { data } = await supabase
      .from("geographies")
      .select("id,name,official_name,slug,geography_type,parent_id")
      .eq("id", organizationWithGeography.geography_id)
      .maybeSingle();
    geography = data || null;
  }

  const category = categories.find(
    (item) => item.id === spaces.find((space) => space?.category_id)?.category_id,
  ) || null;

  return {
    category,
    geography,
    organization: organizations[0] || null,
    organizations,
    spaces,
  };
}
