"use client";

import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useAuthorityActions(postId, user) {
  const queryClient = useQueryClient();

  async function updateAuthorities(selected = []) {
    if (!user) return;

    // 🔥 enforce single authority
    const authority = selected?.[0] || null;

    try {
      /* -------------------------
         DELETE ONLY MY OLD TAG
      ------------------------- */
      const { error: deleteError } = await supabase
        .from("action_escalate")
        .delete()
        .eq("action_id", postId)
        .eq("escalated_by", user.id);

      if (deleteError) throw deleteError;

      /* -------------------------
         INSERT NEW (IF EXISTS)
      ------------------------- */
      if (authority) {
        const { error: insertError } = await supabase
          .from("action_escalate")
          .insert({
            action_id: postId,
            governance_entity_id: authority.id,
            escalated_by: user.id,
          });

        if (insertError) throw insertError;
      }

      /* -------------------------
         REFRESH FEED
      ------------------------- */
      queryClient.invalidateQueries({ queryKey: ["feed"] });

      toast.success("Authority updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update authority");
      throw err;
    }
  }

  return {
    updateAuthorities,
  };
}