import { supabase } from "utils/supabaseClient";

export function getPublicImageUrl(path) {
  return supabase.storage.from("project-images").getPublicUrl(path).data.publicUrl;
}
