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
        .from("feed")
        .insert({
          author_id: postData.author_id,
          scope_type: postData.scope_type,
          scope_code: postData.scope_code,
          type: postData.type,
          summary: postData.summary,
          details: postData.details,
          attachments: uploadedAttachments,
          governance_entity_id: postData.governance_entity_id || null,
          governance_entity_type: postData.governance_entity_type || null,
          status: postData.status || null,
          metadata: postData.metadata || null,
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