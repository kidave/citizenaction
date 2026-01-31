import { createServerSupabase } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check authentication
  const session = await getServerSession(req, res);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createServerSupabase(session);
  const { community, scopetype, scopecode } = req.query;

  // Verify community exists and user is owner
  const { data: parentCommunity, error: communityError } = await supabase
    .from("community")
    .select("owner_id")
    .eq("slug", community)
    .single();

  if (communityError || !parentCommunity) {
    return res.status(404).json({ error: "Community not found" });
  }

  if (parentCommunity.owner_id !== session.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Parse form data
  const form = formidable({ 
    multiples: false,
    maxFileSize: 5 * 1024 * 1024,
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file;
    const type = fields.type; // 'logo' or 'cover'

    if (!file || !type || !['logo', 'cover'].includes(type)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "File too large. Maximum 5MB." });
    }

    // Upload to Supabase
    const fileExt = file.originalFilename.split('.').pop();
    const filePath = `committees/${community}/${scopetype}_${scopecode}/${type}.${fileExt}`;
    const fileBuffer = fs.readFileSync(file.filepath);

    const { error: uploadError } = await supabase.storage
      .from("community-branding")
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload file" });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("community-branding")
      .getPublicUrl(filePath);

    // Clean up
    fs.unlinkSync(file.filepath);

    res.status(200).json({ url: urlData.publicUrl });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Server error during upload" });
  }
}