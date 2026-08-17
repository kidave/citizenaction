"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/router";
import Link from "next/link";

import {
  ArrowRight,
  FileText,
  Loader2,
  Settings,
  Users,
  UserPlus,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import { useAuth } from "@/context/AuthContext";

import BackButton from "@/components/ui/back-button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

export default function SpaceAdminPage() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const { space: slug } = router.query;

  const [space, setSpace] = useState(null);

  const [pendingApplications, setPendingApplications] = useState(0);

  const [loading, setLoading] = useState(true);

  const [accessDenied, setAccessDenied] = useState(false);

  /* ========================================
     LOAD
  ======================================== */

  useEffect(() => {
    if (!router.isReady || !slug || authLoading) {
      return;
    }

    async function loadAdmin() {
      setLoading(true);
      setAccessDenied(false);

      /*
       * ======================================
       * LOAD SPACE
       * ======================================
       */

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
        console.error("SPACE ADMIN - SPACE ERROR", spaceError);

        setLoading(false);

        return;
      }

      /*
       * ======================================
       * OWNER
       * ======================================
       */

      const isOwner = user?.id === spaceData.owner_user_id;

      /*
       * ======================================
       * CURRENT USER ROLE
       * ======================================
       */

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
          console.error("SPACE ADMIN - MEMBERSHIP ERROR", membershipError);

          setLoading(false);

          return;
        }

        currentUserRole = membership?.role || null;
      }

      /*
       * ======================================
       * ACCESS
       * ======================================
       */

      const isAdmin = currentUserRole === "admin";

      const canManage = isOwner || isAdmin;

      if (!canManage) {
        setAccessDenied(true);
        setLoading(false);

        return;
      }

      setSpace({
        ...spaceData,
        current_user_role: currentUserRole,
        is_owner: isOwner,
        is_admin: isAdmin,
      });

      /*
       * ======================================
       * PENDING APPLICATIONS
       * ======================================
       */

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
          "SPACE ADMIN - APPLICATION COUNT ERROR",
          applicationError,
        );
      }

      setPendingApplications(count || 0);

      setLoading(false);
    }

    loadAdmin();
  }, [router.isReady, slug, user?.id, authLoading]);

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
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />

            <h1 className="mt-4 text-xl font-semibold">Access denied</h1>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              You do not have permission to manage this Space.
            </p>

            <Link href={`/space/${slug}`} className="mt-6">
              <span className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
                Back to Space
              </span>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ========================================
     SPACE NOT FOUND
  ======================================== */

  if (!space) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
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
    <div className="mx-auto max-w-4xl">
      {/* ======================================
          HEADER
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
          CONTENT
      ====================================== */}

      <main className="space-y-6 px-4 py-6">
        {/* ====================================
            INTRO
        ==================================== */}

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Space administration
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage membership, applications and other Space administration
            tasks.
          </p>
        </div>

        {/* ====================================
            MEMBER APPLICATIONS
        ==================================== */}

        <AdminSection
          href={`/space/${space.slug}/admin/application/member`}
          icon={UserPlus}
          title="Member applications"
          description="Review people who want to become members of this Space."
          count={pendingApplications}
          countLabel="pending"
        />

        {/* ====================================
            POSTS
        ==================================== */}

        <AdminSection
          disabled
          icon={FileText}
          title="Posts"
          description="Manage posts published in this Space."
          comingSoon
        />

        {/* ====================================
            SETTINGS
        ==================================== */}

        {space.is_owner && (
          <AdminSection
            href={`/space/${space.slug}/settings`}
            icon={Settings}
            title="Space settings"
            description="Manage Space information, branding and members."
          />
        )}
      </main>
    </div>
  );
}

/* ============================================
   ADMIN SECTION
============================================ */

function AdminSection({
  href,
  icon: Icon,
  title,
  description,
  count,
  countLabel,
  disabled = false,
  comingSoon = false,
}) {
  const content = (
    <Card
      className={
        disabled ? "opacity-60" : "transition-colors hover:bg-muted/40"
      }
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-muted">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-medium">{title}</h2>

            {typeof count === "number" && count > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {count}
              </Badge>
            )}

            {comingSoon && (
              <Badge variant="secondary" className="text-xs">
                Coming soon
              </Badge>
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">{description}</p>

          {typeof count === "number" && (
            <p className="mt-2 text-xs text-muted-foreground">
              {count} {countLabel}
            </p>
          )}
        </div>

        {!disabled && (
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </CardContent>
    </Card>
  );

  if (disabled) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
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
