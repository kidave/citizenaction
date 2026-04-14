export default async function handler(req, res) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({});
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "User-Agent": "CitizenActionApp/1.0",
        },
      }
    );

    const data = await response.json();

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({});
  }
}