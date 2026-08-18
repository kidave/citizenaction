"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { Loader2, Settings, Users } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import { useAuth } from "@/context/AuthContext";

import BackButton from "@/components/ui/back-button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";

import SpaceMemberApplications from "@/components/space/SpaceMemberApplications";

import SpaceGeneralSettings from "@/components/space/SpaceGeneralSettings";
import SpaceMembersSettings from "@/components/space/SpaceMembersSettings";

export default function SpaceAdminPage() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const { space: slug, tab } = router.query;

  const [space, setSpace] = useState(null);

  const [pendingApplications, setPendingApplications] = useState(0);

  const [loading, setLoading] = useState(true);

  const [accessDenied, setAccessDenied] = useState(false);

  const activeTab = tab || "applications";

  /* ========================================
     LOAD SPACE + PERMISSIONS
  ======================================== */

  useEffect(() => {
    if (!router.isReady || !slug || authLoading) {
      return;
    }

    async function loadAdmin() {
      setLoading(true);
      setAccessDenied(false);

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

      if (spaceError || !spaceData) {
        console.error("[SPACE ADMIN] Space error:", spaceError);

        setLoading(false);

        return;
      }

      /* ======================================
         OWNER
      ====================================== */

      const isOwner = user?.id === spaceData.owner_user_id;

      /* ======================================
         CURRENT USER ROLE
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
          console.error("[SPACE ADMIN] Membership error:", membershipError);

          setLoading(false);

          return;
        }

        currentUserRole = membership?.role || null;
      }

      /* ======================================
         PERMISSIONS
      ====================================== */

      const isAdmin = currentUserRole === "admin";

      const canManage = isOwner || isAdmin;

      if (!canManage) {
        setAccessDenied(true);
        setLoading(false);

        return;
      }

      /* ======================================
         PENDING APPLICATION COUNT
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
        console.error(
          "[SPACE ADMIN] Application count error:",
          applicationError,
        );
      }

      setSpace({
        ...spaceData,
        current_user_role: currentUserRole,
        is_owner: isOwner,
        is_admin: isAdmin,
      });

      setPendingApplications(count || 0);

      setLoading(false);
    }

    loadAdmin();
  }, [router.isReady, slug, user?.id, authLoading]);

  /* ========================================
     TAB CHANGE
  ======================================== */

  function changeTab(value) {
    router.push(
      {
        pathname: `/space/${slug}/admin`,
        query: value === "applications" ? {} : { tab: value },
      },
      undefined,
      {
        shallow: true,
      },
    );
  }

  /* ========================================
     AUTH LOADING
  ======================================== */

  if (authLoading) {
    return <PageLoader />;
  }

  /* ========================================
     PAGE LOADING
  ======================================== */

  if (loading) {
    return <PageLoader />;
  }

  /* ========================================
     ACCESS DENIED
  ======================================== */

  if (accessDenied) {
    return (
      <div className="w-full px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />

              <h1 className="mt-4 text-xl font-semibold">Access denied</h1>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                You do not have permission to manage this Space.
              </p>

              <Link
                href={`/space/${slug}`}
                className="mt-6 inline-flex rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Back to Space
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ========================================
     SPACE NOT FOUND
  ======================================== */

  if (!space) {
    return (
      <div className="w-full px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Space not found</h1>

        <p className="mt-2 text-muted-foreground">
          The requested Space does not exist.
        </p>
      </div>
    );
  }

  /* ========================================
     PAGE
  ======================================== */

  return (
    <div className="w-full">
      {/* ======================================
          FULL-WIDTH HEADER
      ====================================== */}

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 sm:h-16">
          <BackButton />

          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold sm:text-lg">
              {space.name}
            </div>

            <div className="text-xs text-muted-foreground">Administration</div>
          </div>

          <Badge variant="secondary">
            {space.is_owner ? "Owner" : "Admin"}
          </Badge>
        </div>
      </header>

      {/* ======================================
          TABS
      ====================================== */}

      <Tabs value={activeTab} onValueChange={changeTab}>
        <div className="sticky top-14 z-30 overflow-x-auto border-b bg-background p-2 sm:top-16">
          <div className="flex min-w-full justify-center">
            <TabsList className="flex w-max">
              {/* APPLICATIONS */}

              <TabsTrigger value="applications" className="gap-2">
                Applications
                {pendingApplications > 0 && (
                  <Badge
                    variant="destructive"
                    className="h-5 min-w-5 rounded-full px-1.5 text-[10px]"
                  >
                    {pendingApplications}
                  </Badge>
                )}
              </TabsTrigger>

              {/* SETTINGS */}

              {space.is_owner && (
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>

        {/* ======================================
            CONTENT
        ====================================== */}

        <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
          {/* ====================================
              APPLICATIONS
          ==================================== */}

          <TabsContent value="applications">
            <SpaceMemberApplications
              space={space}
              onPendingCountChange={setPendingApplications}
            />
          </TabsContent>

          {/* ====================================
              SETTINGS
          ==================================== */}

          {space.is_owner && (
            <TabsContent value="settings">
              <SpaceSettingsContent spaceSlug={space.slug} />
            </TabsContent>
          )}
        </main>
      </Tabs>
    </div>
  );
}

/* ============================================
   SPACE SETTINGS CONTENT
============================================ */

function SpaceSettingsContent({ spaceSlug }) {
  return (
    <Tabs defaultValue="general">
      {/* SETTINGS SUB-TABS */}

      <div className="mb-6 overflow-x-auto">
        <TabsList className="flex w-max">
          <TabsTrigger value="general">General</TabsTrigger>

          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
      </div>

      {/* GENERAL */}

      <TabsContent value="general">
        <SpaceGeneralSettings spaceSlug={spaceSlug} />
      </TabsContent>

      {/* MEMBERS */}

      <TabsContent value="members">
        <SpaceMembersSettings spaceSlug={spaceSlug} />
      </TabsContent>
    </Tabs>
  );
}

/* ============================================
   PAGE LOADER
============================================ */

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
