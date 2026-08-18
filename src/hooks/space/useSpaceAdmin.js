"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { useAuth } from "@/context/AuthContext";

export function useSpaceAdmin(slug) {
  const { user, loading: authLoading } = useAuth();

  const [space, setSpace] = useState(null);

  const [pendingApplications, setPendingApplications] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (authLoading || !slug) {
      return;
    }

    async function loadSpaceAdmin() {
      setIsLoading(true);
      setError(null);
      setAccessDenied(false);

      try {
        /* ======================================
           SPACE
        ====================================== */

        const { data: spaceData, error: spaceError } = await supabase
          .from("space")
          .select(
            `
              id,
              name,
              slug,
              description,
              owner_user_id,
              logo_url,
              is_active
            `,
          )
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (spaceError) {
          throw spaceError;
        }

        if (!spaceData) {
          setError("Space not found");
          return;
        }

        /* ======================================
           OWNER
        ====================================== */

        const isOwner = user?.id === spaceData.owner_user_id;

        /* ======================================
           MEMBERSHIP
        ====================================== */

        let currentUserRole = null;

        if (user?.id) {
          const { data: membership, error: membershipError } = await supabase
            .from("space_member")
            .select("role, is_active, is_suspended")
            .eq("space_id", spaceData.id)
            .eq("user_id", user.id)
            .eq("is_active", true)
            .eq("is_suspended", false)
            .maybeSingle();

          if (membershipError) {
            throw membershipError;
          }

          currentUserRole = membership?.role || null;
        }

        /* ======================================
           PERMISSIONS
        ====================================== */

        const isAdmin = currentUserRole === "admin";

        const canManage = isOwner || isAdmin;

        const canManageSettings = isOwner;

        if (!canManage) {
          setAccessDenied(true);
          return;
        }

        /* ======================================
           PENDING APPLICATIONS
        ====================================== */

        const { count, error: applicationError } = await supabase
          .from("space_member_application")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("space_id", spaceData.id)
          .eq("status", "pending");

        if (applicationError) {
          throw applicationError;
        }

        /* ======================================
           RESULT
        ====================================== */

        setSpace({
          ...spaceData,
          current_user_role: currentUserRole,
          is_owner: isOwner,
          is_admin: isAdmin,
        });

        setPendingApplications(count || 0);
      } catch (err) {
        console.error("[SPACE ADMIN]", err);

        setError(err?.message || "Unable to load Space administration.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSpaceAdmin();
  }, [slug, user?.id, authLoading]);

  return {
    space,
    pendingApplications,
    isLoading,
    error,
    accessDenied,

    isOwner: space?.is_owner || false,
    isAdmin: space?.is_admin || false,

    canManage: space?.is_owner || space?.is_admin || false,

    canManageSettings: space?.is_owner || false,
  };
}
