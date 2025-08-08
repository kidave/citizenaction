/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://walkingproject.vercel.app', // change to .org if needed
  generateRobotsTxt: true,
  sitemapSize: 5000, // optional, for big sites
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/admin*',    // excludes /admin and all subpaths like /admin/settings
    '/auth*',     // excludes /auth and subpaths
    '/auth/callback' // optional explicit exclude
  ],
};
