"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachment } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useCreatePost() {
  const [isLoading, setIsLoading] = useState(false);

  const createPost = async (postData) => {
    setIsLoading(true);

    try {
      // 1️⃣ Upload attachments
      let uploadedAttachments = [];
      if (postData.attachments?.length > 0) {
        const uploadPromises = postData.attachments.map((file) =>
          uploadPostAttachment(file, postData.author_id)
        );
        uploadedAttachments = await Promise.all(uploadPromises);
      }

      // 2️⃣ Insert feed
      const { data: feedRow, error } = await supabase
        .from("feed")
        .insert({
          author_id: postData.author_id,
          scope_type: postData.scope_type,
          scope_code: postData.scope_code,
          type: postData.type,
          summary: postData.summary,
          details: postData.details,
          attachments: uploadedAttachments,
          status: postData.status || null,
          metadata: postData.metadata || null,
        })
        .select()
        .single();

      if (error) throw error;

      // 3️⃣ Insert governance relations
      if (postData.governance_entities?.length > 0) {
        const relations = postData.governance_entities.map((e) => ({
          feed_id: feedRow.id,
          governance_entity_id: e.id,
          governance_entity_type: e.entity_type,
        }));

        const { error: relationError } = await supabase
          .from("feed_governance_entities")
          .insert(relations);

        if (relationError) throw relationError;
      }

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