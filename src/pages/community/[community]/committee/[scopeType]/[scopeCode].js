// pages/community/[community]/committee/[scopeType]/[scopeCode].js
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommitteePublic } from "@/hooks/useCommitteePublic";

export default function CommitteePage() {
  const router = useRouter();
  const { community, scopeType, scopeCode } = router.query;
  const { user, loading: authLoading } = useAuth();

  const {
    data: committee,
    isLoading,
    error,
  } = useCommitteePublic(community, scopeType, scopeCode);

  /* ---------------- LOADING ---------------- */
  if (isLoading || !community || !scopeType || !scopeCode) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-20 ml-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error || !committee) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Committee not found</h2>
        <p className="text-muted-foreground mt-2">
          The requested committee does not exist or is unavailable.
        </p>
        <Link href={`/community/${community}`}>
          <Button variant="outline" className="mt-4">
            Back to Community
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = !!user && user.id === committee.owner_user_id;

  /* ---------------- PAGE ---------------- */
  return (
    <div
      className="max-w-6xl mx-auto px-4 py-10 space-y-10"
      style={
        committee.primary_color
          ? { "--committee-primary": committee.primary_color }
          : undefined
      }
    >
      {/* ================= HEADER ================= */}
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <Link
            href={`/community/${community}`}
            className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* LOGO */}
          {committee.logo_url && (
            <img
              src={committee.logo_url}
              alt={`${committee.name} logo`}
              className="h-14 w-14 rounded-md object-contain border"
            />
          )}

          {/* NAME & BADGE */}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {committee.name}
            </h1>
            {committee.scope_type && (
              <Badge className="ml-2">{committee.scope_type}</Badge>
            )}
          </div>
        </div>

        {/* SCOPE INFO */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>
            {scopeType}: {scopeCode}
          </span>
          <span>•</span>
          <Link 
            href={`/community/${community}`}
            className="hover:underline hover:text-foreground"
          >
            Community: {committee.community_name || community}
          </Link>
        </div>

        {/* DESCRIPTION */}
        {committee.description && (
          <p className="text-muted-foreground max-w-3xl">
            {committee.description}
          </p>
        )}
      </header>

      {/* ================= META CARDS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Owner */}
        <Card className="border-l-4" style={{ borderLeftColor: "var(--committee-primary)" }}>
          <CardHeader>
            <CardTitle>Committee Owner</CardTitle>
            <CardDescription>
              Primary point of contact
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <img
                src={committee.owner_avatar_url || "/user1.png"}
                alt={committee.owner_name || "Owner"}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="font-medium">
                {committee.owner_name || "Unnamed user"}
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
            {committee.email && <div>{committee.email}</div>}
            {committee.contact_number && <div>{committee.contact_number}</div>}
            {!committee.email && !committee.contact_number && (
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
            {committee.website ? (
              <Link
                href={committee.website}
                target="_blank"
                className="underline underline-offset-4 text-sm"
              >
                {committee.website}
              </Link>
            ) : (
              <span className="text-muted-foreground text-sm">
                Not provided
              </span>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ================= MEMBERS SECTION ================= */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Members</h2>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Committee members and volunteers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No members listed yet.</p>
          </CardContent>
        </Card>
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
        {/* JOIN / DONATE → only for non-owners */}
        {!authLoading && !isOwner && (
          <>
            <Button variant="outline">Join Committee</Button>
            <Link
              href={`/community/${community}/committee/${scopeType}/${scopeCode}/donate`}
              className="inline-flex items-center justify-center rounded-md border bg-black text-white px-4 py-2 text-sm font-medium"
            >
              Donate
            </Link>
          </>
        )}

        {/* MANAGE → only for owner */}
        {!authLoading && isOwner && (
          <Link
            href={`/manage/community/${community}/committee/${scopeType}/${scopeCode}/settings`}
            className="inline-flex items-center justify-center rounded-md border bg-black text-white px-4 py-2 text-sm font-medium"
          >
            Manage Committee
          </Link>
        )}
      </div>
    </div>
  );
}