"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = async ({ userId, name, username, designation, locality, mobile, avatar_url, is_email_public, is_mobile_public }) => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from("profile")
        .update({ name, username, designation, locality, mobile, avatar_url, is_email_public, is_mobile_public })
        .eq("user_id", userId)
        .select("*")
        .single();
      if (error) throw error;
      queryClient.setQueryData(queryKeys.users.myProfile(userId), data);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.publicProfile() });
      return data;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateProfile, isUpdating };
}
