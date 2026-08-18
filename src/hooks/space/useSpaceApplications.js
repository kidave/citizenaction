"use client";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

export function useSpaceApplications({ spaceId, enabled = true }) {
  const query = useQuery({
    queryKey: ["space-applications", spaceId],

    enabled: enabled && !!spaceId,

    queryFn: async () => {
      const { data, error } = await supabase
        .from("space_member_application")
        .select(
          `
          id,
          space_id,
          applicant_user_id,
          message,
          status,
          created_at,
          reviewed_at,
          reviewed_by,

          applicant:applicant_user_id (
            user_id,
            name,
            username,
            avatar_url
          )
        `,
        )
        .eq("space_id", spaceId)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      return data || [];
    },

    staleTime: 1000 * 60 * 5,
  });

  const applications = query.data || [];

  const pendingApplications = applications.filter(
    (application) => application.status === "pending",
  );

  const reviewedApplications = applications.filter(
    (application) => application.status !== "pending",
  );

  return {
    ...query,

    applications,

    pendingApplications,

    reviewedApplications,

    pendingCount: pendingApplications.length,
  };
}
