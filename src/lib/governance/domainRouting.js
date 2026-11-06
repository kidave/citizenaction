import { createClient } from "@supabase/supabase-js";

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function appendQuery(path, query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (key === "path" || value == null) return;
    (Array.isArray(value) ? value : [value]).forEach((item) => params.append(key, String(item)));
  });
  const suffix = params.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export async function getGovernanceProfileRouteProps({ slug, expectedDomain, query }) {
  const client = getPublicClient();
  if (!client) return { props: {} };
  const { data, error } = await client
    .from("governance")
    .select("slug,domain")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return { props: {} };
  if (!data) return { notFound: true };
  const actualDomain = data.domain || null;
  const shouldRedirect = expectedDomain === "legacy"
    ? Boolean(actualDomain)
    : actualDomain !== expectedDomain;
  if (!shouldRedirect) return { props: {} };
  const destination = actualDomain ? `/${actualDomain}/${data.slug}` : `/governance/${data.slug}`;
  return {
    redirect: {
      destination: appendQuery(destination, query),
      permanent: true,
    },
  };
}
