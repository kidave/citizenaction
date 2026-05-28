"use client";

import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useAuthorityActions(postId, user) {
  const queryClient = useQueryClient();

  async function updateAuthorities(selected = []) {
    if (!user) return;

    try {
      /* -------------------------
         CLEAN UNIQUE (FRONTEND SAFE)
      ------------------------- */
      const uniqueMap = new Map();
      selected.forEach((a) => {
        uniqueMap.set(a.id, a);
      });

      const uniqueSelected = Array.from(uniqueMap.values());

      /* -------------------------
         DELETE MY OLD TAGS
      ------------------------- */
      const { error: deleteError } = await supabase
        .from("action_escalate")
        .delete()
        .eq("action_id", postId)
        .eq("escalated_by", user.id);

      if (deleteError) throw deleteError;

      /* -------------------------
         INSERT MULTIPLE
      ------------------------- */
      if (uniqueSelected.length > 0) {
        const rows = uniqueSelected.map((a) => ({
          action_id: postId,
          governance_entity_id: a.id,
          escalated_by: user.id,
        }));

        const { error: insertError } = await supabase
          .from("action_escalate")
          .insert(rows);

        if (insertError) throw insertError;
      }

      queryClient.invalidateQueries({ queryKey: ["feed"] });

      toast.success("Authorities updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update authority");
      throw err;
    }
  }

  return { updateAuthorities };
}
