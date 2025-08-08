/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://walkingproject.vercel.app', // change to .org if needed
  generateRobotsTxt: true,
  sitemapSize: 5000, // optional, for big sites
  changefreq: 'weekly',
  priority: 0.7,
};
