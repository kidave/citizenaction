"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function useMyProfile() {
  const { user, loading } = useAuth();

  return useQuery({
    queryKey: ["my-profile", user?.id],

    enabled: !!user && !loading,

    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
  });
}
