// utils/storageFile.js
import { supabase } from "utils/supabaseClient";

export const resolveImageUrl = (path) => {
  if (!path) return "/no-image.svg";
  if (typeof path === 'string' && path.startsWith('http')) {
    return path;
  }
  return supabase.storage.from("ward").getPublicUrl(path).data.publicUrl;
};