import { createClient } from "@supabase/supabase-js";

function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getGovernanceDirectoryPageProps(domain) {
  const client = createPublicSupabaseClient();
  if (!client) return { props: { initialOrganizations: [] } };

  const { data, error } = await client.rpc("get_governance_directory_by_domain", {
    p_search: null,
    p_tab: "organizations",
    p_type: null,
    p_category_id: null,
    p_geography_id: null,
    p_organization_id: null,
    p_limit: 500,
    p_domain: domain,
  });

  return {
    props: {
      initialOrganizations: error ? [] : data || [],
    },
  };
}

export async function getGovernanceProfilePageProps({ slug, expectedDomain }) {
  const client = createPublicSupabaseClient();
  if (!client) return { props: {} };

  const { data: identity, error: identityError } = await client
    .from("governance")
    .select("id,slug,domain")
    .eq("slug", slug)
    .maybeSingle();

  if (identityError) return { props: {} };
  if (!identity) return { notFound: true };

  const actualDomain = identity.domain || null;
  if (expectedDomain === "legacy") {
    if (actualDomain) {
      return {
        redirect: {
          destination: `/${actualDomain}/${identity.slug}¶»§q«^