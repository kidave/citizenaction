export async function resolveDocumentContext(supabase, post) {
  const spaces = Array.isArray(post?.spaces) ? post.spaces : [];
  const governance = Array.isArray(post?.governance) ? post.governance : [];

  const spaceCategoryIds = [...new Set(spaces.map((s) => s?.category_id).filter(Boolean))];
  const governanceIds = [...new Set(governance.map((g) => g?.id).filter(Boolean))];

  const [categoryResult, governanceResult] = await Promise.all([
    spaceCategoryIds.length
      ? supabase.from("category").select("id,name,slug").in("id", spaceCategoryIds)
      : Promise.resolve({ data: [], error: null }),
    governanceIds.length
      ? supabase
          .from("governance")
          .select("id,name,short_name,slug,type,image_url,website,category_id,geography_id")
          .in("id", governanceIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const categories = categoryResult.data || [];
  const governanceRows = governanceResult.data || [];

  let geography = null;
  let geographySource = null;

  const governanceWithGeo = governanceRows.find((row) => row?.geography_id);
  if (governanceWithGeo?.geography_id) {
    const { data } = await supabase
      .from("geographies")
      .select("id,name,official_name,slug,geography_type,parent_id")
      .eq("id", governanceWithGeo.geography_id)
      .maybeSingle();

    if (data) {
      geography = data;
      geographySource = "organization";
    }
  }

  // The current post aggregate gives us the human-readable OSM address but not
  // the normalized district id. Don't guess a district by scanning geography
  // names. We leave geography unresolved here until address->district mapping
  // is available in the data layer.
  const firstSpaceCategoryId = spaces.find((space) => space?.category_id)?.category_id;
  const category =
    categories.find((item) => item.id === firstSpaceCategoryId) ||
    governanceRows
      .map((row) => categories.find((item) => item.id === row?.category_id))
      .find(Boolean) ||
    null;

  return {
    category,
    geography,
    geographySource,
    organization: governanceRows[0] || null,
    organizations: governanceRows,
    spaces,
  };
}
