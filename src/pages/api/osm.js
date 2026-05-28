export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) return res.status(400).json([]);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}&addressdetails=1&limit=5`,
      {
        headers: {
          "User-Agent": "CitizenActionApp/1.0",
        },
      },
    );

    const data = await response.json();

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json([]);
  }
}
