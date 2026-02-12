import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachment } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useCreatePost() {
  const [isLoading, setIsLoading] = useState(false);

  const createPost = async (postData) => {
    setIsLoading(true);

    try {
      // Upload attachments if any
      let uploadedAttachments = [];
      if (postData.attachments?.length > 0) {
        const uploadPromises = postData.attachments.map(file => 
          uploadPostAttachment(file, postData.author_id)
        );
        uploadedAttachments = await Promise.all(uploadPromises);
      }

      // Create post
      const { error } = await supabase
        .from("action_posts")
        .insert({
          author_id: postData.author_id,
          geo_scope_type: postData.geo_scope_type,
          geo_scope_code: postData.geo_scope_code,
          action_category: postData.action_category,
          summary: postData.summary,
          details: postData.details,
          attachments: uploadedAttachments
        });

      if (error) throw error;

      toast.success("Post published successfully!");
      return true;
    } catch (error) {
      console.error("Create post error:", error);
      toast.error(error.message || "Failed to create post");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPost, isLoading };
}