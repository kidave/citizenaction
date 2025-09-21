/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gostxgfnoilfmybaohhx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google avatars
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)", // apply to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com;
              frame-src 'self' https://accounts.google.com https://drive.google.com;
              connect-src 'self' https://*.supabase.co https://accounts.google.com;
              img-src 'self' data: 
                https://lh3.googleusercontent.com 
                https://*.supabase.co
                https://a.tile.openstreetmap.org
                https://b.tile.openstreetmap.org
                https://c.tile.openstreetmap.org
                https://tiles.stadiamaps.com
                https://server.arcgisonline.com;
              style-src 'self' 'unsafe-inline';
            `.replace(/\s{2,}/g, " ").trim(), // collapse spaces and trim
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;