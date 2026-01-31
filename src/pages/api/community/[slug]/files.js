import { createServerSupabase } from "@/lib/supabase/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

import { IncomingForm } from "formidable";

export default async function handler(req, res) {
  if (req.method === "POST") {
    return handleUpload(req, res);
  }
  
  if (req.method === "DELETE") {
    return handleDelete(req, res);
  }
  
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleUpload(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createServerSupabase(token);
  const { slug } = req.query;

  try {
    // Verify user owns community
    const { data: { user } } = await supabase.auth.getUser();
    const { data: community } = await supabase
      .from("community")
      .select("owner_user_id")
      .eq("slug", slug)
      .single();

    if (!community || community.owner_user_id !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Parse form data
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file?.[0];
    const type = fields.type?.[0];

    if (!file || !type) {
      return res.status(400).json({ error: "File and type are required" });
    }

    // Validate file type
    if (!file.mimetype?.startsWith("image/")) {
      return res.status(400).json({ error: "Only image files are allowed" });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "File size must be less than 5MB" });
    }

    // Determine file extension
    const fileExt = file.originalFilename?.split('.').pop() || "jpg";
    const fileName = `${slug}/${type}.${fileExt}`;

    // Read file as buffer
    const fs = require('fs');
    const fileBuffer = fs.readFileSync(file.filepath);

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('community-branding')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload file to storage" });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('community-branding')
      .getPublicUrl(fileName);

    // Update database using service role (bypasses RLS)
    const { error: dbError } = await supabase
      .from("community")
      .update({ [`${type}_url`]: publicUrl })
      .eq("slug", slug);

    if (dbError) {
      console.error("Database update error:", dbError);
      return res.status(500).json({ error: "Failed to update database" });
    }

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleDelete(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createServerSupabase(token);
  const { slug } = req.query;

  try {
    // Parse request body
    let body = '';
    req.on('data', chunk => body += chunk);
    await new Promise(resolve => req.on('end', resolve));
    
    const { type } = JSON.parse(body || '{}');
    
    if (!type || !['logo', 'cover'].includes(type)) {
      return res.status(400).json({ error: "Valid type (logo or cover) is required" });
    }

    // Verify user owns community
    const { data: { user } } = await supabase.auth.getUser();
    const { data: community } = await supabase
      .from("community")
      .select("owner_user_id, logo_url, cover_url")
      .eq("slug", slug)
      .single();

    if (!community || community.owner_user_id !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Delete file from storage if exists
    const fileUrl = community[`${type}_url`];
    if (fileUrl) {
      const fileName = fileUrl.split('/').pop();
      await supabase.storage
        .from('community-branding')
        .remove([`${slug}/${fileName}`])
        .catch(err => console.log("File already deleted:", err.message));
    }

    // Update database (set to null)
    const { error: dbError } = await supabase
      .from("community")
      .update({ [`${type}_url`]: null })
      .eq("slug", slug);

    if (dbError) {
      console.error("Database update error:", dbError);
      return res.status(500).json({ error: "Failed to update database" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("File delete error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}