"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { uploadPostAttachment } from "@/lib/supabase/storage";
import { toast } from "sonner";

export function useEditPost() {
  const [isLoading, setIsLoading] = useState(false);

  const editPost = async (postId, updatedData) => {
    setIsLoading(true);

    try {
      /* ---------------------------- */
      /* 1️⃣ Update Feed Row          */
      /* ---------------------------- */
      const { error: feedError } = await supabase
        .from("feed")
        .update({
          summary: updatedData.summary,
          details: updatedData.details,
          status: updatedData.status || null,
          metadata: updatedData.metadata || null,
        })
        .eq("id", postId);

      if (feedError) throw feedError;

      /* ---------------------------- */
      /* 2️⃣ Delete Old Tag Relations */
      /* ---------------------------- */
      const { error: deleteError } = await supabase
        .from("feed_governance_entities")
        .delete()
        .eq("feed_id", postId);

      if (deleteError) throw deleteError;

      /* ---------------------------- */
      /* 3️⃣ Insert New Tags          */
      /* ---------------------------- */
      if (updatedData.governance_entities?.length > 0) {
        const relations = updatedData.governance_entities.map((entity) => ({
          feed_id: postId,
          governance_entity_id: entity.id,
        }));

        const { error: insertError } = await supabase
          .from("feed_governance_entities")
          .insert(relations);

        if (insertError) throw insertError;
      }

      toast.success("Post updated successfully!");
      return true;
    } catch (error) {
      console.error("Edit post error:", error);
      toast.error(error.message || "Failed to update post");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { editPost, isLoading };
}