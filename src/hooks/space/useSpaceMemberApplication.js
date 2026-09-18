"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export function useSpaceMemberApplication({
  applicationId,
  userId,
  enabled = true,
}) {
  return useQuery({
    queryKey: queryKeys.spaces.memberApplication(applicationId, userId),
    enabled: enabled && !!applicationId && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("space_member_application")
        .select(`
          id,
          space_id,
          applicant_user_id,
          message,
          status,
          admin_notes,
          reviewed_at,
          created_at,
          space:space_id (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .eq("id", applicationId)
        .eq("applicant_user_id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
