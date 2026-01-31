// pages/community/[community].js
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useCommunityPublic } from "@/hooks/useCommunityPublic";
import { useCommunityCommittees } from "@/hooks/useCommunityCommittees";

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const slug = router.query.community;

  const {
    data: community,
    isLoading,
    error,
  } = useCommunityPublic(slug);

  const {
    data: committees = [],
    isLoading: committeesLoading,
  } = useCommunityCommittees(slug);

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error || !community) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Community not found</h2>
        <p className="text-muted-foreground mt-2">
          The requested community does not exist or is unavailable.
        </p>
      </div>
    );
  }

  const isOwner = !!user && user.id === community.owner_id;

  /* ---------------- PAGE ---------------- */
  return (
    <div
      className="max-w-6xl mx-auto px-4 py-10 space-y-10"
      style={
        community.primary_color
          ? { "--community-primary": community.primary_color }
          : undefined
      }
    >
      {/* ================= HEADER ================= */}
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          {/* LOGO */}
          {community.logo_url && (
            <img
              src={community.logo_url}
              alt={`${community.name} logo`}
              className="h-14 w-14 rounded-md object-contain border"
            />
          )}

          {/* NAME */}
          <h1 className="text-3xl font-semibold tracking-tight">
            {community.name}
          </h1>
        </div>

        {community.description && (
          <p className="text-muted-foreground max-w-3xl">
            {community.description}
          </p>
        )}
      </header>

      {/* ================= META CARDS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Owner */}
        <Card className="border-l-4" style={{ borderLeftColor: "var(--community-primary)" }}>
          <CardHeader>
            <CardTitle>Community Owner</CardTitle>
            <CardDescription>
              Primary point of contact
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <img
                src={community.avatar_url || "/user1.png"}
                alt={community.owner_name || "Owner"}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="font-medium">
                {community.owner_name || "Unnamed user"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>
              Official communication details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-1 text-sm">
            {community.email && <div>{community.email}</div>}
            {community.contact_number && <div>{community.contact_number}</div>}
            {!community.email && !community.contact_number && (
              <span className="text-muted-foreground">Not provided</span>
            )}
          </CardContent>
        </Card>

        {/* Website */}
        <Card>
          <CardHeader>
            <CardTitle>Website</CardTitle>
            <CardDescription>
              External link
            </CardDescription>
          </CardHeader>

          <CardContent>
            {community.website ? (
              <Link
                href={community.website}
                target="_blank"
                className="underline underline-offset-4 text-sm"
              >
                {community.website}
              </Link>
            ) : (
              <span className="text-muted-foreground text-sm">
                Not provided
              </span>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ================= COMMITTEES SECTION ================= */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Committees</h2>
          {isOwner && (
            <Link href={`/apply/community/${community.slug}/committee`}>
              <Button>Create Committee</Button>
            </Link>
          )}
        </div>

        {committeesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : committees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {committees.map((committee) => (
              <Card key={committee.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{committee.name}</CardTitle>
                    {committee.scope_type && (
                      <Badge variant="outline">{committee.scope_type}</Badge>
                    )}
                  </div>
                  {committee.scope_code && (
                    <CardDescription>
                      Scope: {committee.scope_code}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {committee.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {committee.description}
                    </p>
                  )}
                  <div className="mt-4 text-xs text-muted-foreground">
                    {committee.member_count ? (
                      <span>{committee.member_count} members</span>
                    ) : (
                      <span>No members yet</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/community/${community.slug}/committee/${committee.scope_type}/${committee.scope_code}`}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      View Committee
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Committees</CardTitle>
              <CardDescription>
                No committees have been published yet.
              </CardDescription>
            </CardHeader>
            {isOwner && (
              <CardFooter>
                <Link href={`/apply/community/${community.slug}/committee`}>
                  <Button>Create First Committee</Button>
                </Link>
              </CardFooter>
            )}
          </Card>
        )}
      </section>

      {/* ================= RECENT ACTIVITY ================= */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Actions and updates will appear here.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* ================= ACTIONS ================= */}
      <div className="flex gap-3 pt-2">
        {/* DONATE → only for non-owners */}
        {!authLoading && !isOwner && (
          <Link
            href={`/community/${community.slug}/donate`}
            className="inline-flex items-center justify-center rounded-md border bg-black text-white px-4 py-2 text-sm font-medium"
          >
            Donate
          </Link>
        )}

        {/* MANAGE → only for owner */}
        {!authLoading && isOwner && (
          <Link
            href={`/manage/community/${community.slug}`}
            className="inline-flex items-center justify-center rounded-md border bg-black text-white px-4 py-2 text-sm font-medium"
          >
            Manage Community
          </Link>
        )}
      </div>
    </div>
  );
}