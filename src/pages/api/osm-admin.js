function escapeOverpassRegex(value) {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}

function escapeOverpassQuoted(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export default async function handler(req, res) {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const adminLevel = typeof req.query.admin_level === "string" ? req.query.admin_level.trim() : "";
  const parent = typeof req.query.parent === "string" ? req.query.parent.trim() : "";

  if (!query || !/^([2-9]|10)$/.test(adminLevel)) {
    return res.status(400).json({ results: [] });
  }

  const nameRegex = escapeOverpassRegex(query);
  const level = Number(adminLevel);
  const clauses = [];

  if (parent) {
    const parentName = escapeOverpassQuoted(parent);
    clauses.push(`area["boundary"="administrative"]["name"="${parentName}"]->.parentArea;`);
    clauses.push(`rel["boundary"="administrative"]["admin_level"="${level}"]["name"~"${nameRegex}",i](area.parentArea);`);
  } else if (level === 2) {
    clauses.push(`rel["boundary"="administrative"]["admin_level"="2"]["name"~"${nameRegex}",i];`);
  } else {
    clauses.push(`area["ISO3166-1"="IN"]["boundary"="administrative"]->.india;`);
    clauses.push(`rel["boundary"="administrative"]["admin_level"="${level}"]["name"~"${nameRegex}",i](area.india);`);
  }

  const overpassQuery = `[out:json][timeout:25];(${clauses.join("\n")});out tags center 20;`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "CitizenActionApp/1.0",
      },
      body: new URLSearchParams({ data: overpassQuery }).toString(),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Overpass administrative search failed", response.status, body.slice(0, 500));
      return res.status(502).json({ results: [] });
    }

    const data = await response.json();
    const results = (Array.isArray(data?.elements) ? data.elements : [])
      .filter((item) => item.type === "relation" && item.id && item.tags?.name)
      .map((item) => ({
        osm_type: item.type,
        osm_id: item.id,
        name: item.tags.name,
        admin_level: Number(item.tags.admin_level || level),
        display_name: item.tags.name,
        center: item.center || null,
      }));

    return res.status(200).json({ results });
  } catch (error) {
    console.error("Overpass administrative search error", error);
    return res.status(500).json({ results: [] });
  }
}
