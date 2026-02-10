import { supabase } from "./supabase/client";

export async function uploadAttachment(file, userId) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("post-attachments")
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from("post-attachments")
    .getPublicUrl(path);

  return {
    type: file.type.startsWith("image") ? "image" : "file",
    url: data.publicUrl,
    name: file.name,
  };
}
