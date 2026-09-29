import { createServerSupabase } from "@/lib/supabase/server";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ context: null });

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const title = typeof body.title === "string" ? body.title : "";
  const content = typeof body.content === "string" ? body.content : "";
  const text = (title + "\n" + content).trim();
  const startAt = typeof body.start_at === "string" ? body.start_at : new Date().toISOString();
  const spaceIds = Array.isArray(body.spaces) ? body.spaces.filter(Boolean) : [];
  const governanceIds = Array.isArray(body.governance) ? body.governance.filter(Boolean) : [];

  const supabase = createServerSupabase();
  const normalized = text.toLowerCase();

  const [{ data: governanceRows }, { data: people }] = await Promise.all([
    supabase.from("governance").select("id,name,short_name,image_url,geography_id,category_id").limit(500),
    supabase.from("person").select("id,name,image_url").limit(500),
  ]);

  const matchedGovernance = (governanceRows || []).filter((row) => {
    const name = row.name?.toLowerCase();
    const shortName = row.short_name?.toLowerCase();
    return (name && normalized.includes(name)) || (shortName && normalized.includes(shortName));
  });

  const peopleContext = [];
  for (const person of people || []) {
    if (!person.name || !normalized.includes(person.name.toLowerCase())) continue;
    const { data: appointments } = await supabase
      .from("position_appointment")
      .select("id,started_at,ended_at,position_id,organization_id,position:position_id(id,name,category_id),organization:organization_id(id,name,short_name)")
      .eq("person_id", person.id)
      .lte("started_at", startAt)
      .or("ended_at.is.null,ended_at.gte." + startAt)
      .order("is_primary", { ascending: false })
      .order("started_at", { ascending: false })
      .limit(1);
    const appointment = appointments?.[0] || null;
    peopleContext.push({
      ...person,
      position_name: appointment?.position?.name || null,
      position_id: appointment?.position?.id || null,
      position_category_id: appointment?.position?.category_id || null,
      organization_id: appointment?.organization?.id || null,
      organization_name: appointment?.organization?.name || null,
      organization_short_name: appointment?.organization?.short_name || null,
      source: "content",
    });
  }

  const categoryMap = new Map();
  if (governanceIds.length) {
    for (const id of governanceIds) categoryMap.set(id, { confidence: 0.85, source: "manual-governance" });
  }

  const { data: selectedSpaces } = spaceIds.length
    ? await supabase.from("space").select("id,category_id").in("id", spaceIds)
    : { data: [] };

  for (const space of selectedSpaces || []) {
    if (space.category_id) categoryMap.set(space.category_id, { confidence: 0.8, source: "space" });
  }

  for (const org of matchedGovernance) {
    if (org.category_id) categoryMap.set(org.category_id, { confidence: 0.75, source: "governance" });
  }

  for (const person of peopleContext) {
    if (person.position_category_id) categoryMap.set(person.position_category_id, { confidence: 0.7, source: "person-position" });
  }

  const { data: keywordRows } = await supabase.from("category_keyword").select("category_id,keyword,weight").limit(2000);
  for (const rule of keywordRows || []) {
    if (!rule.keyword || !normalized.includes(rule.keyword.toLowerCase())) continue;
    const current = categoryMap.get(rule.category_id);
    categoryMap.set(rule.category_id, {
      confidence: Math.max(current?.confidence || 0, Number(rule.weight) || 0.6),
      source: current?.source || "content",
    });
  }

  const categoryIds = [...categoryMap.keys()].filter((id) => typeof id === "string");
  const { data: categories } = categoryIds.length
    ? await supabase.from("category").select("id,slug,name").in("id", categoryIds)
    : { data: [] };

  let district = null;
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const { data: districtData, error: districtError } = await supabase.rpc("find_district_for_point", {
      p_lat: lat,
      p_lng: lng,
    });
    if (!districtError) district = districtData || null;
  }

  return res.status(200).json({
    context: {
      governance: matchedGovernance,
      people: peopleContext,
      categories: (categories || []).map((category) => ({
        ...category,
        confidence: categoryMap.get(category.id)?.confidence || 0,
        source: categoryMap.get(category.id)?.source || "content",
      })).sort((a, b) => b.confidence - a.confidence || a.name.localeCompare(b.name)),
      district,
      jurisdiction: matchedGovernance
        .filter((row) => row.geography_id)
        .map((row) => ({ governance_id: row.id, geography_id: row.geography_id, source_type: "governance" })),
    },
  });
}
