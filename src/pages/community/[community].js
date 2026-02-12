// pages/community/[community].js
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import PageHeaderSkeleton from "@/components/skeletons/PageHeaderSkeleton";
import MetaCardsSkeleton from "@/components/skeletons/MetaCardsSkeleton";
import CarouselSkeleton from "@/components/skeletons/CarouselSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { useCommunities } from "@/hooks/useCommunities";
import { useClubs } from "@/hooks/useClubs";

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const slug = router.query.community;

  const {
    data: community,
    isLoading,
    error,
  } = useCommunities({
    slug,
    enabled: !!slug,
  });

  const {
    data: club = [],
    isLoading: clubLoading,
  } = useClubs({
    communitySlug: slug,
    enabled: !!slug,
  });


  /* ---------------- LOADING ---------------- */
  if (isLoading || clubLoading) {
    return (
      <div className="max-w-6xl mx-auto my-auto px-4 py-4 space-y-4">
        <PageHeaderSkeleton />
        <MetaCardsSkeleton />
        <CarouselSkeleton />
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
      className="max-w-6xl mx-auto my-auto px-4 py-4 space-y-4"
      style={
        community.primary_color
          ? { "--community-primary": community.primary_color }
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
          {community.logo_url && (
            <Image
              src={community.logo_url}
              alt={`${community.name} logo`}
              width={32} 
              height={32}
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
              <Image
                src={community.avatar_url || "/user1.png"}
                alt={community.owner_name || "Owner"}
                width={32}
                height={32}
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

      {/* ================= CLUBS SECTION ================= */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Clubs</h2>
          {isOwner && (
            <Link href={`/apply/community/${community.slug}/club`}>
              <Button>Create Club</Button>
            </Link>
          )}
        </div>

        {clubLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CarouselSkeleton className="h-40 w-full" />
            <CarouselSkeleton className="h-40 w-full" />
          </div>
        ) : club.length > 0 ? (
          <div className="relative px-4">
            <Carousel
              opts={{
                align: "start",
                slidesToScroll: 1,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {club.map((club) => (
                  <CarouselItem 
                    key={club.id} 
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <Card className="group relative overflow-hidden transition-all hover:shadow-lg h-full">
                      {/* ===== COVER IMAGE (same as search page) ===== */}
                      {club.cover_url ? (
                        <div className="relative h-40 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                          <Image
                            src={club.cover_url}
                            alt={`${club.name} cover`}
                            fill
                            className="object-cover"
                          />

                          {/* Logo on cover */}
                          {club.logo_url && (
                            <div className="absolute bottom-3 left-3 z-20">
                              <Image
                                src={club.logo_url}
                                alt={`${club.name} logo`}
                                width={32}
                                height={32}
                                className="h-10 w-10 rounded-md border bg-background object-contain shadow-sm"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative h-40 bg-muted/50 flex items-center justify-center">
                          {club.logo_url && (
                            <Image
                              src={club.logo_url}
                              alt={`${club.name} logo`}
                              width={32}
                              height={32}
                              className="h-14 w-14 rounded-md object-contain"
                            />
                          )}
                        </div>
                      )}

                      {/* ===== CARD BODY ===== */}
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-1">
                            {club.name}
                          </CardTitle>

                          {club.scope_type && (
                            <Badge variant="outline" className="shrink-0">
                              {club.scope_type.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent>
                        {club.description && (
                          <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                            {club.description}
                          </p>
                        )}

                        <div className="mt-4 text-xs text-muted-foreground">
                          {club.member_count ? (
                            <span>{club.member_count} members</span>
                          ) : (
                            <span>No members yet</span>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Link
                          href={`/community/${community.slug}/club/${club.scope_type}/${club.scope_code}`}
                          className="w-full"
                        >
                          <Button variant="outline" className="w-full">
                            View Club
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Navigation buttons with proper positioning */}
              <CarouselPrevious 
                className="absolute -left-5 top-1/2 -translate-y-1/2 hidden sm:flex" 
              />
              <CarouselNext 
                className="absolute -right-5 top-1/2 -translate-y-1/2 hidden sm:flex" 
              />
            </Carousel>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Clubs</CardTitle>
              <CardDescription>
                No clubs have been published yet.
              </CardDescription>
            </CardHeader>
            {isOwner && (
              <CardFooter>
                <Link href={`/apply/community/${community.slug}/club`}>
                  <Button>Create First Club</Button>
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
            href={`/manage/${community.slug}`}
            className="inline-flex items-center justify-center rounded-md border bg-black text-white px-4 py-2 text-sm font-medium"
          >
            Manage Community
          </Link>
        )}
      </div>
    </div>
  );
}