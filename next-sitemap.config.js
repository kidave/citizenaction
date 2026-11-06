/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://citizenaction.in",
  generateRobotsTxt: false,
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/admin*", "/auth*", "/auth/callback"],
  additionalPaths: async () => {
    const paths = ["/governance", "/politics", "/legislature", "/executive", "/judiciary"];
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return paths.map((loc) => ({ loc, changefreq: "weekly", priority: 0.7 }));

    try {
      const response = await fetch(
        `${url}/rest/v1/governance?select=slug,domain&slug=not.is.null&status=neq.deleted&order=name.asc`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } },
      );
      if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
      const records = await response.json();
      const profiles = (records || []).map((record) => ({
        loc: record.domain ? `/${record.domain}/${record.slug}` : `/governance/${record.slug}`,
        changefreq: "weekly",
        priority: 0.7,
      }));
      return [...paths.map((loc) => ({ loc, changefreq: "weekly", priority: 0.7 })), ...profiles];
    } catch (error) {
      console.warn("Unable to add governance profiles to sitemap:", error?.message || error);
      return paths.map((loc) => ({ loc, changefreq: "weekly", priority: 0.7 }));
    }
  },
};
