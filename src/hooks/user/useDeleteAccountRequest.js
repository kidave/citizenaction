"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabase/client";

export function useDeleteAccountRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestAccountDeletion = async ({ username, userId }) => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase.from("delete_account_requests").insert({
        username,
        user_id: userId,
      });

      if (error) {
        throw error;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    requestAccountDeletion,
    isSubmitting,
  };
}
