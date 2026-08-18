"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { ArrowRight, CheckCircle2, Clock3, Users, XCircle } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

import BackButton from "@/components/ui/back-button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState("members");

  const [members, setMembers] = useState([]);

  const [spaceApplications, setSpaceApplications] = useState([]);

  /* ========================================
     READ TAB FROM URL
  ======================================== */

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const tab = router.query.tab;

    if (tab === "members" || tab === "applications") {
      setActiveTab(tab);
    } else {
      setActiveTab("members");
    }
  }, [router.isReady, router.query.tab]);

  /* ========================================
     LOAD ADMIN DATA
  ======================================== */

  useEffect(() => {
    if (authLoading || !user?.id) {
      return;
    }

    async function loadAdmin() {
      setLoading(true);

      /* ======================================
         CHECK ADMIN ROLE
      ====================================== */

      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        setIsAdmin(false);
        setLoading(false);

        router.replace("/404");

        return;
      }

      setIsAdmin(true);

      /* ======================================
         LOAD MEMBERS
      ====================================== */

      const { data: memberData, error: memberError } = await supabase
        .from("profile")
        .select(
          `
          user_id,
          name,
          username,
          avatar_url,
          designation,
          locality,
          role,
          created_at
        `,
        )
        .order("created_at", {
          ascending: false,
        });

      if (memberError) {
        console.error("[ADMIN] Members error:", memberError);

        setMembers([]);
      } else {
        setMembers(memberData || []);
      }

      /* ======================================
         LOAD SPACE APPLICATIONS
      ====================================== */

      const { data: applicationData, error: applicationError } = await supabase
        .from("space_application")
        .select(
          `
          id,
          proposed_name,
          proposed_slug,
          category,
          category_id,
          status,
          created_at,
          reviewed_at,
          official_category:category_id (
            id,
            name,
            slug
          )
        `,
        )
        .order("created_at", {
          ascending: false,
        });

      if (applicationError) {
        console.error("[ADMIN] Space applications error:", applicationError);

        setSpaceApplications([]);
      } else {
        setSpaceApplications(applicationData || []);
      }

      setLoading(false);
    }

    loadAdmin();
  }, [user?.id, authLoading, router]);

  /* ========================================
     TAB CHANGE
  ======================================== */

  function changeTab(value) {
    setActiveTab(value);

    router.push(
      {
        pathname: "/admin",
        query:
          value === "members"
            ? {}
            : {
                tab: value,
              },
      },
      undefined,
      {
        shallow: true,
      },
    );
  }

  /* ========================================
     LOADING
  ======================================== */

  if (authLoading || loading) {
    return <PageLoader />;
  }

  /* ========================================
     NOT ADMIN
  ======================================== */

  if (!isAdmin) {
    return null;
  }

  /* ========================================
     COUNTS
  ======================================== */

  const pendingApplications = spaceApplications.filter(
    (application) => application.status === "pending",
  );

  const reviewedApplications = spaceApplications.filter(
    (application) => application.status !== "pending",
  );

  return (
    <>
      <Head>
        <title>Admin</title>
      </Head>

      <div className="w-full">
        {/* ======================================
            FULL-WIDTH HEADER
        ====================================== */}

        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="flex h-14 items-center gap-3 px-4 sm:h-16">
            <BackButton />

            <h1 className="truncate font-semibold sm:text-lg">
              Administration
            </h1>
          </div>
        </header>

        {/* ======================================
            FULL-WIDTH TABS
        ====================================== */}

        <Tabs value={activeTab} onValueChange={changeTab}>
          <div className="sticky top-14 z-30 overflow-x-auto border-b bg-background p-2 sm:top-16">
            <div className="flex min-w-full justify-center">
              <TabsList className="flex w-max">
                <TabsTrigger value="members" className="gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Members
                  {members.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 min-w-5 rounded-full px-1.5 text-[10px]"
                    >
                      {members.length}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger value="applications" className="gap-2">
                  Space Applications
                  {pendingApplications.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 min-w-5 rounded-full px-1.5 text-[10px]"
                    >
                      {pendingApplications.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* ======================================
              CONTENT
          ====================================== */}

          <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
            {/* ====================================
                MEMBERS
            ==================================== */}

            <TabsContent value="members">
              <MembersTab members={members} />
            </TabsContent>

            {/* ====================================
                SPACE APPLICATIONS
            ==================================== */}

            <TabsContent value="applications">
              <SpaceApplicationsTab
                pendingApplications={pendingApplications}
                reviewedApplications={reviewedApplications}
              />
            </TabsContent>
          </main>
        </Tabs>
      </div>
    </>
  );
}

/* ============================================
   MEMBERS TAB
============================================ */

function MembersTab({ members }) {
  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No members found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>

        <CardDescription>People registered on Citizen Action.</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y">
          {members.map((member) => (
            <MemberRow key={member.user_id} member={member} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================
   MEMBER ROW
============================================ */

function MemberRow({ member }) {
  const initials =
    member.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="flex items-center gap-4 px-4 py-4 sm:px-6">
      {/* AVATAR */}

      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name || "Member"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium">{initials}</span>
        )}
      </div>

      {/* DETAILS */}

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">
          {member.name || "Unnamed member"}
        </div>

        {member.username && (
          <div className="truncate text-sm text-muted-foreground">
            @{member.username}
          </div>
        )}

        {member.designation && (
          <div className="truncate text-xs text-muted-foreground">
            {member.designation}
          </div>
        )}
      </div>

      {/* ROLE */}

      {member.role && (
        <Badge
          variant={member.role === "admin" ? "default" : "secondary"}
          className="shrink-0"
        >
          {member.role}
        </Badge>
      )}
    </div>
  );
}

/* ============================================
   SPACE APPLICATIONS TAB
============================================ */

function SpaceApplicationsTab({ pendingApplications, reviewedApplications }) {
  return (
    <div className="space-y-8">
      {/* ======================================
          PAGE INTRO
      ====================================== */}

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Space Applications
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Review and approve applications for new Spaces.
        </p>
      </div>

      {/* ======================================
          PENDING
      ====================================== */}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Pending applications</h3>

            <p className="text-sm text-muted-foreground">
              Applications waiting for review.
            </p>
          </div>

          <Badge variant="outline">{pendingApplications.length}</Badge>
        </div>

        {pendingApplications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No pending Space applications.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingApplications.map((application) => (
              <ApplicationRow key={application.id} application={application} />
            ))}
          </div>
        )}
      </section>

      {/* ======================================
          REVIEWED
      ====================================== */}

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Reviewed applications</h3>

          <p className="text-sm text-muted-foreground">
            Previously approved or rejected applications.
          </p>
        </div>

        {reviewedApplications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No reviewed applications yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reviewedApplications.map((application) => (
              <ApplicationRow key={application.id} application={application} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================================
   APPLICATION ROW
============================================ */

function ApplicationRow({ application }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{application.proposed_name}</h3>

            <StatusBadge status={application.status} />
          </div>

          <p className="text-sm text-muted-foreground">
            /{application.proposed_slug}
          </p>

          {application.category && (
            <p className="line-clamp-2 text-sm">
              <span className="text-muted-foreground">Applicant says:</span>{" "}
              {application.category}
            </p>
          )}

          {application.official_category && (
            <p className="text-sm">
              <span className="text-muted-foreground">Official category:</span>{" "}
              {application.official_category.name}
            </p>
          )}
        </div>

        <Button asChild className="shrink-0">
          <Link href={`/admin/space/${application.id}`}>
            Review
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/* ============================================
   STATUS BADGE
============================================ */

function StatusBadge({ status }) {
  if (status === "approved") {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approved
      </Badge>
    );
  }

  if (status === "rejected") {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <XCircle className="h-3.5 w-3.5" />
        Rejected
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5">
      <Clock3 className="h-3.5 w-3.5" />
      Pending
    </Badge>
  );
}

/* ============================================
   LOADER
============================================ */

function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
    </div>
  );
}
