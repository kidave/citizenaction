/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gostxgfnoilfmybaohhx.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.sender.net" },
      { protocol: "https", hostname: "*.sendercdn.com" },
    ],
  },

  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' ${isDev ? "'unsafe-eval'" : ""} https://accounts.google.com https://apis.google.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' 
                data: 
                blob:
                https://lh3.googleusercontent.com 
                https://*.supabase.co 
                https://a.tile.openstreetmap.org 
                https://b.tile.openstreetmap.org 
                https://c.tile.openstreetmap.org 
                https://tiles.stadiamaps.com 
                https://server.arcgisonline.com 
                https://*.sender.net 
                https://*.sendercdn.com 
                https://*.fbcdn.net
                https://*.fna.fbcdn.net
                https://*.mapillary.com
                https://scontent.*.fna.fbcdn.net;
                
              connect-src 'self' 
                https://*.supabase.co 
                https://accounts.google.com 
                https://api.sender.net
                https://*.mapillary.com
                https://graph.mapillary.com
                https://*.fbcdn.net
                https://*.fna.fbcdn.net;
              frame-src 'self' https://accounts.google.com https://drive.google.com https://*.sender.net https://*.sendercdn.com;
              frame-ancestors 'self' https://app.sender.net;
              base-uri 'self';
              form-action 'self';
              font-src 'self' https://fonts.gstatic.com;
              object-src 'none';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, " ").trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
