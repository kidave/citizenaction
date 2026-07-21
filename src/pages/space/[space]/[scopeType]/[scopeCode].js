import Head from "next/head";
import { createServerSupabase } from "@/lib/supabase/server";

import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useClubs } from "@/hooks/space/useClubs";

import ActivityTab from "@/components/tabs/ActivityTab";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import PageHeaderSkeleton from "@/components/skeletons/PageHeaderSkeleton";
import MetaCardsSkeleton from "@/components/skeletons/MetaCardsSkeleton";

export async function getServerSideProps({ params }) {
  const supabase = createServerSupabase();

  const { space, scopeType, scopeCode } = params;

  const { data } = await supabase
    .from("club")
    .select("*")
    .eq("space_slug", space)
    .eq("scope_type", scopeType)
    .eq("scope_code", scopeCode)
    .single();

  return {
    props: {
      ssrClub: data || null,
    },
  };
}

export default function ClubPage() {
  const router = useRouter();
  const { space, scopeType, scopeCode, tab } = router.query;

  const { user, loading: authLoading } = useAuth();

  const {
    data: clubs = [],
    isLoading: clubLoading,
    error,
  } = useClubs({
    spaceSlug: space,
    scopeType,
    scopeCode,
    enabled: !!space && !!scopeType && !!scopeCode,
  });

  const club = clubs?.[0];

  const activeTab = tab || "overview";

  const base = `/space/${space}/${scopeType}/${scopeCode}`;

  if (clubLoading || !space || !scopeType || !scopeCode) {
    return (
      <div className="mx-auto my-auto max-w-6xl space-y-4 px-4 py-4">
        <PageHeaderSkeleton />
        <MetaCardsSkeleton />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Club not found</h2>

        <Link href={`/space/${space}`}>
          <Button variant="outline" className="mt-4">
            Back to Space
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = !!user && user.id === club.owner_user_id;

  return (
    <div
      className="mx-auto my-auto max-w-6xl space-y-6 px-4 py-4"
      style={
        club.primary_color
          ? { "--club-primary": club.primary_color }
          : undefined
      }
    >
      {/* HEADER */}

      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href={`/space/${space}`}>
            <div className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted">
              <ArrowLeft className="h-4 w-4" />
            </div>
          </Link>

          {club.logo_url && (
            <Image
              src={club.logo_url}
              alt={`${club.name} logo`}
              width={56}
              height={56}
              className="rounded-md border"
            />
          )}

          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">{club.name}</h1>

            {club.scope_type && <Badge>{club.scope_type.toUpperCase()}</Badge>}
          </div>
        </div>

        {club.description && (
          <p className="max-w-3xl text-muted-foreground">{club.description}</p>
        )}
      </header>

      {/* TABS */}

      <Tabs value={activeTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" onClick={() => router.push(base)}>
            Overview
          </TabsTrigger>

          <TabsTrigger
            value="members"
            onClick={() => router.push(`${base}?tab=members`)}
          >
            Members
          </TabsTrigger>

          <TabsTrigger
            value="activity"
            onClick={() => router.push(`${base}?tab=activity`)}
          >
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              className="border-l-4"
              style={{ borderLeftColor: "var(--club-primary)" }}
            >
              <CardHeader>
                <CardTitle>Club Owner</CardTitle>
                <CardDescription>Primary point of contact</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-3">
                  <Image
                    src={club.owner_avatar_url || "/user1.png"}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full"
                  />

                  <span className="font-medium">
                    {club.owner_name || "Unnamed user"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>

              <CardContent className="space-y-1 text-sm">
                {club.email && <div>{club.email}</div>}
                {club.contact_number && <div>{club.contact_number}</div>}
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="members">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>Club members will appear here.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTab clubId={club.id} />
        </TabsContent>
      </Tabs>

      {/* ACTION BUTTONS */}

      <div className="flex gap-3 pt-2">
        {!authLoading && !isOwner && (
          <>
            <Link
              href={`/apply/space/${space}/${scopeType}/${scopeCode}`}
              className="rounded-md border bg-black px-4 py-2 text-sm text-white"
            >
              Join Club
            </Link>

            <Link
              href={`/space/${space}/${scopeType}/${scopeCode}/donate`}
              className="rounded-md border bg-muted px-4 py-2 text-sm"
            >
              Donate
            </Link>
          </>
        )}

        {!authLoading && isOwner && (
          <Link
            href={`/manage/${space}/${scopeType}/${scopeCode}`}
            className="rounded-md border bg-black px-4 py-2 text-sm text-white"
          >
            Manage Club
          </Link>
        )}
      </div>
    </div>
  );
}
