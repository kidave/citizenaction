export default async function handler(req, res) {
  const { scope, code, resource } = req.query;

  const table = `${scope}_${resource}`;  
  // ward_meeting, region_meeting, city_meeting, state_meeting

  switch (req.method) {
    case "GET":
      return getList(table, code, scope, res);
    case "POST":
      return createEntry(table, req, code, scope, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
