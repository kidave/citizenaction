/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://citizenaction.in",
  generateRobotsTxt: false,
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/admin*", "/auth*", "/auth/callback"],
};
