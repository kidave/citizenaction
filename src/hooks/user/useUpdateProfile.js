"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabase/client";

export function useUpdateProfile() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = async ({
    userId,
    name,
    username,
    designation,
    locality,
    is_email_public,
    is_mobile_public,
  }) => {
    try {
      setIsUpdating(true);

      const { data, error } = await supabase
        .from("profile")
        .update({
          name,
          username,
          designation,
          locality,
          is_email_public,
          is_mobile_public,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProfile,
    isUpdating,
  };
}
