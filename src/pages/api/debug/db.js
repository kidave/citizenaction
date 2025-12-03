import { query } from "lib/db";

export default async function handler(req, res) {
  try {
    const r = await query("SELECT NOW()", []);
    return res.json({ success: true, result: r.rows });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, error: err.message });
  }
}
