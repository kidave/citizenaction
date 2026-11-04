/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://citizenaction.in",
  generateRobotsTxt: false,
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/admin*", "/auth*", "/auth/callback"],
  additionalPaths: async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];

    try {
      const response = await fetch(
        `${url}/rest/v1/governance?select=slug,domain&slug=not.is.null&order=name.asc`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } },
      );
      if (!response.ok) return [];
      const records = await response.json();
      return (records || []).map((record) => ({
        loc: record.domain ? `/${record.domain}/${record.slug}` : `/governance/${record.slug}`,
        changefreq: "weekly",
        priority: 0.7,
      }));
    } catch (error) {
      console.warn("Unable to add governance profiles to sitemap:", error?.message || error);
      return [];
    }
  },
};
