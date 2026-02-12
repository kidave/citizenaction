// pages/community/index.js
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import SearchFiltersSkeleton from "@/components/skeletons/SearchFiltersSkeleton";
import CardGridSkeleton from "@/components/skeletons/CardGridSkeleton";

import { useCommunities } from "@/hooks/useCommunities";
import { useClubs } from "@/hooks/useClubs";

export default function UnifiedSearchPage() {
  const [searchType, setSearchType] = useState("community");
  const [search, setSearch] = useState("");
  const [scopeType, setScopeType] = useState("all");
  const [communitySlug, setCommunitySlug] = useState("all");

  const {
    data: communities = [],
    isLoading: communitiesLoading,
  } = useCommunities({
    search: searchType === "community" ? search : undefined,
  });

  const {
    data: clubs = [],
    isLoading: clubsLoading,
  } = useClubs({
    search: searchType === "club" ? search : undefined,
    scopeType,
    communitySlug,
  });

  const isLoading = communitiesLoading || clubsLoading;

  const scopeTypes = [...new Set(clubs.map((c) => c.scope_type))].filter(Boolean);
  const communityOptions = [...new Set(clubs.map((c) => c.community_slug))].filter(Boolean);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        <SearchFiltersSkeleton />
        <CardGridSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search communities or clubs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />

        <div className="flex gap-2">
          <Button
            variant={searchType === "community" ? "default" : "outline"}
            onClick={() => setSearchType("community")}
          >
            Communities
          </Button>
          <Button
            variant={searchType === "club" ? "default" : "outline"}
            onClick={() => setSearchType("club")}
          >
            Clubs
          </Button>
        </div>

        {searchType === "club" && (
          <>
            <Select value={scopeType} onValueChange={setScopeType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {scopeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={communitySlug} onValueChange={setCommunitySlug}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Community" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Communities</SelectItem>
                {communityOptions.map((slug) => (
                  <SelectItem key={slug} value={slug}>
                    {slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        <div className="text-sm text-muted-foreground">
          {searchType === "community"
            ? `Showing ${communities.length} communities`
            : `Showing ${clubs.length} clubs`}
        </div>
      </div>

      {searchType === "community" ? (
        communities.length === 0 ? (
          <EmptyState label="communities" />
        ) : (
          <Grid>
            {communities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </Grid>
        )
      ) : clubs.length === 0 ? (
        <EmptyState label="clubs" />
      ) : (
        <Grid>
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </Grid>
      )}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{children}</div>;
}

function EmptyState({ label }) {
  return (
    <div className="text-center py-16">
      <h3 className="text-xl font-semibold">No {label} found</h3>
      <p className="text-muted-foreground mt-2">
        Try adjusting your search or filters
      </p>
    </div>
  );
}

function CommunityCard({ community }) {
  return (
    <Card className="relative overflow-hidden">
      {/* Cover Image */}
      {community.cover_url ? (
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
          <Image
            src={community.cover_url}
            alt={`${community.name} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />

          {community.logo_url && (
            <div className="absolute bottom-4 left-4 z-20">
              <Image
                src={community.logo_url}
                alt={`${community.name} logo`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-md border bg-background object-contain"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 bg-muted flex items-center justify-center">
          {community.logo_url && (
            <Image
              src={community.logo_url}
              alt={`${community.name} logo`}
              width={80}
              height={80}
              className="object-contain"
            />
          )}
        </div>
      )}

      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-xl line-clamp-1">
            {community.name}
          </h3>
        </div>

        {community.description && (
          <p className="text-muted-foreground text-sm line-clamp-3 mb-2">
            {community.description}
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Link
          href={`/community/${community.slug}`}
          className="w-full"
        >
          <Button variant="outline" className="w-full">
            View Community
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function ClubCard({ club }) {
  return (
    <Card className="relative overflow-hidden">
      {/* Cover */}
      {club.cover_url ? (
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
          <Image
            src={club.cover_url}
            alt={`${club.name} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />

          {club.logo_url && (
            <div className="absolute bottom-4 left-4 z-20">
              <Image
                src={club.logo_url}
                alt={`${club.name} logo`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-md border bg-background object-contain"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 bg-muted flex items-center justify-center">
          {club.logo_url && (
            <Image
              src={club.logo_url}
              alt={`${club.name} logo`}
              width={80}
              height={80}
              className="object-contain"
            />
          )}
        </div>
      )}

      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-xl line-clamp-1">
            {club.name}
          </h3>
          {club.scope_type && (
            <Badge variant="outline">{club.scope_type.toUpperCase()}</Badge>
          )}
        </div>

        {/* Community link (IMPORTANT) */}
        <div className="text-sm text-muted-foreground mb-2">
          Community:{" "}
          <Link
            href={`/community/${club.community_slug}`}
            className="font-medium hover:underline"
          >
            {club.community_name}
          </Link>
        </div>

        {club.description && (
          <p className="text-muted-foreground text-sm line-clamp-2">
            {club.description}
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Link
          href={`/community/${club.community_slug}/club/${club.scope_type}/${club.scope_code}`}
          className="w-full"
        >
          <Button variant="outline" className="w-full">
            View Club
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
