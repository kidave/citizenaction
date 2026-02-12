// pages/community/[community]/club/[scopeType]/[scopeCode].js
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
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
import PageHeaderSkeleton from "@/components/skeletons/PageHeaderSkeleton";
import MetaCardsSkeleton from "@/components/skeletons/MetaCardsSkeleton";
import { useClubs } from "@/hooks/useClubs";

export default function ClubPage() {
  const router = useRouter();
  const { community, scopeType, scopeCode } = router.query;
  const { user, loading: authLoading } = useAuth();

  const toTitleCase = (value = "") =>
    value
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());


  const {
    data: clubs = [],
    isLoading: clubLoading,
    error,
  } = useClubs({
    communitySlug: community,
    scopeType,
    scopeCode,
    enabled: !!community && !!scopeType && !!scopeCode,
  });

  const club = clubs?.[0];


  /* ---------------- LOADING ---------------- */
  if (clubLoading || !community || !scopeType || !scopeCode) {
    return (
      <div className="max-w-6xl mx-auto my-auto px-4 py-4 space-y-4">
        <PageHeaderSkeleton />
        <MetaCardsSkeleton />
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error || !club) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Club not found</h2>
        <p className="text-muted-foreground mt-2">
          The requested club does not exist or is unavailable.
        </p>
        <Link href={`/community/${community}`}>
          <Button variant="outline" className="mt-4">
            Back to Community
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = !!user && user.id === club.owner_user_id;

  /* ---------------- PAGE ---------------- */
  return (
    <div
      className="max-w-6xl mx-auto my-auto px-4 py-4 space-y-4"
      style={
        club.primary_color
          ? { "--club-primary": club.primary_color }
          : undefined
      }
    >
      {/* ================= HEADER ================= */}
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* LOGO */}
          {club.logo_url && (
            <Image
              src={club.logo_url}
              alt={`${club.name} logo`}
              width={32}
              height={32}
              className="h-14 w-14 rounded-md object-contain border"
            />
          )}

          {/* NAME & BADGE */}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {club.name}
            </h1>
            {club.scope_type && (
              <Badge className="ml-2">{club.scope_type.toUpperCase()}</Badge>
            )}
          </div>
        </div>

        {/* DESCRIPTION */}
        {club.description && (
          <p className="text-muted-foreground max-w-3xl">
            {club.description}
          </p>
        )}
      </header>

      {/* ================= META CARDS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Owner */}
        <Card className="border-l-4" style={{ borderLeftColor: "var(--club-primary)" }}>
          <CardHeader>
            <CardTitle>Club Owner</CardTitle>
            <CardDescription>
              Primary point of contact
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <Image
                src={club.owner_avatar_url || "/user1.png"}
                alt={club.owner_name || "Owner"}
                width={32}
                height={32}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="font-medium">
                {club.owner_name || "Unnamed user"}
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
            {club.email && <div>{club.email}</div>}
            {club.contact_number && <div>{club.contact_number}</div>}
            {!club.email && !club.contact_number && (
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
            {club.website ? (
              <Link
                href={club.website}
                target="_blank"
                className="underline underline-offset-4 text-sm"
              >
                {club.website}
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
              Club members and volunteers
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
            <Button variant="outline">Join Club</Button>
            <Link
              href={`/community/${community}/club/${scopeType}/${scopeCode}/donate`}
              className="inline-flex items-center justify-center rounded-md border bg-black text-white px-4 py-2 text-sm font-medium"
            >
              Donate
            </Link>
          </>
        )}

        {/* MANAGE → only for owner */}
        {!authLoading && isOwner && (
          <Link
            href={`/manage/${community}/club/${scopeType}/${scopeCode}/settings`}
            className="inline-flex items-center justify-center rounded-md border bg-black text-white px-4 py-2 text-sm font-medium"
          >
            Manage Club
          </Link>
        )}
      </div>
    </div>
  );
}