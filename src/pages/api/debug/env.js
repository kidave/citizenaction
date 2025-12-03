export default function handler(req, res) {
  return res.json({
    DATABASE_URL: process.env.DATABASE_URL,
    MAPILLARY_TOKEN: process.env.MAPILLARY_TOKEN,
  });
}
