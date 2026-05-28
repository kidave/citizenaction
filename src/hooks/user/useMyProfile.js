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
      const { data, error } = await supabase
        .from("public_profile")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // 🔥 IMPORTANT FIX
      return data?.[0] || null;
    },
  });
}
