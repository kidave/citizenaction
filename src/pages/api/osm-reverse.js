export default async function handler(req, res) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({});
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");

    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "CitizenActionApp/1.0",
        Accept: "application/json",
      },
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.includes("application/json")) {
      const body = await response.text();

      console.error("Reverse geocoding returned a non-JSON response", {
        status: response.status,
        contentType,
        body: body.slice(0, 500),
      });

      return res.status(502).json({});
    }

    const data = await response.json();

    // Only accept locations within India.
    if (data?.address?.country_code !== "in") {
      return res.status(200).json({});
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Reverse geocoding failed", error);

    return res.status(500).json({});
  }
}
