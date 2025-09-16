// pages/api/ward/[wardId]/project/[id]/images/index.js
import { createServerSupabase } from "utils/supabaseServer";
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const { wardId, id: projectId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const supabase = createServerSupabase(token);

  // auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ error: "Not authenticated" });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("project_images")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === "POST") {
    // parse multipart: fields => step, type; file => buffer & filename
    try {
      const Busboy = require("busboy");
      const bb = Busboy({ headers: req.headers });
      const fields = {};
      let fileBuffer = null;
      let filename = null;
      let mimeType = null;

      const filePromise = new Promise((resolve, reject) => {
        bb.on("file", (name, file, info) => {
          filename = info.filename;
          mimeType = info.mimeType || info["mime-type"] || "application/octet-stream";
          const chunks = [];
          file.on("data", (c) => chunks.push(c));
          file.on("end", () => {
            fileBuffer = Buffer.concat(chunks);
            resolve();
          });
          file.on("error", reject);
        });

        bb.on("field", (name, val) => {
          fields[name] = val;
        });

        bb.on("finish", () => resolve());
        bb.on("error", reject);
      });

      req.pipe(bb);
      await filePromise;

      if (!fileBuffer || !filename) return res.status(400).json({ error: "No file uploaded" });
      const step = (fields.step || "unknown").replace(/\//g, "_");
      const type = fields.type || "stack";

      const safeFileName = `${Date.now()}-${filename.replace(/\s+/g, "_")}`;
      const destPath = `${wardId}/project/${projectId}/${step}/${safeFileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("ward")
        .upload(destPath, fileBuffer, { upsert: true });

      if (uploadError) {
        console.error("Storage upload error", uploadError);
        return res.status(500).json({ error: uploadError.message });
      }

      // insert DB row
      const { data, error } = await supabase
        .from("project_images")
        .insert({ project_id: projectId, step, type, path: destPath })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      return res.json(data);
    } catch (err) {
      console.error("Error in images POST:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
