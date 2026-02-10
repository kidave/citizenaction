import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useCreatePost() {
  async function createPost(payload) {
    const { error } = await supabase
      .from("action_posts")
      .insert(payload);

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success("Post published");
  }

  return { createPost };
}
