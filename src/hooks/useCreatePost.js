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
      /* ------------------------------------ */
      /* 1️⃣ Upload Attachments               */
      /* ------------------------------------ */
      let uploadedAttachments = [];

      if (postData.attachments?.length > 0) {
        const uploadPromises = postData.attachments.map((file) =>
          uploadPostAttachment(file, postData.author_id)
        );

        uploadedAttachments = await Promise.all(uploadPromises);
      }

      /* ------------------------------------ */
      /* 2️⃣ Insert Feed Row                  */
      /* ------------------------------------ */
      const { data: feedRow, error: feedError } = await supabase
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

      if (feedError) throw feedError;

      /* ------------------------------------ */
      /* 3️⃣ Insert Governance Tag Relations  */
      /* ------------------------------------ */
      if (postData.governance_entities?.length > 0) {
        const relations = postData.governance_entities.map((entity) => ({
          feed_id: feedRow.id,
          governance_entity_id: entity.id, // ← Only ID needed now
        }));

        const { error: relationError } = await supabase
          .from("feed_governance_entities")
          .insert(relations);

        if (relationError) throw relationError;
      }

      toast.success("Post published successfully!");
      return feedRow;
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